from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import XRay


@registry.register_document
class XRayDocument(Document):
    """
    Elasticsearch document for X-ray scans with advanced search capabilities
    """
    
    # Custom field for tags (JSONField)
    tags = fields.TextField()
    
    class Index:
        # Name of the Elasticsearch index
        name = 'xray_scans'
        # See Elasticsearch Indices API reference for available settings
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0,
        }
    
    class Django:
        model = XRay  # The model associated with this Document
        
        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'id',
            'patient_id',
            'body_part',
            'scan_date',
            'institution',
            'description',
            'diagnosis',
            'created_at',
            'updated_at',
        ]
        
        # Ignore auto updating of Elasticsearch when a model is saved
        # or deleted (default is True):
        ignore_signals = False
        
        # Configure how the index should be refreshed after an update
        auto_refresh = True
        
        # Paginate the django queryset used to populate the index with the specified size
        queryset_pagination = 50
    
    def prepare_tags(self, instance):
        """Convert tags JSONField to searchable text"""
        if instance.tags and isinstance(instance.tags, list):
            return ' '.join(instance.tags)
        return '' 