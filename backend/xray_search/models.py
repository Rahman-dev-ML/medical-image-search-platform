from django.db import models
from django.core.validators import RegexValidator
import os


def xray_upload_path(instance, filename):
    """Generate upload path for X-ray images"""
    return f'xrays/{filename}'


class BodyPart(models.Model):
    """
    Model for managing X-ray body part categories
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the body part (e.g., Chest, Knee)"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this body part category includes"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this body part is active for new X-rays"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Body Part Category"
        verbose_name_plural = "Body Part Categories"
        permissions = [
            ("can_manage_body_parts", "Can manage body part categories"),
            ("can_delete_body_parts", "Can delete body part categories"),
        ]
    
    def __str__(self):
        return self.name


class XRay(models.Model):
    """
    Model representing an X-ray scan with metadata for AI model development
    """
    
    # Body part choices for backward compatibility
    BODY_PART_CHOICES = [
        ('Chest', 'Chest'),
        ('Knee', 'Knee'),
        ('Spine', 'Spine'),
        ('Hip', 'Hip'),
        ('Shoulder', 'Shoulder'),
        ('Ankle', 'Ankle'),
        ('Wrist', 'Wrist'),
        ('Elbow', 'Elbow'),
        ('Pelvis', 'Pelvis'),
        ('Abdomen', 'Abdomen'),
    ]
    
    # Core required fields
    patient_id = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^P\d+$', 'Patient ID must start with P followed by numbers')],
        help_text="Patient ID in format P followed by numbers (e.g., P001211, P00128)"
    )
    
    image = models.ImageField(
        upload_to=xray_upload_path,
        help_text="X-ray image file (PNG or JPEG)"
    )
    
    body_part = models.CharField(
        max_length=50,
        help_text="Body part being X-rayed"
    )
    
    scan_date = models.DateField(
        help_text="Date when the X-ray scan was taken"
    )
    
    institution = models.CharField(
        max_length=200,
        help_text="Medical institution where scan was performed"
    )
    
    description = models.TextField(
        help_text="Detailed description of the X-ray findings"
    )
    
    diagnosis = models.CharField(
        max_length=200,
        help_text="Medical diagnosis based on the X-ray"
    )
    
    # Tags field - using JSONField for better compatibility than PostgreSQL ArrayField
    tags = models.JSONField(
        default=list,
        help_text='List of tags for categorization (e.g., ["lung", "infection", "opacity"])'
    )
    
    # Metadata fields for tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "X-ray Scan"
        verbose_name_plural = "X-ray Scans"
        indexes = [
            models.Index(fields=['body_part']),
            models.Index(fields=['diagnosis']),
            models.Index(fields=['institution']),
            models.Index(fields=['scan_date']),
            models.Index(fields=['patient_id']),
        ]
        permissions = [
            ("can_upload_xrays", "Can upload X-ray scans"),
            ("can_delete_xrays", "Can delete X-ray scans"),
            ("can_manage_xrays", "Can manage X-ray scans"),
        ]
    
    def __str__(self):
        return f"{self.patient_id} - {self.get_body_part_display()} ({self.scan_date})"
    
    def get_body_part_display(self):
        """Return the body part name"""
        return self.body_part
    
    def get_image_url(self):
        """Return the URL for the X-ray image"""
        if self.image:
            return self.image.url
        return None
    
    def get_tags_display(self):
        """Return tags as a comma-separated string"""
        if self.tags:
            return ", ".join(self.tags)
        return "No tags"
    
    @property
    def image_filename(self):
        """Return just the filename of the image"""
        if self.image:
            return os.path.basename(self.image.name)
        return None
