from mongoengine import Document, StringField, IntField, DateTimeField, ListField, ReferenceField, DictField, ValidationError
from datetime import datetime
import uuid

class Buyer(Document):
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
    
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = StringField(required=True, max_length=100)
    email = StringField(required=True, max_length=100)
    phone = StringField(required=True, max_length=15)
    city = StringField(required=True, choices=CITY_CHOICES)
    property_type = StringField(required=True, choices=PROPERTY_TYPE_CHOICES)
    bhk = StringField(choices=BHK_CHOICES)
    purpose = StringField(required=True, choices=PURPOSE_CHOICES)
    budget_min = IntField(required=True)
    budget_max = IntField(required=True)
    timeline = StringField(required=True, choices=TIMELINE_CHOICES)
    source = StringField(required=True, choices=SOURCE_CHOICES)
    status = StringField(required=True, choices=STATUS_CHOICES, default='new')
    notes = StringField()
    tags = ListField(StringField(max_length=50))
    owner_id = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'buyers',
        'indexes': [
            'owner_id',
            'status',
            'city',
            'property_type',
            'created_at',
            ('full_name', 'email', 'phone'),  # Compound index for search
        ]
    }
    
    def clean(self):
        # Validate BHK requirement for apartments and villas
        if self.property_type in ['apartment', 'villa'] and not self.bhk:
            raise ValidationError('BHK is required for apartments and villas')
        
        # Validate budget range
        if self.budget_max < self.budget_min:
            raise ValidationError('Budget max must be greater than or equal to budget min')
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        super().save(*args, **kwargs)


class BuyerHistory(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    buyer_id = StringField(required=True)
    changed_by = StringField(required=True)
    changed_at = DateTimeField(default=datetime.utcnow)
    diff = DictField()  # Store field changes as {"field": "old → new"}
    
    meta = {
        'collection': 'buyer_history',
        'indexes': [
            'buyer_id',
            'changed_at',
        ]
    }