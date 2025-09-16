from django.urls import path
from . import views

urlpatterns = [
    path('buyers/', views.BuyerListCreateView.as_view(), name='buyer-list-create'),
    path('buyers/<str:pk>/', views.BuyerDetailView.as_view(), name='buyer-detail'),
    path('buyers/<str:buyer_id>/history/', views.BuyerHistoryView.as_view(), name='buyer-history'),
    path('import/', views.csv_import, name='csv-import'),
    path('export/', views.csv_export, name='csv-export'),
    path('template/', views.csv_template, name='csv-template'),
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('analytics/', views.analytics_data, name='analytics-data'),
    path('analytics/trends/', views.analytics_trends, name='analytics-trends'),
    path('analytics/conversion/', views.analytics_conversion, name='analytics-conversion'),
]