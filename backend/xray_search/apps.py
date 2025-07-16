from django.apps import AppConfig
from django.contrib import admin
import os


class XraySearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'xray_search'
    verbose_name = 'Medical Image Search'
    
    def ready(self):
        # Customize admin site
        admin.site.site_header = "Medical Image Search Platform"
        admin.site.site_title = "Medical Admin"
        admin.site.index_title = "Medical Image Management"
        
        # Only register Elasticsearch documents if not skipping
        skip_es = os.environ.get('SKIP_ELASTICSEARCH', 'False').lower() == 'true'
        if not skip_es:
            try:
                from django.conf import settings
                if hasattr(settings, 'ELASTICSEARCH_DSL'):
                    from django_elasticsearch_dsl.registries import registry
                    from .documents import XRayDocument
                    # Documents will auto-register when imported
            except ImportError:
                # Elasticsearch not available
                pass
