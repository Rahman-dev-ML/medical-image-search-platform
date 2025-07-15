#!/usr/bin/env python
"""
Script to create a superuser for Django admin
"""
import os
import sys
import django
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    """Create a superuser if one doesn't exist"""
    
    # Default superuser credentials
    username = 'admin'
    email = 'admin@medproject.com'
    password = 'admin123'
    
    # Check if superuser already exists
    if User.objects.filter(username=username).exists():
        print(f"[SUCCESS] Superuser '{username}' already exists")
        print(f"   Username: {username}")
        print(f"   Password: {password}")
        print(f"   Admin URL: http://127.0.0.1:8000/admin/")
        return
    
    # Create superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"[SUCCESS] Superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Admin URL: http://127.0.0.1:8000/admin/")
        print("\n[INFO] Please change the password after first login!")
        
    except Exception as e:
        print(f"[ERROR] Error creating superuser: {e}")

if __name__ == "__main__":
    create_superuser() 