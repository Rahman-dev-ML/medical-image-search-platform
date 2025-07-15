from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files import File
from django.utils import timezone
from datetime import datetime, timedelta
import random
import os
from PIL import Image
import io
import requests
from pathlib import Path
from xray_search.models import XRay


class Command(BaseCommand):
    help = 'Seed the database with fake X-ray data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=15,
            help='Number of X-ray records to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding'
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing X-ray data...')
            XRay.objects.all().delete()
        
        count = options['count']
        self.stdout.write(f'Creating {count} fake X-ray records...')
        
        # Download real X-ray images if not already present
        self.download_real_images()
        
        # Sample data
        institutions = [
            'Mayo Clinic',
            'Johns Hopkins Hospital',
            'Cleveland Clinic',
            'Massachusetts General Hospital',
            'UCLA Medical Center',
            'Mount Sinai Hospital',
            'Cedars-Sinai Medical Center',
            'NewYork-Presbyterian Hospital',
            'Stanford Health Care',
            'UCSF Medical Center'
        ]
        
        body_parts = ['Chest', 'Knee', 'Spine', 'Hip', 'Shoulder', 'Ankle', 'Wrist', 'Elbow', 'Pelvis', 'Abdomen']
        
        diagnoses_by_body_part = {
            'Chest': [
                'Pneumonia',
                'Lung Cancer',
                'Tuberculosis',
                'Pleural Effusion',
                'Pneumothorax',
                'Normal',
                'Bronchitis',
                'Emphysema',
                'TB Scarring'
            ],
            'Knee': [
                'Osteoarthritis',
                'Torn ACL',
                'Meniscus Tear',
                'Fracture',
                'Normal',
                'Bursitis',
                'Ligament Injury'
            ],
            'Spine': [
                'Herniated Disc',
                'Spinal Stenosis',
                'Scoliosis',
                'Compression Fracture',
                'Normal',
                'Degenerative Disc Disease'
            ],
            'Hip': [
                'Hip Fracture',
                'Osteoarthritis',
                'Avascular Necrosis',
                'Normal',
                'Bursitis'
            ],
            'Shoulder': [
                'Rotator Cuff Tear',
                'Dislocation',
                'Fracture',
                'Normal',
                'Impingement Syndrome'
            ],
            'Ankle': [
                'Fracture',
                'Sprain',
                'Arthritis',
                'Normal'
            ],
            'Wrist': [
                'Fracture',
                'Carpal Tunnel Syndrome',
                'Arthritis',
                'Normal'
            ],
            'Elbow': [
                'Fracture',
                'Tennis Elbow',
                'Arthritis',
                'Normal'
            ],
            'Pelvis': [
                'Fracture',
                'Arthritis',
                'Normal'
            ],
            'Abdomen': [
                'Bowel Obstruction',
                'Kidney Stones',
                'Normal',
                'Appendicitis',
                'Toxic Megacolon'
            ]
        }
        
        descriptions_templates = {
            'Pneumonia': [
                'Patient shows signs of pneumonia in the lower left lobe with opacity and consolidation.',
                'Bilateral pneumonia with infiltrates visible in both lungs.',
                'Right-sided pneumonia with pleural effusion.',
                'Lobar pneumonia affecting the right upper lobe.'
            ],
            'Lung Cancer': [
                'Suspicious mass in the right upper lobe measuring 3.2cm.',
                'Nodular opacity in left lung, suspicious for malignancy.',
                'Large mass in right hilum with possible metastasis.'
            ],
            'Fracture': [
                'Displaced fracture of the {body_part} with good alignment.',
                'Comminuted fracture with multiple fragments.',
                'Hairline fracture visible on lateral view.',
                'Compound fracture with soft tissue involvement.'
            ],
            'Osteoarthritis': [
                'Moderate osteoarthritis with joint space narrowing.',
                'Severe degenerative changes with bone spurs.',
                'Early signs of arthritis with minimal joint space loss.'
            ],
            'Normal': [
                'Normal {body_part} X-ray with no acute findings.',
                'No evidence of fracture or dislocation.',
                'Unremarkable study with normal bone density.',
                'Normal alignment and bone structure.'
            ]
        }
        
        tags_by_diagnosis = {
            'Pneumonia': ['lung', 'infection', 'opacity', 'consolidation', 'respiratory'],
            'Lung Cancer': ['lung', 'mass', 'tumor', 'oncology', 'nodule'],
            'Fracture': ['bone', 'trauma', 'break', 'injury'],
            'Osteoarthritis': ['joint', 'degenerative', 'arthritis', 'chronic'],
            'Normal': ['normal', 'healthy', 'negative'],
            'Tuberculosis': ['lung', 'infection', 'TB', 'respiratory'],
            'Torn ACL': ['knee', 'ligament', 'tear', 'sports', 'injury'],
            'Herniated Disc': ['spine', 'disc', 'herniation', 'back'],
            'Hip Fracture': ['hip', 'fracture', 'bone', 'trauma'],
            'Rotator Cuff Tear': ['shoulder', 'rotator', 'tear', 'injury']
        }
        
        created_records = 0
        
        for i in range(count):
            # Generate patient ID
            patient_id = f"P{str(random.randint(10000, 99999)).zfill(5)}"
            
            # Random body part and corresponding diagnosis
            body_part = random.choice(body_parts)
            diagnosis = random.choice(diagnoses_by_body_part[body_part])
            
            # Generate description
            if diagnosis in descriptions_templates:
                description = random.choice(descriptions_templates[diagnosis])
                description = description.format(body_part=body_part.lower())
            else:
                description = f"X-ray examination of {body_part.lower()} shows {diagnosis.lower()}."
            
            # Generate tags
            tags = tags_by_diagnosis.get(diagnosis, ['medical', 'xray', body_part.lower()])
            # Add some random additional tags
            additional_tags = ['radiology', 'diagnostic', 'imaging', 'clinical']
            tags.extend(random.sample(additional_tags, random.randint(1, 2)))
            
            # Random institution
            institution = random.choice(institutions)
            
            # Random scan date (within last 2 years)
            start_date = datetime.now().date() - timedelta(days=730)
            end_date = datetime.now().date()
            scan_date = start_date + timedelta(
                days=random.randint(0, (end_date - start_date).days)
            )
            
            # Create X-ray record
            xray = XRay.objects.create(
                patient_id=patient_id,
                body_part=body_part,
                scan_date=scan_date,
                institution=institution,
                description=description,
                diagnosis=diagnosis,
                tags=tags
            )
            
            # Use real image or create placeholder
            image_name = f"{patient_id}_{body_part.lower()}_{i+1}.png"
            real_image_path = self.get_real_image_for_body_part(body_part)
            
            if real_image_path and real_image_path.exists():
                # Use real downloaded image
                with open(real_image_path, 'rb') as f:
                    xray.image.save(image_name, File(f), save=True)
            else:
                # Fallback to generated image
                image_content = self.create_fake_xray_image(body_part)
                xray.image.save(
                    image_name,
                    ContentFile(image_content),
                    save=True
                )
            
            created_records += 1
            
            if created_records % 5 == 0:
                self.stdout.write(f'Created {created_records} records...')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_records} X-ray records!')
        )
        
        # Display summary
        self.stdout.write('\n--- Summary ---')
        for body_part in body_parts:
            count = XRay.objects.filter(body_part=body_part).count()
            if count > 0:
                self.stdout.write(f'{body_part}: {count} records')
    
    def create_fake_xray_image(self, body_part):
        """Create a realistic X-ray image placeholder"""
        # Create a higher resolution grayscale image
        width, height = 512, 512
        image = Image.new('L', (width, height), color=15)  # Very dark background
        
        # Add realistic X-ray-like content
        from PIL import ImageDraw, ImageFont
        import math
        draw = ImageDraw.Draw(image)
        
        # Add realistic shapes based on body part
        if body_part == 'Chest':
            # Draw realistic lung shapes
            # Left lung
            draw.ellipse([80, 120, 220, 380], fill=45, outline=60, width=2)
            draw.ellipse([100, 140, 200, 360], fill=35)
            # Right lung
            draw.ellipse([292, 120, 432, 380], fill=45, outline=60, width=2)
            draw.ellipse([312, 140, 412, 360], fill=35)
            # Ribcage
            for i in range(8):
                y = 120 + i * 30
                draw.arc([60, y, 452, y+40], 0, 180, fill=80, width=3)
            # Heart shadow
            draw.ellipse([200, 160, 280, 280], fill=25)
            # Spine
            draw.rectangle([250, 100, 262, 400], fill=120)
            
        elif body_part == 'Knee':
            # Draw realistic knee bones
            # Femur
            draw.polygon([(220, 50), (292, 50), (300, 200), (280, 240), (232, 240), (212, 200)], fill=180)
            # Tibia
            draw.polygon([(210, 260), (302, 260), (295, 450), (275, 460), (237, 460), (217, 450)], fill=180)
            # Fibula
            draw.polygon([(310, 270), (325, 270), (320, 450), (310, 455), (305, 450)], fill=160)
            # Patella (kneecap)
            draw.ellipse([240, 220, 272, 260], fill=200)
            # Joint space
            draw.rectangle([210, 240, 302, 260], fill=30)
            
        elif body_part == 'Spine':
            # Draw vertebrae
            for i in range(12):
                y = 50 + i * 35
                # Vertebral body
                draw.rectangle([230, y, 282, y+25], fill=150)
                # Spinous process
                draw.rectangle([252, y-10, 260, y], fill=120)
                # Transverse processes
                draw.rectangle([210, y+8, 230, y+17], fill=120)
                draw.rectangle([282, y+8, 302, y+17], fill=120)
            # Spinal canal
            draw.rectangle([240, 50, 272, 470], fill=25)
            
        elif body_part == 'Hip':
            # Draw pelvis and hip joint
            # Pelvis
            draw.arc([150, 200, 362, 350], 0, 180, fill=140, width=8)
            # Hip sockets
            draw.ellipse([180, 220, 220, 260], fill=40, outline=120, width=3)
            draw.ellipse([292, 220, 332, 260], fill=40, outline=120, width=3)
            # Femur heads
            draw.ellipse([185, 225, 215, 255], fill=160)
            draw.ellipse([297, 225, 327, 255], fill=160)
            # Femur necks and shafts
            draw.polygon([(200, 255), (210, 255), (220, 400), (200, 420), (180, 400)], fill=150)
            draw.polygon([(312, 255), (322, 255), (332, 400), (312, 420), (292, 400)], fill=150)
            
        else:
            # Generic bone structure
            draw.rectangle([200, 100, 312, 400], fill=140)
            draw.ellipse([180, 80, 332, 120], fill=160)
            draw.ellipse([180, 400, 332, 440], fill=160)
        
        # Add realistic X-ray texture and noise
        import random
        # Add subtle noise throughout
        for _ in range(2000):
            x = random.randint(0, width-1)
            y = random.randint(0, height-1)
            current_pixel = image.getpixel((x, y))
            noise = random.randint(-15, 15)
            new_value = max(0, min(255, current_pixel + noise))
            draw.point((x, y), fill=new_value)
        
        # Add some artifacts and markers typical in X-rays
        # Patient info area (top right)
        draw.rectangle([350, 20, 490, 80], fill=200)
        draw.text((355, 25), f"{body_part} X-RAY", fill=0)
        draw.text((355, 40), "L", fill=0)  # Left marker
        draw.text((355, 55), "2024", fill=0)
        
        # Add some subtle grid lines (common in X-ray equipment)
        for i in range(0, width, 64):
            draw.line([(i, 0), (i, height)], fill=25, width=1)
        for i in range(0, height, 64):
            draw.line([(0, i), (width, i)], fill=25, width=1)
        
        # Save to bytes
        img_bytes = io.BytesIO()
        image.save(img_bytes, format='PNG')
        return img_bytes.getvalue()
    
    def download_real_images(self):
        """Download real X-ray images from public datasets"""
        sample_dir = Path('sample_xray_images')
        sample_dir.mkdir(exist_ok=True)
        
        # Only download if directory is empty
        if list(sample_dir.glob('*.jpg')) or list(sample_dir.glob('*.jpeg')):
            return  # Images already downloaded
        
        # Real X-ray images from medical sources
        xray_images = {
            # Chest X-rays
            'chest_normal_1.jpg': 'https://www.kenhub.com/thumbor/HY-FumDTVdDoBWdeJI8VFIfR2hc=/fit-in/800x1600/filters:watermark(/images/logo_url.png,-10,-10,0):background_color(FFFFFF):format(jpeg)/images/library/10855/E4OFggoL2vooAU0frCUSZA_Costophrenic_angle.png',
            'chest_pneumonia_1.jpg': 'https://ars.els-cdn.com/content/image/1-s2.0-S0263931909001811-gr3.jpg',
            'chest_tb_1.jpg': 'https://radiologyassistant.nl/assets/_1-scarring-2.jpg',
            
            # Knee X-rays
            'knee_normal_1.jpg': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4QSuaC7KGsPvbb2BJPsQAwqn765C6ABuglg&s',
            'knee_arthritis_1.jpg': 'https://prod-images-static.radiopaedia.org/images/53810539/IMAGE_021-001_big_gallery.jpeg',
            'knee_fracture_1.jpg': 'https://orthoinfo.aaos.org/globalassets/figures/a00523f04.jpg',
            
            # Spine X-rays
            'spine_normal_1.jpg': 'https://lh4.googleusercontent.com/proxy/6XOPIxIAloEn2yT6aDWboZsp81l-eTcShhLnFVQpF7LnXZH1ULcrCpHa7N9WMFk_6nPJ8_SfQ3V7IpPGFRhUWYFFtInqgwwa6bA4bWo',
            'spine_herniated_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Hernie_discale_L4_L5.png',
            
            # Hip X-rays
            'hip_normal_1.jpg': 'https://static.wixstatic.com/media/ebdd4d_df3141d0c1394a068d5e13c7d3d73ff2~mv2.jpg/v1/fill/w_600,h_401,al_c,lg_1,q_80/ebdd4d_df3141d0c1394a068d5e13c7d3d73ff2~mv2.jpg',
            'hip_fracture_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/X-ray_of_mildly_compressed_hip_fracture%2C_annotated.jpg/330px-X-ray_of_mildly_compressed_hip_fracture%2C_annotated.jpg',
            
            # Shoulder X-rays
            'shoulder_normal_1.jpg': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkp5GuTggDt0pCKq9SGcNNvTkP4SAggRlqvw&s',
            'shoulder_fracture_1.jpg': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMq_1g9dQtOk6P90W1yL0YVMt91amEuz530g&s',
            
            # Ankle X-rays
            'ankle_normal_1.jpg': 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/23500-foot-x-ray',
            'ankle_fracture_1.jpg': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7QxPZOfZA09dnK5Icqq-bbZlT5PNaCnWtw&s',
            
            # Wrist X-rays
            'wrist_normal_1.jpg': 'https://i0.wp.com/www.aliem.com/wp-content/uploads/2019/12/Normal-wrist-AP.jpg?fit=1023%2C1024&ssl=1',
            'wrist_fracture_1.jpg': 'https://i1.wp.com/www.aliem.com/wp-content/uploads/2019/12/Adult-Wrist.png?fit=619%2C650&ssl=1',
            
            # Elbow X-rays
            'elbow_normal_1.jpg': 'https://prod-images-static.radiopaedia.org/images/21172510/aaa867f71f0fedbd9cdadd08e62a17_big_gallery.jpeg',
            'elbow_fracture_1.jpg': 'https://www.nyp.org/graphics/emergency/reading-images/radialheadfracture.jpg',
            
            # Pelvis X-rays
            'pelvis_normal_1.jpg': 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/23519-pelvis-x-ray',
            'pelvis_fracture_1.jpg': 'https://media.post.rvohealth.io/wp-content/uploads/2020/08/pelvis-x-ray_thumb.jpg',
            
            # Abdomen X-rays
            'abdomen_normal_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Medical_X-Ray_imaging_ALP02_nevit.jpg',
            'abdomen_obstruction_1.jpg': 'https://almostadoctor.co.uk/wp-content/uploads/2017/05/Toxic_Megacolon.jpg',
        }
        
        self.stdout.write('Downloading real X-ray images...')
        
        for filename, url in xray_images.items():
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                file_path = sample_dir / filename
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                self.stdout.write(f'[SUCCESS] Downloaded {filename}')
                
            except Exception as e:
                self.stdout.write(f'[ERROR] Failed to download {filename}: {e}')
    
    def get_real_image_for_body_part(self, body_part):
        """Get a real X-ray image path for the given body part"""
        sample_dir = Path('sample_xray_images')
        
        # Map body parts to available images
        body_part_images = {
            'Chest': ['chest_normal_1.jpg', 'chest_pneumonia_1.jpg', 'chest_tb_1.jpg'],
            'Knee': ['knee_normal_1.jpg', 'knee_arthritis_1.jpg', 'knee_fracture_1.jpg'],
            'Spine': ['spine_normal_1.jpg', 'spine_herniated_1.jpg'],
            'Hip': ['hip_normal_1.jpg', 'hip_fracture_1.jpg'],
            'Shoulder': ['shoulder_normal_1.jpg', 'shoulder_fracture_1.jpg'],
            'Ankle': ['ankle_normal_1.jpg', 'ankle_fracture_1.jpg'],
            'Wrist': ['wrist_normal_1.jpg', 'wrist_fracture_1.jpg'],
            'Elbow': ['elbow_normal_1.jpg', 'elbow_fracture_1.jpg'],
            'Pelvis': ['pelvis_normal_1.jpg', 'pelvis_fracture_1.jpg'],
            'Abdomen': ['abdomen_normal_1.jpg', 'abdomen_obstruction_1.jpg'],
        }
        
        if body_part in body_part_images:
            available_images = body_part_images[body_part]
            # Randomly select one of the available images
            selected_image = random.choice(available_images)
            image_path = sample_dir / selected_image
            
            if image_path.exists():
                return image_path
        
        return None 