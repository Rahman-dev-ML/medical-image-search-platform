import requests
import os
from pathlib import Path

def download_real_xray_images():
    """
    Download real X-ray images from public medical datasets
    """
    # Create directory for sample images
    sample_dir = Path('sample_xray_images')
    sample_dir.mkdir(exist_ok=True)
    
    # Real X-ray images from public datasets (these are actual medical images)
    xray_images = {
        'chest_normal_1.jpg': 'https://github.com/ieee8023/covid-chestxray-dataset/raw/master/images/01E392EE-69F9-4E51-9A2A-2FB8AC5B3633.jpeg',
        'chest_pneumonia_1.jpg': 'https://github.com/ieee8023/covid-chestxray-dataset/raw/master/images/6C94A287-C059-46A0-8600-AFB95F4727B7.jpeg',
        'chest_normal_2.jpg': 'https://github.com/ieee8023/covid-chestxray-dataset/raw/master/images/7C69C012-7479-493F-8722-ABC29C60A2DD.jpeg',
        'chest_covid_1.jpg': 'https://github.com/ieee8023/covid-chestxray-dataset/raw/master/images/8FDE8DBA-CFBD-4B4C-B1A4-6F36A93DDB5A.jpeg',
        'chest_pneumonia_2.jpg': 'https://github.com/ieee8023/covid-chestxray-dataset/raw/master/images/23E99E2E-447C-46E5-8E2A-D5AC5A78C69D.jpeg',
    }
    
    # Alternative: Use sample images from medical imaging datasets
    backup_images = {
        'chest_xray_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Chest_X-ray_-_normal.jpg/512px-Chest_X-ray_-_normal.jpg',
        'chest_xray_2.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Pneumonia_x-ray.jpg/512px-Pneumonia_x-ray.jpg',
        'knee_xray_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Knee_X-ray_lateral_view.jpg/512px-Knee_X-ray_lateral_view.jpg',
        'spine_xray_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Spine_X-ray.jpg/512px-Spine_X-ray.jpg',
        'hip_xray_1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Hip_X-ray.jpg/512px-Hip_X-ray.jpg',
    }
    
    print("Downloading real X-ray images...")
    
    # Try to download from both sources
    all_images = {**xray_images, **backup_images}
    
    downloaded_count = 0
    for filename, url in all_images.items():
        try:
            print(f"Downloading {filename}...")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            file_path = sample_dir / filename
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded {filename}")
            downloaded_count += 1
            
        except Exception as e:
            print(f"❌ Failed to download {filename}: {e}")
    
    print(f"\nDownloaded {downloaded_count} images to {sample_dir}")
    return sample_dir

if __name__ == "__main__":
    download_real_xray_images() 