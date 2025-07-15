from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import User, Group
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django import forms
from .models import XRay, BodyPart


# Unregister default User and Group admin to customize them
admin.site.unregister(User)
admin.site.unregister(Group)

# Custom User Admin with enhanced functionality
@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """Enhanced User admin for managing medical staff"""
    
    list_display = ['username', 'first_name', 'last_name', 'email', 'get_groups', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'groups', 'date_joined']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    
    # Override fieldsets to include groups in a medical context
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Medical Staff Information', {
            'fields': ('groups',),
            'description': 'Assign user to groups to grant specific permissions for X-ray management'
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    def get_groups(self, obj):
        """Display user groups with nice formatting"""
        groups = obj.groups.all()
        if groups:
            group_names = [group.name for group in groups]
            return ', '.join(group_names)
        return 'No groups'
    get_groups.short_description = 'Groups'

# Custom Group Admin
@admin.register(Group)
class CustomGroupAdmin(BaseGroupAdmin):
    """Enhanced Group admin for managing roles and permissions"""
    
    list_display = ['name', 'get_permissions_count', 'get_users_count']
    search_fields = ['name']
    
    def get_permissions_count(self, obj):
        """Show number of permissions"""
        count = obj.permissions.count()
        return f"{count} permissions"
    get_permissions_count.short_description = 'Permissions'
    
    def get_users_count(self, obj):
        """Show number of users in group"""
        count = obj.user_set.count()
        return f"{count} users"
    get_users_count.short_description = 'Users'

