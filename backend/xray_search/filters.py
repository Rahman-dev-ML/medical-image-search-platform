import django_filters
from django.db.models import Q
from .models import XRay


class XRayFilter(django_filters.FilterSet):
    """
    Advanced filtering for X-ray scans
    """
    
    # Text search across multiple fields
    search = django_filters.CharFilter(method='filter_search', label='Search')
    
    # Exact match filters
    body_part = django_filters.CharFilter(
        field_name='body_part',
        lookup_expr='iexact',
        label='Body Part'
    )
    
    # Case-insensitive partial match filters
    diagnosis = django_filters.CharFilter(
        field_name='diagnosis',
        lookup_expr='icontains',
        label='Diagnosis'
    )
    
    institution = django_filters.CharFilter(
        field_name='institution',
        lookup_expr='icontains',
        label='Institution'
    )
    
    patient_id = django_filters.CharFilter(
        field_name='patient_id',
        lookup_expr='icontains',
        label='Patient ID'
    )
    
    # Date range filters
    scan_date_from = django_filters.DateFilter(
        field_name='scan_date',
        lookup_expr='gte',
        label='Scan Date From'
    )
    
    scan_date_to = django_filters.DateFilter(
        field_name='scan_date',
        lookup_expr='lte',
        label='Scan Date To'
    )
    
    # Date range filter (alternative syntax)
    scan_date = django_filters.DateFromToRangeFilter(
        field_name='scan_date',
        label='Scan Date Range'
    )
    
    # Tags filter
    tags = django_filters.CharFilter(
        method='filter_tags',
        label='Tags'
    )
    
    # Created date filters
    created_from = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte',
        label='Created From'
    )
    
    created_to = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte',
        label='Created To'
    )
    
    class Meta:
        model = XRay
        fields = {
            'body_part': ['exact'],
            'diagnosis': ['icontains'],
            'institution': ['icontains'],
            'patient_id': ['icontains', 'exact'],
            'scan_date': ['exact', 'gte', 'lte'],
            'created_at': ['exact', 'gte', 'lte'],
        }
    
    def filter_search(self, queryset, name, value):
        """
        Custom search filter across multiple fields
        """
        if not value:
            return queryset
        
        return queryset.filter(
            Q(description__icontains=value) |
            Q(diagnosis__icontains=value) |
            Q(tags__icontains=value) |
            Q(patient_id__icontains=value) |
            Q(institution__icontains=value)
        )
    
    def filter_tags(self, queryset, name, value):
        """
        Filter by tags (supports comma-separated values)
        """
        if not value:
            return queryset
        
        # Split by comma and filter by each tag
        tags = [tag.strip() for tag in value.split(',')]
        
        # Filter by all tags (AND operation)
        for tag in tags:
            queryset = queryset.filter(tags__icontains=tag)
        
        return queryset 