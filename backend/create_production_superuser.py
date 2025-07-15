#!/usr/bin/env python
"""
Secure script to create a superuser for production deployment
"""
import os
import sys
import django
from decouple import config

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
django.setup()

from django.contrib.auth.models import User

def create_production_superuser():
    """Create a superuser with secure credentials from environment variables"""
    
    # Get credentials from environment variables
    username = config('ADMIN_USERNAME', default='admin')
    email = config('ADMIN_EMAIL', default='admin@medicalimagesearch.com')
    password = config('ADMIN_PASSWORD', default='')
    
    if not password:
        print("[ERROR] ADMIN_PASSWORD environment variable is required!")
        print("Please set ADMIN_PASSWORD in your environment variables")
        return False
    
    # Check if superuser already exists
    if User.objects.filter(username=username).exists():
        print(f"[INFO] Superuser '{username}' already exists")
        return True
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"[SUCCESS] Production superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print("   Password: [HIDDEN FOR SECURITY]")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error creating superuser: {e}")
        return False

if __name__ == "__main__":
    create_production_superuser() 