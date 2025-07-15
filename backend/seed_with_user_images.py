#!/usr/bin/env python3
"""
Seed database with user-provided X-ray images and metadata
"""
import os
import django
import requests
import sys
from datetime import date, timedelta
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import random

# Setup Django
sys.path.append('/c:/Users/airkooled/Desktop/medproject/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
django.setup()

from xray_search.models import XRay

# User's X-ray image data
XRAY_DATA = [
    # Chest X-rays
    {
        'url': 'https://www.kenhub.com/thumbor/HY-FumDTVdDoBWdeJI8VFIfR2hc=/fit-in/800x1600/filters:watermark(/images/logo_url.png,-10,-10,0):background_color(FFFFFF):format(jpeg)/images/library/10855/E4OFggoL2vooAU0frCUSZA_Costophrenic_angle.png',
        'body_part': 'Chest',
        'patient_id': 'P00001',
        'diagnosis': 'Normal',
        'description': 'Normal chest X-ray showing clear lung fields and normal costophrenic angles',
        'institution': 'Metropolitan Medical Center',
        'tags': ['normal', 'chest', 'clear_lungs']
    },
    {
        'url': 'https://ars.els-cdn.com/content/image/1-s2.0-S0263931909001811-gr3.jpg',
        'body_part': 'Chest',
        'patient_id': 'P00002',
        'diagnosis': 'Pneumonia',
        'description': 'Chest X-ray showing consolidation consistent with pneumonia',
        'institution': 'City General Hospital',
        'tags': ['pneumonia', 'infection', 'consolidation']
    },
    {
        'url': 'https://radiologyassistant.nl/assets/_1-scarring-2.jpg',
        'body_part': 'Chest',
        'patient_id': 'P00003',
        'diagnosis': 'Tuberculosis',
        'description': 'Chest X-ray showing pulmonary tuberculosis with scarring',
        'institution': 'University Medical Center',
        'tags': ['tuberculosis', 'scarring', 'chronic']
    },
    
    # Knee X-rays
    {
        'url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4QSuaC7KGsPvbb2BJPsQAwqn765C6ABuglg&s',
        'body_part': 'Knee',
        'patient_id': 'P00004',
        'diagnosis': 'Normal',
        'description': 'Normal knee X-ray with intact joint spaces and normal bone structure',
        'institution': 'Orthopedic Specialty Center',
        'tags': ['normal', 'knee', 'joint_space']
    },
    {
        'url': 'https://prod-images-static.radiopaedia.org/images/53810539/IMAGE_021-001_big_gallery.jpeg',
        'body_part': 'Knee',
        'patient_id': 'P00005',
        'diagnosis': 'Arthritis',
        'description': 'Knee X-ray showing osteoarthritic changes with joint space narrowing',
        'institution': 'Regional Medical Center',
        'tags': ['arthritis', 'osteoarthritis', 'joint_narrowing']
    },
    {
        'url': 'https://orthoinfo.aaos.org/globalassets/figures/a00523f04.jpg',
        'body_part': 'Knee',
        'patient_id': 'P00006',
        'diagnosis': 'Fracture',
        'description': 'Knee X-ray demonstrating tibial plateau fracture',
        'institution': 'Emergency Medical Center',
        'tags': ['fracture', 'trauma', 'tibial_plateau']
    },
    
    # Spine X-rays
    {
        'url': 'https://lh4.googleusercontent.com/proxy/6XOPIxIAloEn2yT6aDWboZsp81l-eTcShhLnFVQpF7LnXZH1ULcrCpHa7N9WMFk_6nPJ8_SfQ3V7IpPGFRhUWYFFtInqgwwa6bA4bWo',
        'body_part': 'Spine',
        'patient_id': 'P00007',
        'diagnosis': 'Normal',
        'description': 'Normal lumbar spine X-ray with preserved disc spaces',
        'institution': 'Spine Care Institute',
        'tags': ['normal', 'lumbar', 'disc_space']
    },
    {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Hernie_discale_L4_L5.png',
        'body_part': 'Spine',
        'patient_id': 'P00008',
        'diagnosis': 'Herniated Disc',
        'description': 'Lumbar spine showing herniated disc at L4-L5 level',
        'institution': 'Neurosurgery Associates',
        'tags': ['herniated_disc', 'L4_L5', 'back_pain']
    },
    
    # Hip X-rays
    {
        'url': 'https://static.wixstatic.com/media/ebdd4d_df3141d0c1394a068d5e13c7d3d73ff2~mv2.jpg/v1/fill/w_600,h_401,al_c,lg_1,q_80/ebdd4d_df3141d0c1394a068d5e13c7d3d73ff2~mv2.jpg',
        'body_part': 'Hip',
        'patient_id': 'P00009',
        'diagnosis': 'Normal',
        'description': 'Normal hip X-ray with intact joint spaces and normal bone density',
        'institution': 'Joint Replacement Center',
        'tags': ['normal', 'hip', 'joint_health']
    },
    {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/X-ray_of_mildly_compressed_hip_fracture%2C_annotated.jpg/330px-X-ray_of_mildly_compressed_hip_fracture%2C_annotated.jpg',
        'body_part': 'Hip',
        'patient_id': 'P00010',
        'diagnosis': 'Hip Fracture',
        'description': 'Hip X-ray showing compressed hip fracture with displacement',
        'institution': 'Trauma Center',
        'tags': ['fracture', 'trauma', 'compression']
    },
    
    # Shoulder X-rays
    {
        'url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkp5GuTggDt0pCKq9SGcNNvTkP4SAggRlqvw&s',
        'body_part': 'Shoulder',
        'patient_id': 'P00011',
        'diagnosis': 'Normal',
        'description': 'Normal shoulder X-ray with intact rotator cuff and normal joint alignment',
        'institution': 'Sports Medicine Clinic',
        'tags': ['normal', 'shoulder', 'rotator_cuff']
    },
    {
        'url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq_1g9dQtOk6P90W1yL0YVMt91amEuz530g&s',
        'body_part': 'Shoulder',
        'patient_id': 'P00012',
        'diagnosis': 'Fracture',
        'description': 'Shoulder X-ray demonstrating clavicle fracture',
        'institution': 'Orthopedic Emergency',
        'tags': ['fracture', 'clavicle', 'trauma']
    },
    
    # Ankle X-rays
    {
        'url': 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/23500-foot-x-ray',
        'body_part': 'Ankle',
        'patient_id': 'P00013',
        'diagnosis': 'Normal',
        'description': 'Normal ankle and foot X-ray with proper bone alignment',
        'institution': 'Podiatry Center',
        'tags': ['normal', 'ankle', 'foot']
    },
    {
        'url': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7QxPZOfZA09dnK5Icqq-bbZlT5PNaCnWtw&s',
        'body_part': 'Ankle',
        'patient_id': 'P00014',
        'diagnosis': 'Sprain',
        'description': 'Ankle X-ray showing soft tissue swelling consistent with sprain',
        'institution': 'Emergency Department',
        'tags': ['sprain', 'soft_tissue', 'swelling']
    },
    
    # Wrist X-rays
    {
        'url': 'https://i0.wp.com/www.aliem.com/wp-content/uploads/2019/12/Normal-wrist-AP.jpg?fit=1023%2C1024&ssl=1',
        'body_part': 'Wrist',
        'patient_id': 'P00015',
        'diagnosis': 'Normal',
        'description': 'Normal wrist X-ray anterior-posterior view with intact carpal bones',
        'institution': 'Hand Surgery Center',
        'tags': ['normal', 'wrist', 'carpal_bones']
    },
    {
        'url': 'https://i1.wp.com/www.aliem.com/wp-content/uploads/2019/12/Adult-Wrist.png?fit=619%2C650&ssl=1',
        'body_part': 'Wrist',
        'patient_id': 'P00016',
        'diagnosis': 'Scaphoid Fracture',
        'description': 'Wrist X-ray showing scaphoid bone fracture',
        'institution': 'Orthopedic Clinic',
        'tags': ['fracture', 'scaphoid', 'carpal']
    },
    
    # Elbow X-rays
    {
        'url': 'https://prod-images-static.radiopaedia.org/images/21172510/aaa867f71f0fedbd9cdadd08e62a17_big_gallery.jpeg',
        'body_part': 'Elbow',
        'patient_id': 'P00017',
        'diagnosis': 'Normal',
        'description': 'Normal elbow X-ray with proper joint alignment and bone structure',
        'institution': 'Orthopedic Associates',
        'tags': ['normal', 'elbow', 'joint_alignment']
    },
    {
        'url': 'https://www.nyp.org/graphics/emergency/reading-images/radialheadfracture.jpg',
        'body_part': 'Elbow',
        'patient_id': 'P00018',
        'diagnosis': 'Radial Head Fracture',
        'description': 'Elbow X-ray showing radial head fracture',
        'institution': 'Emergency Medical Center',
        'tags': ['fracture', 'radial_head', 'trauma']
    },
    
    # Pelvis X-rays
    {
        'url': 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/23519-pelvis-x-ray',
        'body_part': 'Pelvis',
        'patient_id': 'P00019',
        'diagnosis': 'Normal',
        'description': 'Normal pelvis X-ray with symmetric iliac wings and intact sacroiliac joints',
        'institution': 'Radiology Department',
        'tags': ['normal', 'pelvis', 'sacroiliac']
    },
    {
        'url': 'https://media.post.rvohealth.io/wp-content/uploads/2020/08/pelvis-x-ray_thumb.jpg',
        'body_part': 'Pelvis',
        'patient_id': 'P00020',
        'diagnosis': 'Pelvic Fracture',
        'description': 'Pelvis X-ray showing pelvic ring disruption',
        'institution': 'Trauma Center',
        'tags': ['fracture', 'pelvic_ring', 'trauma']
    },
    
    # Abdomen X-rays
    {
        'url': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Medical_X-Ray_imaging_ALP02_nevit.jpg',
        'body_part': 'Abdomen',
        'patient_id': 'P00021',
        'diagnosis': 'Normal',
        'description': 'Normal abdominal X-ray with normal bowel gas pattern',
        'institution': 'General Hospital',
        'tags': ['normal', 'abdomen', 'bowel_gas']
    },
    {
        'url': 'https://almostadoctor.co.uk/wp-content/uploads/2017/05/Toxic_Megacolon.jpg',
        'body_part': 'Abdomen',
        'patient_id': 'P00022',
        'diagnosis': 'Toxic Megacolon',
        'description': 'Abdominal X-ray showing dilated colon consistent with toxic megacolon',
        'institution': 'Emergency Department',
        'tags': ['toxic_megacolon', 'dilated_colon', 'emergency']
    }
]

def download_image(url, filename):
    """Download image from URL and return content"""
    try:
        print(f"Downloading {url}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return ContentFile(response.content, name=filename)
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def create_xray_records():
    """Create X-ray records with user's images"""
    
    # Clear existing records
    print("Clearing existing X-ray records...")
    XRay.objects.all().delete()
    
    institutions = [
        'Metropolitan Medical Center',
        'City General Hospital', 
        'University Medical Center',
        'Regional Medical Center',
        'Emergency Medical Center',
        'Orthopedic Specialty Center',
        'Spine Care Institute',
        'Joint Replacement Center',
        'Sports Medicine Clinic',
        'Trauma Center',
        'Hand Surgery Center',
        'Podiatry Center',
        'Neurosurgery Associates',
        'Orthopedic Associates',
        'Radiology Department',
        'Emergency Department',
        'General Hospital',
        'Orthopedic Clinic',
        'Orthopedic Emergency'
    ]
    
    print(f"Creating {len(XRAY_DATA)} X-ray records with user's images...")
    
    for i, data in enumerate(XRAY_DATA):
        try:
            # Generate scan date (random date in last 2 years)
            days_ago = random.randint(1, 730)
            scan_date = date.today() - timedelta(days=days_ago)
            
            # Download image
            filename = f"{data['patient_id']}_{data['body_part'].lower()}_{i+1}.jpg"
            image_content = download_image(data['url'], filename)
            
            if image_content:
                # Create X-ray record
                xray = XRay.objects.create(
                    patient_id=data['patient_id'],
                    body_part=data['body_part'],
                    scan_date=scan_date,
                    institution=data['institution'],
                    description=data['description'],
                    diagnosis=data['diagnosis'],
                    tags=data['tags']
                )
                
                # Save image
                xray.image.save(filename, image_content, save=True)
                
                print(f"✓ Created {data['patient_id']} - {data['body_part']} - {data['diagnosis']}")
            else:
                print(f"✗ Failed to download image for {data['patient_id']}")
                
        except Exception as e:
            print(f"Error creating record {data['patient_id']}: {e}")
    
    print(f"\nCompleted! Created {XRay.objects.count()} X-ray records.")
    print("\nStatistics:")
    for body_part in ['Chest', 'Knee', 'Spine', 'Hip', 'Shoulder', 'Ankle', 'Wrist', 'Elbow', 'Pelvis', 'Abdomen']:
        count = XRay.objects.filter(body_part=body_part).count()
        print(f"  {body_part}: {count} records")

if __name__ == '__main__':
    create_xray_records() 