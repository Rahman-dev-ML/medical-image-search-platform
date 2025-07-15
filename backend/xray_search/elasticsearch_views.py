from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from elasticsearch_dsl import Q
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from django_elasticsearch_dsl_drf.filter_backends import (
    FilteringFilterBackend,
    SearchFilterBackend,
    OrderingFilterBackend,
    DefaultOrderingFilterBackend,
    SuggesterFilterBackend,
)
from django_elasticsearch_dsl_drf.constants import SUGGESTER_COMPLETION
from .documents import XRayDocument
from .serializers import XRaySerializer


class XRayDocumentViewSet(DocumentViewSet):
    """
    Advanced Elasticsearch-powered X-ray search viewset
    """
    document = XRayDocument
    serializer_class = XRaySerializer
    
    filter_backends = [
        FilteringFilterBackend,
        SearchFilterBackend,
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        SuggesterFilterBackend,
    ]
    
    # Define search fields with boosting for relevance
    search_fields = {
        'description': {'boost': 2.0},  # Description gets higher weight
        'description.english': {'boost': 1.5},
        'diagnosis': {'boost': 3.0},  # Diagnosis gets highest weight
        'tags': {'boost': 1.8},
        'patient_id': {'boost': 1.0},
        'institution': {'boost': 1.2},
        'body_part': {'boost': 1.5},
    }
    
    # Define filtering fields
    filter_fields = {
        'body_part': 'body_part.raw',
        'diagnosis': 'diagnosis.raw',
        'institution': 'institution.raw',
        'scan_date': 'scan_date',
        'created_at': 'created_at',
        'patient_id': 'patient_id.raw',
    }
    
    # Define ordering fields
    ordering_fields = {
        'scan_date': 'scan_date',
        'created_at': 'created_at',
        'patient_id': 'patient_id.raw',
        'body_part': 'body_part.raw',
        'diagnosis': 'diagnosis.raw',
    }
    
    # Default ordering
    ordering = ('-created_at',)
    
    # Suggester fields for autocomplete
    suggester_fields = {
        'institution_suggest': {
            'field': 'institution.suggest',
            'suggesters': [
                SUGGESTER_COMPLETION,
            ],
        },
        'diagnosis_suggest': {
            'field': 'diagnosis.suggest',
            'suggesters': [
                SUGGESTER_COMPLETION,
            ],
        },
        'tags_suggest': {
            'field': 'tags.suggest',
            'suggesters': [
                SUGGESTER_COMPLETION,
            ],
        },
    }


