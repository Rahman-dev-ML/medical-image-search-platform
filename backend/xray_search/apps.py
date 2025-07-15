from django.apps import AppConfig
from django.contrib import admin


class XraySearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'xray_search'
    verbose_name = 'Medical Image Search'
    
    def ready(self):
        # Customize admin site
        admin.site.site_header = "Medical Image Search Platform"
        admin.site.site_title = "Medical Admin"
        admin.site.index_title = "Medical Image Management"
