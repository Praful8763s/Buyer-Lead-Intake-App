"""
Tests for validation utilities
"""
from django.test import TestCase
from utils.validators import (
    validate_budget_range, 
    validate_phone_number, 
    validate_email
)

class ValidatorTests(TestCase):
    def test_budget_validation(self):
        # Valid budget range
        self.assertTrue(validate_budget_range(1000000, 5000000))
        
        # Invalid - min too low
        self.assertFalse(validate_budget_range(50000, 1000000))
        
        # Invalid - max less than min
        self.assertFalse(validate_budget_range(5000000, 1000000))
    
    def test_phone_validation(self):
        # Valid phone numbers
        self.assertTrue(validate_phone_number('9876543210'))
        self.assertTrue(validate_phone_number('+919876543210'))
        
        # Invalid phone numbers
        self.assertFalse(validate_phone_number('1234567890'))
        self.assertFalse(validate_phone_number('98765'))
    
    def test_email_validation(self):
        # Valid emails
        self.assertTrue(validate_email('test@example.com'))
        self.assertTrue(validate_email('user.name@domain.co.in'))
        
        # Invalid emails
        self.assertFalse(validate_email('invalid-email'))
        self.assertFalse(validate_email('test@'))