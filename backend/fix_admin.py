#!/usr/bin/env python
"""
Simple script to fix admin access and enable delete functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medproject.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from xray_search.models import XRay, BodyPart

def fix_admin():
    print("🔧 Fixing Django Admin Access...")
    
    # 1. Make all existing users staff so they can login to admin
    users = User.objects.all()
    for user in users:
        if not user.is_superuser:
            user.is_staff = True
            user.save()
            print(f"✅ Made {user.username} a staff member")
    
    # 2. Create a simple admin group with all permissions
    admin_group, created = Group.objects.get_or_create(name='Admin Users')
    if created:
        print("✅ Created 'Admin Users' group")
    
    # Give this group ALL permissions for XRay and BodyPart
    xray_permissions = Permission.objects.filter(content_type__model='xray')
    bodypart_permissions = Permission.objects.filter(content_type__model='bodypart')
    
    for perm in xray_permissions:
        admin_group.permissions.add(perm)
        print(f"✅ Added permission: {perm.codename}")
    
    for perm in bodypart_permissions:
        admin_group.permissions.add(perm)
        print(f"✅ Added permission: {perm.codename}")
    
    # 3. Add all non-superuser users to admin group
    for user in users:
        if not user.is_superuser:
            admin_group.user_set.add(user)
            print(f"✅ Added {user.username} to Admin Users group")
    
    print("\n🎉 Admin access fixed!")
    print("📋 What was fixed:")
    print("   - All users can now login to Django admin (marked as staff)")
    print("   - All users have full permissions to add/edit/delete X-rays")
    print("   - All users have full permissions to add/edit/delete body parts")
    print("   - Delete buttons should now be visible in admin")
    print("\n🔗 Access admin at: http://localhost:8000/admin/")

if __name__ == '__main__':
    fix_admin() 