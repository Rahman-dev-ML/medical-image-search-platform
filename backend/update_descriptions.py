#!/usr/bin/env python
"""
Script to update X-ray records with descriptions if they're missing
"""
import os
import sys
import django

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
            print(f"Updated {xray.patient_id} - {xray.body_part}: '{old_desc}' -> '{xray.description[:50]}...'")
    
    print(f"\nUpdated {updated_count} records with descriptions")
    return updated_count

def main():
    """Main function"""
    print("X-ray Description Update Script")
    print("=" * 50)
    
    try:
        updated_count = update_descriptions()
        
        if updated_count > 0:
            print(f"\n✅ Successfully updated {updated_count} X-ray records with descriptions")
            print("\nNext steps:")
            print("1. Run the Django server: python manage.py runserver")
            print("2. Test search functionality including description search")
            print("3. Enable Elasticsearch for advanced search (optional)")
        else:
            print("\n✅ All X-ray records already have descriptions")
            
    except Exception as e:
        print(f"\n❌ Error updating descriptions: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 