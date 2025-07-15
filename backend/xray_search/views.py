from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import XRay, BodyPart
from .serializers import XRaySerializer, XRayListSerializer, XRayCreateSerializer
from .filters import XRayFilter


@api_view(['GET'])
def api_root(request):
    """
    API Root - Medical Image Search Platform
    
    Available endpoints:
    - GET /api/xrays/ - List all X-ray scans
    - POST /api/xrays/ - Create new X-ray scan
    - GET /api/xrays/{id}/ - Get specific X-ray scan
    - GET /api/xrays/search_advanced/ - Advanced search
    - GET /api/xrays/stats/ - Get statistics
    - GET /api/xrays/body_parts/ - Get available body parts
    - GET /api/xrays/institutions/ - Get institutions
    - GET /api/xrays/diagnoses/ - Get diagnoses
    
    Query parameters for filtering:
    - search: Search across description, diagnosis, tags
    - body_part: Filter by body part
    - diagnosis: Filter by diagnosis
    - institution: Filter by institution
    - date_from: Filter by scan date from
    - date_to: Filter by scan date to
    """
    return Response({
        'message': 'Welcome to Medical Image Search Platform API',
        'endpoints': {
            'xrays_list': request.build_absolute_uri('/api/xrays/'),
            'xrays_create': request.build_absolute_uri('/api/xrays/'),
            'advanced_search': request.build_absolute_uri('/api/xrays/search_advanced/'),
            'statistics': request.build_absolute_uri('/api/xrays/stats/'),
            'body_parts': request.build_absolute_uri('/api/xrays/body_parts/'),
            'institutions': request.build_absolute_uri('/api/xrays/institutions/'),
            'diagnoses': request.build_absolute_uri('/api/xrays/diagnoses/'),
            'admin': request.build_absolute_uri('/admin/'),
        },
        'sample_queries': {
            'search_pneumonia': request.build_absolute_uri('/api/xrays/?search=pneumonia'),
            'filter_chest': request.build_absolute_uri('/api/xrays/?body_part=Chest'),
            'filter_mayo_clinic': request.build_absolute_uri('/api/xrays/?institution=Mayo Clinic'),
        }
    })


class XRayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for X-ray scan management with advanced search and filtering
    
    Provides:
    - List all X-rays with pagination
    - Create new X-ray records
    - Retrieve individual X-ray details
    - Update X-ray records
    - Delete X-ray records
    - Advanced search across multiple fields
    - Filtering by body_part, diagnosis, institution
    """
    
    queryset = XRay.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = XRayFilter
    
    # Search across description, diagnosis, and tags
    search_fields = ['description', 'diagnosis', 'tags', 'patient_id', 'institution']
    
    # Allow ordering by various fields
    ordering_fields = ['scan_date', 'created_at', 'patient_id', 'body_part', 'diagnosis']
    ordering = ['-created_at']  # Default ordering
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return XRayListSerializer
        elif self.action == 'create':
            return XRayCreateSerializer
        return XRaySerializer
    
    def get_queryset(self):
        """
        Optionally filter the queryset based on query parameters
        """
        queryset = XRay.objects.all()
        
        # Custom search parameter for advanced search
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(description__icontains=search_query) |
                Q(diagnosis__icontains=search_query) |
                Q(tags__icontains=search_query) |
                Q(patient_id__icontains=search_query) |
                Q(institution__icontains=search_query)
            )
        
        # Filter by body part
        body_part = self.request.query_params.get('body_part', None)
        if body_part:
            queryset = queryset.filter(body_part__iexact=body_part)
        
        # Filter by diagnosis
        diagnosis = self.request.query_params.get('diagnosis', None)
        if diagnosis:
            queryset = queryset.filter(diagnosis__icontains=diagnosis)
        
        # Filter by institution
        institution = self.request.query_params.get('institution', None)
        if institution:
            queryset = queryset.filter(institution__icontains=institution)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(scan_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scan_date__lte=date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        """
        Advanced search endpoint with multiple criteria
        
        Query parameters:
        - q: General search query
        - body_part: Filter by body part
        - diagnosis: Filter by diagnosis
        - institution: Filter by institution
        - date_from: Filter by scan date from
        - date_to: Filter by scan date to
        - tags: Filter by tags (comma-separated)
        """
        queryset = self.get_queryset()
        
        # Tag-based filtering
        tags = request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag)
        
        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = XRayListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = XRayListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about X-ray scans
        """
        total_scans = XRay.objects.count()
        
        # Count by body part - get all unique body parts from actual data
        body_part_stats = {}
        
        # Get all distinct body parts from X-rays
        distinct_body_parts = XRay.objects.values_list('body_part', flat=True).distinct()
        for body_part in distinct_body_parts:
            if body_part:  # Skip empty values
                count = XRay.objects.filter(body_part=body_part).count()
                body_part_stats[body_part] = count
        
        # Count by institution
        institution_stats = {}
        institutions = XRay.objects.values_list('institution', flat=True).distinct()
        for institution in institutions:
            count = XRay.objects.filter(institution=institution).count()
            institution_stats[institution] = count
        
        # Recent scans count (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now().date() - timedelta(days=30)
        recent_scans = XRay.objects.filter(scan_date__gte=thirty_days_ago).count()
        
        return Response({
            'total_scans': total_scans,
            'body_part_distribution': body_part_stats,
            'institution_distribution': institution_stats,
            'recent_scans_30_days': recent_scans
        })
    
    @action(detail=False, methods=['get'])
    def body_parts(self, request):
        """
        Get list of available body parts including both static choices and dynamic BodyPart model entries
        """
        # Get static choices
        static_body_parts = [choice[0] for choice in XRay.BODY_PART_CHOICES]
        
        # Get active body parts from BodyPart model
        dynamic_body_parts = list(BodyPart.objects.filter(is_active=True).values_list('name', flat=True))
        
        # Combine and remove duplicates while preserving order
        all_body_parts = []
        seen = set()
        
        # Add dynamic body parts first (they take priority)
        for bp in dynamic_body_parts:
            if bp not in seen:
                all_body_parts.append(bp)
                seen.add(bp)
        
        # Add static body parts that aren't already included
        for bp in static_body_parts:
            if bp not in seen:
                all_body_parts.append(bp)
                seen.add(bp)
        
        return Response({
            'body_parts': all_body_parts
        })
    
    @action(detail=False, methods=['get'])
    def institutions(self, request):
        """
        Get list of institutions with X-ray data
        """
        institutions = XRay.objects.values_list('institution', flat=True).distinct().order_by('institution')
        return Response({
            'institutions': list(institutions)
        })
    
    @action(detail=False, methods=['get'])
    def diagnoses(self, request):
        """
        Get list of unique diagnoses
        """
        diagnoses = XRay.objects.values_list('diagnosis', flat=True).distinct().order_by('diagnosis')
        return Response({
            'diagnoses': list(diagnoses)
        })


@api_view(['GET'])
def elasticsearch_search(request):
    """
    Simple Elasticsearch search endpoint
    """
    query = request.GET.get('q', '')
    
    if not query:
        return Response({'error': 'Please provide a search query with ?q=your_search_term'})
    
    try:
        from .documents import XRayDocument
        
        # Perform search
        search = XRayDocument.search()
        search = search.query("multi_match", query=query, fields=['patient_id', 'body_part', 'description', 'diagnosis', 'institution', 'tags'])
        
        # Execute search
        response = search[:20].execute()
        
        # Format results
        results = []
        for hit in response:
            # Get the actual XRay object to access image field
            try:
                xray_obj = XRay.objects.get(id=hit.id)
                image_url = request.build_absolute_uri(xray_obj.image.url) if xray_obj.image else None
            except XRay.DoesNotExist:
                image_url = None
            
            results.append({
                'id': hit.id,
                'patient_id': hit.patient_id,
                'body_part': hit.body_part,
                'diagnosis': hit.diagnosis,
                'description': hit.description,
                'institution': hit.institution,
                'tags': hit.tags,
                'tags_display': hit.tags,  # For compatibility
                'scan_date': hit.scan_date,
                'image': getattr(hit, 'image', ''),
                'image_url': image_url,
                'created_at': getattr(hit, 'created_at', ''),
                'updated_at': getattr(hit, 'updated_at', ''),
                'score': hit.meta.score
            })
        
        return Response({
            'query': query,
            'total_hits': response.hits.total.value,
            'results': results
        })
        
    except Exception as e:
        return Response({
            'error': f'Search failed: {str(e)}',
            'query': query
        }, status=500)
