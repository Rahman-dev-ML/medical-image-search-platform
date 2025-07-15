#!/usr/bin/env python
"""
Complete setup script for Medical Image Search Platform
Handles descriptions, database updates, and Elasticsearch setup
"""
import os
import sys
import django
import subprocess

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
django.setup()

from xray_search.models import XRay

def generate_description(xray):
    """Generate a description based on other fields"""
    body_part = xray.body_part.lower()
    diagnosis = xray.diagnosis.lower()
    
    # Create contextual descriptions based on body part and diagnosis
    if 'normal' in diagnosis or 'healthy' in diagnosis:
        return f"X-ray of {body_part} showing normal anatomy with no abnormal findings. Clear visualization of {body_part} structures."
    elif 'fracture' in diagnosis or 'break' in diagnosis:
        return f"X-ray of {body_part} demonstrating fracture. Bone discontinuity visible with associated soft tissue changes."
    elif 'pneumonia' in diagnosis or 'infection' in diagnosis:
        return f"Chest X-ray showing signs of pneumonia with consolidation and opacity in lung fields. Inflammatory changes present."
    elif 'arthritis' in diagnosis:
        return f"X-ray of {body_part} showing arthritic changes with joint space narrowing and osteophyte formation."
    elif 'dislocation' in diagnosis:
        return f"X-ray of {body_part} demonstrating joint dislocation with altered anatomical alignment."
    elif 'tumor' in diagnosis or 'mass' in diagnosis:
        return f"X-ray of {body_part} showing mass lesion with altered normal anatomy. Further evaluation recommended."
    else:
        return f"X-ray examination of {body_part} with findings consistent with {diagnosis}. Detailed imaging analysis performed."

def update_descriptions():
    """Update all X-ray records that have missing or empty descriptions"""
    xrays = XRay.objects.all()
    updated_count = 0
    
    print(f"Found {xrays.count()} X-ray records")
    
    for xray in xrays:
        # Check if description is missing or empty
        if not xray.description or xray.description.strip() == '':
            old_desc = xray.description
            xray.description = generate_description(xray)
            xray.save()
            updated_count += 1
            print(f"Updated {xray.patient_id} - {xray.body_part}")
    
    print(f"Updated {updated_count} records with descriptions")
    return updated_count

def check_elasticsearch():
    """Check if Elasticsearch is running"""
    try:
        import requests
        response = requests.get('http://localhost:9200', timeout=5)
        if response.status_code == 200:
            print("✅ Elasticsearch is running")
            return True
        else:
            print("❌ Elasticsearch is not responding properly")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Elasticsearch: {e}")
        return False

def setup_elasticsearch():
    """Setup Elasticsearch index if available"""
    if not check_elasticsearch():
        print("⚠️  Elasticsearch not available - search will use Django database")
        return False
    
    try:
        from django.core.management import call_command
        
        print("🔄 Creating Elasticsearch index...")
        call_command('search_index', '--delete', '-f')
        call_command('search_index', '--create')
        
        print("🔄 Populating Elasticsearch index...")
        call_command('search_index', '--populate')
        
        xray_count = XRay.objects.count()
        print(f"✅ Elasticsearch setup complete - indexed {xray_count} X-rays")
        return True
        
    except Exception as e:
        print(f"❌ Elasticsearch setup failed: {e}")
        return False

def run_migrations():
    """Run any pending migrations"""
    try:
        from django.core.management import call_command
        print("🔄 Running database migrations...")
        call_command('migrate', verbosity=0)
        print("✅ Database migrations complete")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def show_current_data():
    """Show current database status"""
    total_xrays = XRay.objects.count()
    xrays_with_desc = XRay.objects.exclude(description='').exclude(description__isnull=True).count()
    xrays_without_desc = total_xrays - xrays_with_desc
    
    print(f"\n📊 Database Status:")
    print(f"   Total X-rays: {total_xrays}")
    print(f"   With descriptions: {xrays_with_desc}")
    print(f"   Without descriptions: {xrays_without_desc}")
    
    # Show sample data
    if total_xrays > 0:
        sample = XRay.objects.first()
        print(f"\n📋 Sample record:")
        print(f"   Patient: {sample.patient_id}")
        print(f"   Body part: {sample.body_part}")
        print(f"   Diagnosis: {sample.diagnosis}")
        print(f"   Description: {sample.description[:100]}...")

def main():
    """Main setup function"""
    print("Medical Image Search Platform - Complete Setup")
    print("=" * 60)
    
    success = True
    
    # Step 1: Run migrations
    if not run_migrations():
        success = False
    
    # Step 2: Show current status
    show_current_data()
    
    # Step 3: Update descriptions
    print(f"\n🔄 Updating X-ray descriptions...")
    try:
        updated_count = update_descriptions()
        if updated_count > 0:
            print(f"✅ Updated {updated_count} records with descriptions")
        else:
            print("✅ All records already have descriptions")
    except Exception as e:
        print(f"❌ Error updating descriptions: {e}")
        success = False
    
    # Step 4: Setup Elasticsearch (optional)
    print(f"\n🔄 Setting up Elasticsearch...")
    es_success = setup_elasticsearch()
    
    # Step 5: Show final status
    print(f"\n" + "=" * 60)
    
    if success:
        print("✅ Setup completed successfully!")
        
        print(f"\n🚀 Your system is ready:")
        print(f"   • Database: ✅ Ready")
        print(f"   • Descriptions: ✅ Added to all records")
        print(f"   • Search by description: ✅ Enabled")
        print(f"   • Elasticsearch: {'✅ Enabled' if es_success else '⚠️  Disabled (using Django search)'}")
        
        print(f"\n📡 Available search fields:")
        print(f"   • Description (detailed X-ray findings)")
        print(f"   • Diagnosis (medical diagnosis)")
        print(f"   • Tags (categorization tags)")
        print(f"   • Patient ID")
        print(f"   • Institution")
        
        print(f"\n🔧 Next steps:")
        print(f"   1. Run server: python manage.py runserver")
        print(f"   2. Test search: http://127.0.0.1:8000/api/xrays/?search=pneumonia")
        print(f"   3. Test description search: http://127.0.0.1:8000/api/xrays/?search=opacity")
        
        if es_success:
            print(f"   4. Advanced search: http://127.0.0.1:8000/api/elasticsearch/search/?q=lung")
        
    else:
        print("❌ Setup completed with errors")
        
    return success

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 