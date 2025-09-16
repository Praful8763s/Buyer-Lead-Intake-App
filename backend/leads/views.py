from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from .models import Buyer, BuyerHistory
from .serializers import BuyerSerializer, BuyerHistorySerializer, CSVImportSerializer
from .tasks import process_csv_import
import csv
import io

class BuyerListCreateView(generics.ListCreateAPIView):
    serializer_class = BuyerSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Buyer.objects.all()
        
        # Search functionality
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                full_name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                phone__icontains=search
            )
        
        # Filters
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city=city)
            
        property_type = self.request.query_params.get('propertyType')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
            
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        timeline = self.request.query_params.get('timeline')
        if timeline:
            queryset = queryset.filter(timeline=timeline)
        
        # Sorting
        ordering = self.request.query_params.get('ordering', '-updated_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    @method_decorator(ratelimit(key='user', rate='10/m', method='POST'))
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class BuyerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BuyerSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Buyer.objects.all()
    
    def get_object(self):
        return super().get_object()
    
    @method_decorator(ratelimit(key='user', rate='20/m', method=['PUT', 'PATCH']))
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    @method_decorator(ratelimit(key='user', rate='20/m', method=['PUT', 'PATCH']))
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class BuyerHistoryView(generics.ListAPIView):
    serializer_class = BuyerHistorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        buyer_id = self.kwargs['buyer_id']
        return BuyerHistory.objects.filter(buyer_id=buyer_id).order_by('-changed_at')[:5]


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='user', rate='3/m', method='POST')
def csv_import(request):
    serializer = CSVImportSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    file = serializer.validated_data['file']
    result = process_csv_import(file, getattr(request, 'user', None))
    
    return Response(result, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def csv_template(request):
    """Download CSV template with sample data"""
    from .tasks import generate_csv_template
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="buyer_leads_template.csv"'
    
    template_data = generate_csv_template()
    if template_data:
        fieldnames = template_data[0].keys()
        writer = csv.DictWriter(response, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(template_data)
    
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """Get dashboard statistics"""
    try:
        # Total leads
        total_leads = Buyer.objects.count()
        
        # Leads by status
        status_counts = {}
        for status_code, status_name in Buyer.STATUS_CHOICES:
            count = Buyer.objects.filter(status=status_code).count()
            status_counts[status_code] = {
                'name': status_name,
                'count': count
            }
        
        # Leads by city
        city_counts = {}
        for city_code, city_name in Buyer.CITY_CHOICES:
            count = Buyer.objects.filter(city=city_code).count()
            city_counts[city_code] = {
                'name': city_name,
                'count': count
            }
        
        # Leads by property type
        property_counts = {}
        for prop_code, prop_name in Buyer.PROPERTY_TYPE_CHOICES:
            count = Buyer.objects.filter(property_type=prop_code).count()
            property_counts[prop_code] = {
                'name': prop_name,
                'count': count
            }
        
        # Recent leads (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_leads = Buyer.objects.filter(created_at__gte=week_ago).count()
        
        # Budget analysis
        if total_leads > 0:
            # Average budget
            from mongoengine import Q
            buyers_with_budget = Buyer.objects.filter(
                Q(budget_min__gt=0) & Q(budget_max__gt=0)
            )
            if buyers_with_budget.count() > 0:
                avg_budget_min = sum(b.budget_min for b in buyers_with_budget) / buyers_with_budget.count()
                avg_budget_max = sum(b.budget_max for b in buyers_with_budget) / buyers_with_budget.count()
            else:
                avg_budget_min = avg_budget_max = 0
            
            # Budget ranges
            budget_ranges = {
                'under_50L': buyers_with_budget.filter(budget_max__lt=5000000).count(),
                '50L_1Cr': buyers_with_budget.filter(
                    Q(budget_min__gte=5000000) & Q(budget_max__lt=10000000)
                ).count(),
                '1Cr_2Cr': buyers_with_budget.filter(
                    Q(budget_min__gte=10000000) & Q(budget_max__lt=20000000)
                ).count(),
                'above_2Cr': buyers_with_budget.filter(budget_min__gte=20000000).count(),
            }
        else:
            avg_budget_min = avg_budget_max = 0
            budget_ranges = {
                'under_50L': 0,
                '50L_1Cr': 0,
                '1Cr_2Cr': 0,
                'above_2Cr': 0,
            }
        
        # Conversion rate (qualified + converted / total)
        qualified_converted = (
            status_counts.get('qualified', {}).get('count', 0) + 
            status_counts.get('converted', {}).get('count', 0)
        )
        conversion_rate = (qualified_converted / total_leads * 100) if total_leads > 0 else 0
        
        # Timeline analysis
        timeline_counts = {}
        for timeline_code, timeline_name in Buyer.TIMELINE_CHOICES:
            count = Buyer.objects.filter(timeline=timeline_code).count()
            timeline_counts[timeline_code] = {
                'name': timeline_name,
                'count': count
            }
        
        stats = {
            'total_leads': total_leads,
            'recent_leads': recent_leads,
            'conversion_rate': round(conversion_rate, 1),
            'avg_budget_min': int(avg_budget_min),
            'avg_budget_max': int(avg_budget_max),
            'status_counts': status_counts,
            'city_counts': city_counts,
            'property_counts': property_counts,
            'budget_ranges': budget_ranges,
            'timeline_counts': timeline_counts,
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_data(request):
    """Get comprehensive analytics data"""
    try:
        from datetime import datetime, timedelta
        from mongoengine import Q
        
        # Date range parameters
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Total leads in date range
        leads_in_range = Buyer.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
        total_leads = leads_in_range.count()
        
        # Daily lead creation trend
        daily_leads = {}
        for i in range(days):
            day = start_date + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            count = Buyer.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
            daily_leads[day.strftime('%Y-%m-%d')] = count
        
        # Lead sources analysis
        source_performance = {}
        for source_code, source_name in Buyer.SOURCE_CHOICES:
            source_leads = leads_in_range.filter(source=source_code)
            source_count = source_leads.count()
            converted_count = source_leads.filter(status__in=['qualified', 'converted']).count()
            conversion_rate = (converted_count / source_count * 100) if source_count > 0 else 0
            
            source_performance[source_code] = {
                'name': source_name,
                'leads': source_count,
                'converted': converted_count,
                'conversion_rate': round(conversion_rate, 1)
            }
        
        # City performance
        city_performance = {}
        for city_code, city_name in Buyer.CITY_CHOICES:
            city_leads = leads_in_range.filter(city=city_code)
            city_count = city_leads.count()
            avg_budget = 0
            if city_count > 0:
                total_budget = sum((b.budget_min + b.budget_max) / 2 for b in city_leads)
                avg_budget = total_budget / city_count
            
            city_performance[city_code] = {
                'name': city_name,
                'leads': city_count,
                'avg_budget': int(avg_budget),
                'percentage': round((city_count / total_leads * 100), 1) if total_leads > 0 else 0
            }
        
        # Property type analysis
        property_analysis = {}
        for prop_code, prop_name in Buyer.PROPERTY_TYPE_CHOICES:
            prop_leads = leads_in_range.filter(property_type=prop_code)
            prop_count = prop_leads.count()
            
            # BHK distribution for apartments and villas
            bhk_dist = {}
            if prop_code in ['apartment', 'villa']:
                for bhk_code, bhk_name in Buyer.BHK_CHOICES:
                    bhk_count = prop_leads.filter(bhk=bhk_code).count()
                    bhk_dist[bhk_code] = {'name': bhk_name, 'count': bhk_count}
            
            property_analysis[prop_code] = {
                'name': prop_name,
                'leads': prop_count,
                'bhk_distribution': bhk_dist,
                'percentage': round((prop_count / total_leads * 100), 1) if total_leads > 0 else 0
            }
        
        # Budget analysis by ranges
        budget_analysis = {
            'under_25L': leads_in_range.filter(budget_max__lt=2500000).count(),
            '25L_50L': leads_in_range.filter(Q(budget_min__gte=2500000) & Q(budget_max__lt=5000000)).count(),
            '50L_75L': leads_in_range.filter(Q(budget_min__gte=5000000) & Q(budget_max__lt=7500000)).count(),
            '75L_1Cr': leads_in_range.filter(Q(budget_min__gte=7500000) & Q(budget_max__lt=10000000)).count(),
            '1Cr_2Cr': leads_in_range.filter(Q(budget_min__gte=10000000) & Q(budget_max__lt=20000000)).count(),
            'above_2Cr': leads_in_range.filter(budget_min__gte=20000000).count(),
        }
        
        # Timeline urgency analysis
        timeline_urgency = {}
        urgency_scores = {
            'immediate': 5,
            '1month': 4,
            '3months': 3,
            '6months': 2,
            '1year': 1
        }
        
        for timeline_code, timeline_name in Buyer.TIMELINE_CHOICES:
            timeline_leads = leads_in_range.filter(timeline=timeline_code)
            timeline_count = timeline_leads.count()
            urgency_score = urgency_scores.get(timeline_code, 0)
            
            timeline_urgency[timeline_code] = {
                'name': timeline_name,
                'leads': timeline_count,
                'urgency_score': urgency_score,
                'percentage': round((timeline_count / total_leads * 100), 1) if total_leads > 0 else 0
            }
        
        analytics = {
            'date_range': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': days
            },
            'total_leads': total_leads,
            'daily_leads': daily_leads,
            'source_performance': source_performance,
            'city_performance': city_performance,
            'property_analysis': property_analysis,
            'budget_analysis': budget_analysis,
            'timeline_urgency': timeline_urgency
        }
        
        return Response(analytics)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_trends(request):
    """Get trend analysis data"""
    try:
        from datetime import datetime, timedelta
        
        # Get monthly trends for the last 12 months
        end_date = datetime.utcnow()
        monthly_trends = {}
        
        for i in range(12):
            month_start = (end_date.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_leads = Buyer.objects.filter(
                created_at__gte=month_start, 
                created_at__lte=month_end
            )
            
            month_key = month_start.strftime('%Y-%m')
            monthly_trends[month_key] = {
                'total_leads': month_leads.count(),
                'new': month_leads.filter(status='new').count(),
                'contacted': month_leads.filter(status='contacted').count(),
                'qualified': month_leads.filter(status='qualified').count(),
                'converted': month_leads.filter(status='converted').count(),
                'lost': month_leads.filter(status='lost').count(),
            }
        
        # Weekly trends for the last 8 weeks
        weekly_trends = {}
        for i in range(8):
            week_start = end_date - timedelta(days=(i+1)*7)
            week_end = end_date - timedelta(days=i*7)
            
            week_leads = Buyer.objects.filter(
                created_at__gte=week_start,
                created_at__lt=week_end
            )
            
            week_key = f"Week {i+1}"
            weekly_trends[week_key] = {
                'leads': week_leads.count(),
                'conversion_rate': 0
            }
            
            if week_leads.count() > 0:
                converted = week_leads.filter(status__in=['qualified', 'converted']).count()
                weekly_trends[week_key]['conversion_rate'] = round(
                    (converted / week_leads.count() * 100), 1
                )
        
        return Response({
            'monthly_trends': monthly_trends,
            'weekly_trends': weekly_trends
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch trends: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_conversion(request):
    """Get conversion funnel analysis"""
    try:
        from datetime import datetime, timedelta
        
        # Date range
        days = int(request.query_params.get('days', 30))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        leads_in_range = Buyer.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
        total_leads = leads_in_range.count()
        
        # Conversion funnel
        funnel_stages = {
            'total_leads': total_leads,
            'contacted': leads_in_range.filter(status__in=['contacted', 'qualified', 'converted']).count(),
            'qualified': leads_in_range.filter(status__in=['qualified', 'converted']).count(),
            'converted': leads_in_range.filter(status='converted').count()
        }
        
        # Calculate conversion rates
        funnel_rates = {}
        if total_leads > 0:
            funnel_rates['contact_rate'] = round((funnel_stages['contacted'] / total_leads * 100), 1)
            funnel_rates['qualification_rate'] = round((funnel_stages['qualified'] / total_leads * 100), 1)
            funnel_rates['conversion_rate'] = round((funnel_stages['converted'] / total_leads * 100), 1)
        else:
            funnel_rates = {'contact_rate': 0, 'qualification_rate': 0, 'conversion_rate': 0}
        
        # Conversion by source
        source_conversion = {}
        for source_code, source_name in Buyer.SOURCE_CHOICES:
            source_leads = leads_in_range.filter(source=source_code)
            source_total = source_leads.count()
            source_converted = source_leads.filter(status='converted').count()
            
            source_conversion[source_code] = {
                'name': source_name,
                'total_leads': source_total,
                'converted': source_converted,
                'conversion_rate': round((source_converted / source_total * 100), 1) if source_total > 0 else 0
            }
        
        # Average time to conversion (mock data for now)
        avg_conversion_time = {
            'immediate': 2,  # days
            '1month': 15,
            '3months': 45,
            '6months': 90,
            '1year': 180
        }
        
        return Response({
            'funnel_stages': funnel_stages,
            'funnel_rates': funnel_rates,
            'source_conversion': source_conversion,
            'avg_conversion_time': avg_conversion_time
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch conversion data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def csv_export(request):
    # Get filtered queryset using same logic as list view
    view = BuyerListCreateView()
    view.request = request
    queryset = view.get_queryset()
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="buyers.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Full Name', 'Email', 'Phone', 'City', 'Property Type', 'BHK',
        'Purpose', 'Budget Min', 'Budget Max', 'Timeline', 'Source',
        'Status', 'Notes', 'Tags', 'Created At', 'Updated At'
    ])
    
    for buyer in queryset:
        writer.writerow([
            buyer.full_name, buyer.email, buyer.phone, buyer.city,
            buyer.property_type, buyer.bhk or '', buyer.purpose,
            buyer.budget_min, buyer.budget_max, buyer.timeline,
            buyer.source, buyer.status, buyer.notes or '',
            ', '.join(buyer.tags or []), buyer.created_at, buyer.updated_at
        ])
    
    return response