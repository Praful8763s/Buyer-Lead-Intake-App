"""
User models for authentication
"""
from mongoengine import Document, StringField, DateTimeField, BooleanField
from datetime import datetime
import uuid

class User(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    email = StringField(required=True, unique=True, max_length=100)
    password = StringField(required=True)
    full_name = StringField(required=True, max_length=100)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': ['email']
    }
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        super().save(*args, **kwargs)