@api_view(['GET'])
def elasticsearch_advanced_search(request):
    """
    Advanced Elasticsearch search with medical-specific features
    
    Supports:
    - Fuzzy matching for medical terms
    - Synonym search (pneumonia = lung infection)
    - Multi-field search with boosting
    - Date range filtering
    - Complex boolean queries
    """
    
    # Get search parameters
    query = request.GET.get('q', '')
    body_part = request.GET.get('body_part', '')
    diagnosis = request.GET.get('diagnosis', '')
    institution = request.GET.get('institution', '')
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    tags = request.GET.get('tags', '')
    
    # Build Elasticsearch query
    search = XRayDocument.search()
    
    # Main search query with boosting
    if query:
        search_query = Q(
            'multi_match',
            query=query,
            fields=[
                'description^2.0',
                'description.english^1.5',
                'diagnosis^3.0',
                'tags^1.8',
                'patient_id^1.0',
                'institution^1.2',
                'body_part^1.5'
            ],
            fuzziness='AUTO',  # Enable fuzzy matching for typos
            type='best_fields'
        )
        search = search.query(search_query)
    
    # Apply filters
    filters = []
    
    if body_part:
        filters.append(Q('term', **{'body_part.raw': body_part}))
    
    if diagnosis:
        filters.append(Q('match', diagnosis=diagnosis))
    
    if institution:
        filters.append(Q('match', institution=institution))
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
        for tag in tag_list:
            filters.append(Q('match', tags=tag))
    
    # Date range filter
    if date_from or date_to:
        date_range = {}
        if date_from:
            date_range['gte'] = date_from
        if date_to:
            date_range['lte'] = date_to
        filters.append(Q('range', scan_date=date_range))
    
    # Apply all filters
    if filters:
        search = search.filter('bool', must=filters)
    
    # Add highlighting for search results
    search = search.highlight_options(
        pre_tags=['<mark>'],
        post_tags=['</mark>'],
        fragment_size=150,
        number_of_fragments=3
    )
    search = search.highlight('description', 'diagnosis', 'tags')
    
    # Execute search
    try:
        response = search[:50].execute()  # Limit to 50 results
        
        # Format results
        results = []
        for hit in response:
            result = hit.to_dict()
            
            # Add highlighting
            if hasattr(hit.meta, 'highlight'):
                result['highlight'] = hit.meta.highlight.to_dict()
            
            # Add search score
            result['search_score'] = hit.meta.score
            
            results.append(result)
        
        return Response({
            'results': results,
            'total': response.hits.total.value,
            'max_score': response.hits.max_score,
            'took': response.took,
            'query': {
                'q': query,
                'filters': {
                    'body_part': body_part,
                    'diagnosis': diagnosis,
                    'institution': institution,
                    'tags': tags,
                    'date_from': date_from,
                    'date_to': date_to,
                }
            }
        })
        
    except Exception as e:
        return Response({
            'error': f'Elasticsearch search failed: {str(e)}',
            'fallback': 'Using database search instead'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def elasticsearch_suggestions(request):
    """
    Get autocomplete suggestions for search terms
    """
    field = request.GET.get('field', 'diagnosis')  # diagnosis, institution, tags
    text = request.GET.get('text', '')
    
    if not text:
        return Response({'suggestions': []})
    
    # Map field names to Elasticsearch fields
    field_mapping = {
        'diagnosis': 'diagnosis.suggest',
        'institution': 'institution.suggest',
        'tags': 'tags.suggest',
    }
    
    if field not in field_mapping:
        return Response({'error': 'Invalid field'}, status=400)
    
    search = XRayDocument.search()
    
    # Add completion suggestion
    search = search.suggest(
        'suggestions',
        text,
        completion={
            'field': field_mapping[field],
            'size': 10,
            'fuzzy': {
                'fuzziness': 1
            }
        }
    )
    
    try:
        response = search.execute()
        suggestions = []
        
        if hasattr(response.suggest, 'suggestions'):
            for suggestion in response.suggest.suggestions:
                for option in suggestion.options:
                    suggestions.append({
                        'text': option._source.to_dict().get(field.split('.')[0], ''),
                        'score': option._score
                    })
        
        # Remove duplicates and sort by score
        unique_suggestions = list({s['text']: s for s in suggestions if s['text']}.values())
        unique_suggestions.sort(key=lambda x: x['score'], reverse=True)
        
        return Response({
            'suggestions': [s['text'] for s in unique_suggestions[:10]]
        })
        
    except Exception as e:
        return Response({
            'error': f'Suggestion search failed: {str(e)}',
            'suggestions': []
        })


@api_view(['GET'])
def elasticsearch_analytics(request):
    """
    Get advanced analytics using Elasticsearch aggregations
    """
    search = XRayDocument.search()
    
    # Add aggregations
    search.aggs.bucket('body_parts', 'terms', field='body_part.raw', size=20)
    search.aggs.bucket('diagnoses', 'terms', field='diagnosis.raw', size=20)
    search.aggs.bucket('institutions', 'terms', field='institution.raw', size=20)
    search.aggs.bucket('scans_by_month', 'date_histogram', field='scan_date', calendar_interval='month')
    
    # Add nested aggregation for tags
    search.aggs.bucket('popular_tags', 'terms', field='tags.raw', size=30)
    
    try:
        response = search[:0].execute()  # No documents, just aggregations
        
        analytics = {
            'total_scans': response.hits.total.value,
            'body_parts': [
                {'name': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.body_parts.buckets
            ],
            'diagnoses': [
                {'name': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.diagnoses.buckets
            ],
            'institutions': [
                {'name': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.institutions.buckets
            ],
            'scans_by_month': [
                {
                    'month': bucket.key_as_string,
                    'count': bucket.doc_count
                }
                for bucket in response.aggregations.scans_by_month.buckets
            ],
            'popular_tags': [
                {'tag': bucket.key, 'count': bucket.doc_count}
                for bucket in response.aggregations.popular_tags.buckets
            ]
        }
        
        return Response(analytics)
        
    except Exception as e:
        return Response({
            'error': f'Analytics failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 