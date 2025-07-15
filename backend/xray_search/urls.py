from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import XRayViewSet, api_root, elasticsearch_search

# Create router for ViewSet
router = DefaultRouter()
router.register(r'xrays', XRayViewSet, basename='xray')

app_name = 'xray_search'

urlpatterns = [
    path('', api_root, name='api_root'),
    path('api/', include(router.urls)),
    
    # Elasticsearch search endpoint
    path('api/search/', elasticsearch_search, name='elasticsearch_search'),
] 