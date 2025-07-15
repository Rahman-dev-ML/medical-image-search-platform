#!/usr/bin/env python
"""
Setup script for Elasticsearch integration
"""
import os
import sys
import django
import subprocess

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
django.setup()

from django.core.management import call_command
from xray_search.models import XRay


def check_elasticsearch():
    """Check if Elasticsearch is running"""
    try:
        import requests
        response = requests.get('http://localhost:9200', timeout=5)
        if response.status_code == 200:
            print("[SUCCESS] Elasticsearch is running")
            return True
        else:
            print("[ERROR] Elasticsearch is not responding properly")
            return False
    except Exception as e:
        print(f"[ERROR] Cannot connect to Elasticsearch: {e}")
        return False


def setup_elasticsearch_index():
    """Create and populate Elasticsearch index"""
    try:
        # Create index
        print("[RUNNING] Creating Elasticsearch index...")
        call_command('search_index', '--delete', '-f')
        call_command('search_index', '--create')
        print("[SUCCESS] Elasticsearch index created")
        
        # Populate index
        print("[RUNNING] Populating Elasticsearch index with X-ray data...")
        call_command('search_index', '--populate')
        print("[SUCCESS] Elasticsearch index populated")
        
        # Get document count
        xray_count = XRay.objects.count()
        print(f"[INFO] Indexed {xray_count} X-ray documents")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to setup Elasticsearch index: {e}")
        return False


def test_elasticsearch_search():
    """Test Elasticsearch search functionality"""
    try:
        from xray_search.documents import XRayDocument
        
        # Test basic search
        search = XRayDocument.search()
        search = search.query('match', diagnosis='pneumonia')
        response = search.execute()
        
        print(f"[SUCCESS] Elasticsearch search test passed - found {response.hits.total.value} results")
        return True
        
    except Exception as e:
        print(f"[ERROR] Elasticsearch search test failed: {e}")
        return False


def main():
    """Main setup function"""
    print("Elasticsearch Setup for Medical Image Search Platform")
    print("=" * 60)
    
    # Step 1: Check if Elasticsearch is running
    if not check_elasticsearch():
        print("\nElasticsearch Setup Instructions:")
        print("1. Download Elasticsearch 8.x from: https://www.elastic.co/downloads/elasticsearch")
        print("2. Extract and run: bin/elasticsearch (Linux/Mac) or bin\\elasticsearch.bat (Windows)")
        print("3. Wait for Elasticsearch to start on http://localhost:9200")
        print("4. Run this script again")
        return False
    
    # Step 2: Install Python dependencies
    print("\n[RUNNING] Installing Elasticsearch Python packages...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("[SUCCESS] Python packages installed")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install packages: {e}")
        return False
    
    # Step 3: Setup Elasticsearch index
    if not setup_elasticsearch_index():
        return False
    
    # Step 4: Test search functionality
    if not test_elasticsearch_search():
        return False
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Elasticsearch setup completed successfully!")
    
    print("\nNew Elasticsearch-powered endpoints:")
    print("- Advanced Search: http://127.0.0.1:8000/api/elasticsearch/search/")
    print("- Autocomplete: http://127.0.0.1:8000/api/elasticsearch/suggestions/")
    print("- Analytics: http://127.0.0.1:8000/api/elasticsearch/analytics/")
    print("- Document API: http://127.0.0.1:8000/api/elasticsearch/xrays/")
    
    print("\nFeatures enabled:")
    print("- Fuzzy search (handles typos)")
    print("- Medical synonym search (pneumonia = lung infection)")
    print("- Multi-field search with relevance boosting")
    print("- Real-time autocomplete suggestions")
    print("- Advanced analytics and aggregations")
    print("- Search result highlighting")
    
    print("\nExample searches:")
    print("- Fuzzy: http://127.0.0.1:8000/api/elasticsearch/search/?q=pnumonia")
    print("- Synonym: http://127.0.0.1:8000/api/elasticsearch/search/?q=lung+infection")
    print("- Complex: http://127.0.0.1:8000/api/elasticsearch/search/?q=fracture&body_part=Knee")
    
    return True


if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 