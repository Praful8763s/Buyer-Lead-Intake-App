"""
Validation utilities for the buyer leads application
"""
from typing import List, Dict, Any
import re

# Budget validation - More flexible ranges
MIN_BUDGET = 50000  # 50K minimum
MAX_BUDGET = 500000000  # 50 Crores maximum

def validate_budget_range(budget_min: int, budget_max: int) -> bool:
    """Validate budget range"""
    # Allow more flexible budget ranges
    if budget_min is None or budget_max is None:
        raise ValueError("Budget min and max are required")
    
    if budget_min < 0 or budget_max < 0:
        raise ValueError("Budget values must be positive")
    
    if budget_max < budget_min:
        raise ValueError("Budget max must be greater than or equal to budget min")
    
    # Only warn if values are outside typical range, don't block
    if budget_min < MIN_BUDGET or budget_max > MAX_BUDGET:
        print(f"Warning: Budget outside typical range ({MIN_BUDGET} - {MAX_BUDGET})")
    
    return True

def validate_bhk_requirement(property_type: str, bhk: str) -> bool:
    """Validate BHK requirement for apartments and villas"""
    if property_type in ['apartment', 'villa'] and not bhk:
        raise ValueError('BHK is required for apartments and villas')
    return True

def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number"""
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, phone.replace('+91', '').replace('-', '').replace(' ', '')))

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# Enum choices
CITY_CHOICES = [
    ('mumbai', 'Mumbai'),
    ('delhi', 'Delhi'),
    ('bangalore', 'Bangalore'),
    ('pune', 'Pune'),
    ('hyderabad', 'Hyderabad'),
]

PROPERTY_TYPE_CHOICES = [
    ('apartment', 'Apartment'),
    ('villa', 'Villa'),
    ('plot', 'Plot'),
    ('commercial', 'Commercial'),
]

BHK_CHOICES = [
    ('1bhk', '1 BHK'),
    ('2bhk', '2 BHK'),
    ('3bhk', '3 BHK'),
    ('4bhk', '4 BHK'),
    ('5bhk', '5+ BHK'),
]

PURPOSE_CHOICES = [
    ('buy', 'Buy'),
    ('rent', 'Rent'),
    ('investment', 'Investment'),
]

TIMELINE_CHOICES = [
    ('immediate', 'Immediate'),
    ('1month', 'Within 1 Month'),
    ('3months', 'Within 3 Months'),
    ('6months', 'Within 6 Months'),
    ('1year', 'Within 1 Year'),
]

SOURCE_CHOICES = [
    ('website', 'Website'),
    ('referral', 'Referral'),
    ('social_media', 'Social Media'),
    ('advertisement', 'Advertisement'),
    ('walk_in', 'Walk In'),
]

STATUS_CHOICES = [
    ('new', 'New'),
    ('contacted', 'Contacted'),
    ('qualified', 'Qualified'),
    ('converted', 'Converted'),
    ('lost', 'Lost'),
]

def validate_enum_choice(value: str, choices: dict) -> bool:
    """Validate if value is in allowed choices"""
    return value in choices.keys()

def validate_csv_row(row_data: dict) -> dict:
    """Validate a single CSV row and return cleaned data"""
    errors = []
    cleaned_data = {}
    
    # Required fields
    required_fields = ['full_name', 'email', 'phone', 'city', 'property_type', 'purpose', 'budget_min', 'budget_max', 'timeline', 'source']
    
    for field in required_fields:
        if field not in row_data or not str(row_data[field]).strip():
            errors.append(f"{field} is required")
        else:
            cleaned_data[field] = str(row_data[field]).strip()
    
    if errors:
        return {'errors': errors}
    
    # Validate email
    if not validate_email(cleaned_data['email']):
        errors.append("Invalid email format")
    
    # Validate phone
    if not validate_phone_number(cleaned_data['phone']):
        errors.append("Invalid phone number format")
    
    # Validate enum choices
    if cleaned_data['city'] not in [choice[0] for choice in CITY_CHOICES]:
        errors.append(f"Invalid city: {cleaned_data['city']}")
    
    if cleaned_data['property_type'] not in [choice[0] for choice in PROPERTY_TYPE_CHOICES]:
        errors.append(f"Invalid property type: {cleaned_data['property_type']}")
    
    if cleaned_data['purpose'] not in [choice[0] for choice in PURPOSE_CHOICES]:
        errors.append(f"Invalid purpose: {cleaned_data['purpose']}")
    
    if cleaned_data['timeline'] not in [choice[0] for choice in TIMELINE_CHOICES]:
        errors.append(f"Invalid timeline: {cleaned_data['timeline']}")
    
    if cleaned_data['source'] not in [choice[0] for choice in SOURCE_CHOICES]:
        errors.append(f"Invalid source: {cleaned_data['source']}")
    
    # Validate budget
    try:
        budget_min = int(float(cleaned_data['budget_min']))
        budget_max = int(float(cleaned_data['budget_max']))
        cleaned_data['budget_min'] = budget_min
        cleaned_data['budget_max'] = budget_max
        validate_budget_range(budget_min, budget_max)
    except (ValueError, TypeError) as e:
        errors.append(f"Invalid budget: {str(e)}")
    
    # Validate BHK if provided
    bhk = row_data.get('bhk', '').strip()
    if bhk:
        if bhk not in [choice[0] for choice in BHK_CHOICES]:
            errors.append(f"Invalid BHK: {bhk}")
        else:
            cleaned_data['bhk'] = bhk
    
    # Validate BHK requirement
    try:
        validate_bhk_requirement(cleaned_data['property_type'], cleaned_data.get('bhk', ''))
    except ValueError as e:
        errors.append(str(e))
    
    # Optional fields
    cleaned_data['status'] = row_data.get('status', 'new').strip()
    if cleaned_data['status'] not in [choice[0] for choice in STATUS_CHOICES]:
        cleaned_data['status'] = 'new'
    
    cleaned_data['notes'] = row_data.get('notes', '').strip()
    
    # Handle tags
    tags_str = row_data.get('tags', '').strip()
    if tags_str:
        cleaned_data['tags'] = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
    else:
        cleaned_data['tags'] = []
    
    if errors:
        return {'errors': errors}
    
    return {'data': cleaned_data}