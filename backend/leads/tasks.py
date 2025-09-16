import csv
import io
from .models import Buyer, BuyerHistory
from .serializers import BuyerSerializer
from utils.validators import validate_csv_row

def process_csv_import(file, user=None):
    """Process CSV import with validation and error reporting"""
    
    try:
        # Read CSV content
        content = file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(content))
        
        results = {
            'total_rows': 0,
            'valid_rows': 0,
            'invalid_rows': 0,
            'errors': [],
            'created_buyers': []
        }
        
        # Check row limit
        rows = list(csv_reader)
        if len(rows) > 200:
            return {
                'error': 'CSV file contains more than 200 rows. Please split into smaller files.'
            }
        
        results['total_rows'] = len(rows)
        
        valid_buyers = []
        
        for row_num, row in enumerate(rows, start=2):  # Start from 2 (header is row 1)
            # Validate row using the validator
            validation_result = validate_csv_row(row)
            
            if 'errors' in validation_result:
                results['errors'].append({
                    'row': row_num,
                    'error': '; '.join(validation_result['errors']),
                    'data': row
                })
                results['invalid_rows'] += 1
            else:
                valid_buyers.append(validation_result['data'])
                results['valid_rows'] += 1
        
        # Bulk create valid buyers
        if valid_buyers:
            created_buyers = []
            owner_id = str(user.id) if user and hasattr(user, 'id') else 'anonymous'
            
            for buyer_data in valid_buyers:
                buyer_data['owner_id'] = owner_id
                buyer = Buyer(**buyer_data)
                buyer.save()
                created_buyers.append(buyer.id)
                
                # Create history entry
                BuyerHistory(
                    buyer_id=buyer.id,
                    changed_by=owner_id,
                    diff={'action': 'imported_from_csv'}
                ).save()
            
            results['created_buyers'] = created_buyers
        
        return results
        
    except Exception as e:
        return {
            'error': f'Failed to process CSV file: {str(e)}'
        }

def generate_csv_template():
    """Generate a CSV template with sample data"""
    template_data = [
        {
            'full_name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone': '9876543210',
            'city': 'mumbai',
            'property_type': 'apartment',
            'bhk': '2bhk',
            'purpose': 'buy',
            'budget_min': '5000000',
            'budget_max': '8000000',
            'timeline': '3months',
            'source': 'website',
            'status': 'new',
            'notes': 'Looking for a 2BHK apartment in Mumbai',
            'tags': 'urgent, first-time-buyer'
        },
        {
            'full_name': 'Jane Smith',
            'email': 'jane.smith@example.com',
            'phone': '9876543211',
            'city': 'delhi',
            'property_type': 'villa',
            'bhk': '3bhk',
            'purpose': 'investment',
            'budget_min': '10000000',
            'budget_max': '15000000',
            'timeline': '6months',
            'source': 'referral',
            'status': 'contacted',
            'notes': 'Interested in villa for investment',
            'tags': 'investor, high-budget'
        }
    ]
    
    return template_data