@admin.register(BodyPart)
class BodyPartAdmin(admin.ModelAdmin):
    """
    Admin interface for managing X-ray body part categories
    """
    list_display = [
        'name',
        'description_short',
        'is_active',
        'xray_count',
        'created_at'
    ]
    
    list_filter = [
        'is_active',
        'created_at'
    ]
    
    search_fields = [
        'name',
        'description'
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active'),
            'description': 'Manage X-ray body part categories that can be used for new scans'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def description_short(self, obj):
        """Show shortened description"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return 'No description'
    description_short.short_description = 'Description'
    
    def xray_count(self, obj):
        """Show count of X-rays using this body part"""
        count = XRay.objects.filter(body_part=obj.name).count()
        if count > 0:
            url = reverse('admin:xray_search_xray_changelist') + f'?body_part__exact={obj.name}'
            return format_html('<a href="{}">{} X-rays</a>', url, count)
        return '0 X-rays'
    xray_count.short_description = 'X-ray Count'
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of body parts that have associated X-rays"""
        if obj and XRay.objects.filter(body_part=obj.name).exists():
            return False  # Don't allow deletion if X-rays exist
        return request.user.is_staff


class XRayAdminForm(forms.ModelForm):
    """Custom form for XRay admin with dynamic body part choices"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Get dynamic body part choices from BodyPart model + static choices
        static_choices = [choice[0] for choice in XRay.BODY_PART_CHOICES]
        dynamic_choices = list(BodyPart.objects.filter(is_active=True).values_list('name', flat=True))
        
        # Combine choices (dynamic first, then static that aren't already included)
        all_choices = []
        seen = set()
        
        for bp in dynamic_choices:
            if bp not in seen:
                all_choices.append((bp, bp))
                seen.add(bp)
        
        for bp in static_choices:
            if bp not in seen:
                all_choices.append((bp, bp))
                seen.add(bp)
        
        # Set the choices for body_part field
        self.fields['body_part'].widget = forms.Select(choices=[('', '--------')] + all_choices)
    
    class Meta:
        model = XRay
        fields = '__all__'

@admin.register(XRay)
class XRayAdmin(admin.ModelAdmin):
    """
    Enhanced admin interface for X-ray scan management
    """
    form = XRayAdminForm
    
    list_display = [
        'patient_id_display',
        'image_thumbnail', 
        'body_part_display',
        'diagnosis', 
        'institution', 
        'scan_date', 
        'get_tags_display',
        'created_at'
    ]
    
    list_display_links = ['patient_id_display', 'image_thumbnail']
    
    list_filter = [
        'body_part',
        'institution',
        'diagnosis',
        'scan_date',
        'created_at'
    ]
    
    search_fields = [
        'patient_id',
        'description',
        'diagnosis',
        'institution',
        'tags'
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    
    list_per_page = 25
    
    ordering = ['-created_at']
    
    date_hierarchy = 'scan_date'
    
    actions = ['mark_as_normal', 'export_to_csv', 'delete_selected']
    
    # Enable delete functionality for all staff users
    def has_delete_permission(self, request, obj=None):
        """Allow all staff users to delete X-rays"""
        return request.user.is_staff
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('patient_id', 'scan_date', 'institution'),
            'description': 'Basic patient and scan information'
        }),
        ('X-ray Details', {
            'fields': ('image', 'image_preview', 'body_part', 'diagnosis', 'description', 'tags'),
            'description': 'Medical imaging details and findings.'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'System-generated timestamps'
        })
    )
    
    def patient_id_display(self, obj):
        """Display patient ID with formatting"""
        return format_html(
            '<strong style="font-family: monospace; color: #0066cc;">{}</strong>',
            obj.patient_id
        )
    patient_id_display.short_description = 'Patient ID'
    patient_id_display.admin_order_field = 'patient_id'
    
    def body_part_display(self, obj):
        """Display body part"""
        return format_html(
            '<span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 4px; font-size: 11px;">{}</span>',
            obj.body_part
        )
    body_part_display.short_description = 'Body Part'
    body_part_display.admin_order_field = 'body_part'
    
    def image_thumbnail(self, obj):
        """Display small thumbnail of X-ray image"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return format_html('<div style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">No Image</div>')
    image_thumbnail.short_description = 'Image'
    
    def image_preview(self, obj):
        """Display larger preview of X-ray image"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        return "No image uploaded"
    image_preview.short_description = 'Image Preview'
    
    def get_tags_display(self, obj):
        """Display tags with better formatting"""
        if obj.tags:
            tags_html = ''.join([
                f'<span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; margin: 1px; border-radius: 12px; font-size: 11px; display: inline-block;">{tag}</span>'
                for tag in obj.tags[:5]  # Show only first 5 tags
            ])
            if len(obj.tags) > 5:
                tags_html += f'<span style="color: #666; font-size: 11px;"> +{len(obj.tags) - 5} more</span>'
            return mark_safe(tags_html)
        return format_html('<span style="color: #999; font-style: italic;">No tags</span>')
    get_tags_display.short_description = 'Tags'
    
    def mark_as_normal(self, request, queryset):
        """Bulk action to mark selected X-rays as normal"""
        count = queryset.update(diagnosis='Normal')
        self.message_user(request, f'{count} X-ray(s) marked as normal.')
    mark_as_normal.short_description = "Mark selected X-rays as normal"
    
    def export_to_csv(self, request, queryset):
        """Export selected X-rays to CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="xrays.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Patient ID', 'Body Part', 'Diagnosis', 'Institution', 
            'Scan Date', 'Description', 'Tags', 'Created At'
        ])
        
        for xray in queryset:
            writer.writerow([
                xray.patient_id,
                xray.get_body_part_display(),
                xray.diagnosis,
                xray.institution,
                xray.scan_date,
                xray.description,
                ', '.join(xray.tags) if xray.tags else '',
                xray.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_to_csv.short_description = "Export selected X-rays to CSV"
    
    def changelist_view(self, request, extra_context=None):
        """Add custom context to changelist view"""
        extra_context = extra_context or {}
        
        # Add statistics
        total_xrays = XRay.objects.count()
        body_part_stats = {}
        
        # Get stats from both old and new body part fields
        for choice in XRay.BODY_PART_CHOICES:
            body_part = choice[0]
            count = XRay.objects.filter(body_part=body_part).count()
            if count > 0:
                body_part_stats[body_part] = count
        
        # Add stats from BodyPart categories
        for body_part_cat in BodyPart.objects.filter(is_active=True):
            count = XRay.objects.filter(body_part=body_part_cat.name).count()
            if count > 0:
                body_part_stats[body_part_cat.name] = count
        
        extra_context.update({
            'total_xrays': total_xrays,
            'body_part_stats': body_part_stats,
        })
        
        return super().changelist_view(request, extra_context)
    
    class Media:
        css = {
            'all': (
                'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
            )
        }
        js = (
            'admin/js/admin_enhancements.js',
        )
