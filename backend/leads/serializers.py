from rest_framework import serializers
from .models import Buyer, BuyerHistory
from utils.validators import validate_budget_range, validate_bhk_requirement

class BuyerSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=100)
    phone = serializers.CharField(max_length=15)
    city = serializers.ChoiceField(choices=Buyer.CITY_CHOICES)
    property_type = serializers.ChoiceField(choices=Buyer.PROPERTY_TYPE_CHOICES)
    bhk = serializers.ChoiceField(choices=Buyer.BHK_CHOICES, required=False, allow_blank=True)
    purpose = serializers.ChoiceField(choices=Buyer.PURPOSE_CHOICES)
    budget_min = serializers.IntegerField(min_value=0)
    budget_max = serializers.IntegerField(min_value=0)
    timeline = serializers.ChoiceField(choices=Buyer.TIMELINE_CHOICES)
    source = serializers.ChoiceField(choices=Buyer.SOURCE_CHOICES)
    status = serializers.ChoiceField(choices=Buyer.STATUS_CHOICES, default='new')
    notes = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False)
    owner_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    def validate(self, data):
        try:
            # Validate BHK requirement
            validate_bhk_requirement(data.get('property_type'), data.get('bhk'))
            
            # Validate budget range
            validate_budget_range(data.get('budget_min'), data.get('budget_max'))
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        
        return data
    
    def create(self, validated_data):
        # Use default owner_id if no user is authenticated
        user_id = getattr(self.context.get('request'), 'user', None)
        if user_id and hasattr(user_id, 'id'):
            validated_data['owner_id'] = str(user_id.id)
        else:
            validated_data['owner_id'] = 'anonymous'
        
        buyer = Buyer(**validated_data)
        buyer.save()
        
        # Create history entry
        BuyerHistory(
            buyer_id=buyer.id,
            changed_by=validated_data['owner_id'],
            diff={'action': 'created'}
        ).save()
        
        return buyer
    
    def update(self, instance, validated_data):
        # Track changes for history
        changes = {}
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != new_value:
                changes[field] = f"{old_value} → {new_value}"
        
        # Update instance
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        
        # Create history entry if there are changes
        if changes:
            user_id = getattr(self.context.get('request'), 'user', None)
            changed_by = str(user_id.id) if user_id and hasattr(user_id, 'id') else 'anonymous'
            BuyerHistory(
                buyer_id=instance.id,
                changed_by=changed_by,
                diff=changes
            ).save()
        
        return instance


class BuyerHistorySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    buyer_id = serializers.CharField(read_only=True)
    changed_by = serializers.CharField(read_only=True)
    changed_at = serializers.DateTimeField(read_only=True)
    diff = serializers.DictField(read_only=True)


class CSVImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("File must be a CSV file")
        
        # Check file size (limit to ~5MB for 200 rows)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size too large")
        
        return value