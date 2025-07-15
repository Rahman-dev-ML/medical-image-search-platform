from rest_framework import serializers
from .models import XRay


class XRaySerializer(serializers.ModelSerializer):
    """
    Serializer for X-ray scan data with full details
    """
    image_url = serializers.SerializerMethodField()
    tags_display = serializers.SerializerMethodField()
    
    class Meta:
        model = XRay
        fields = [
            'id',
            'patient_id',
            'image',
            'image_url',
            'body_part',
            'scan_date',
            'institution',
            'description',
            'diagnosis',
            'tags',
            'tags_display',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Return the full URL for the image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_tags_display(self, obj):
        """Return tags as a formatted string"""
        return obj.get_tags_display()
    
    def validate_patient_id(self, value):
        """Validate patient ID format"""
        if not value.startswith('P') or not value[1:].isdigit():
            raise serializers.ValidationError(
                "Patient ID must start with P followed by numbers (e.g., P001211, P00128)"
            )
        return value
    
    def validate_tags(self, value):
        """Validate tags are a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")
        
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("Each tag must be a string")
        
        return value


class XRayListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing X-rays (without heavy fields)
    """
    image_url = serializers.SerializerMethodField()
    tags_display = serializers.SerializerMethodField()
    
    class Meta:
        model = XRay
        fields = [
            'id',
            'patient_id',
            'image_url',
            'body_part',
            'scan_date',
            'institution',
            'diagnosis',
            'tags_display',
            'created_at'
        ]
    
    def get_image_url(self, obj):
        """Return the full URL for the image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_tags_display(self, obj):
        """Return tags as a formatted string"""
        return obj.get_tags_display()


class XRayCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new X-ray records
    """
    
    class Meta:
        model = XRay
        fields = [
            'patient_id',
            'image',
            'body_part',
            'scan_date',
            'institution',
            'description',
            'diagnosis',
            'tags'
        ]
    
    def validate_patient_id(self, value):
        """Validate patient ID format"""
        if not value.startswith('P') or not value[1:].isdigit():
            raise serializers.ValidationError(
                "Patient ID must start with P followed by numbers (e.g., P001211, P00128)"
            )
        return value
    
    def validate_tags(self, value):
        """Validate and process tags"""
        if isinstance(value, str):
            # If tags come as a JSON string, parse it
            import json
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                # If it's not valid JSON, treat as comma-separated string
                value = [tag.strip() for tag in value.split(',') if tag.strip()]
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list or comma-separated string")
        
        return value 