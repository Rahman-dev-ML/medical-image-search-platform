from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from xray_search.models import XRay, BodyPart


class Command(BaseCommand):
    help = 'Set up default user groups and permissions for medical staff'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up user groups and permissions...'))
        
        # Get content types
        xray_ct = ContentType.objects.get_for_model(XRay)
        bodypart_ct = ContentType.objects.get_for_model(BodyPart)
        
        # Define groups and their permissions
        groups_permissions = {
            'Radiologists': [
                # X-ray permissions
                'add_xray', 'change_xray', 'view_xray', 'can_upload_xrays', 'can_manage_xrays',
                # Body part permissions
                'view_bodypart', 'add_bodypart', 'can_manage_body_parts'
            ],
            'Data Managers': [
                # Full X-ray permissions including delete
                'add_xray', 'change_xray', 'delete_xray', 'view_xray', 
                'can_upload_xrays', 'can_delete_xrays', 'can_manage_xrays',
                # Full body part permissions
                'add_bodypart', 'change_bodypart', 'view_bodypart', 'can_manage_body_parts'
            ],
            'Medical Researchers': [
                # View and search permissions only
                'view_xray', 'view_bodypart'
            ],
            'System Administrators': [
                # All permissions
                'add_xray', 'change_xray', 'delete_xray', 'view_xray',
                'can_upload_xrays', 'can_delete_xrays', 'can_manage_xrays',
                'add_bodypart', 'change_bodypart', 'delete_bodypart', 'view_bodypart',
                'can_manage_body_parts', 'can_delete_body_parts'
            ]
        }
        
        # Create groups and assign permissions
        for group_name, permissions in groups_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)
            
            if created:
                self.stdout.write(f'Created group: {group_name}')
            else:
                self.stdout.write(f'Group already exists: {group_name}')
            
            # Clear existing permissions
            group.permissions.clear()
            
            # Add permissions
            for perm_codename in permissions:
                try:
                    # Try to find the permission
                    permission = Permission.objects.get(codename=perm_codename)
                    group.permissions.add(permission)
                    self.stdout.write(f'  Added permission: {perm_codename}')
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'  Permission not found: {perm_codename}')
                    )
        
        self.stdout.write(
            self.style.SUCCESS('\nSuccessfully set up user groups and permissions!')
        )
        self.stdout.write('\nAvailable groups:')
        self.stdout.write('- Radiologists: Can upload and manage X-rays, add body parts')
        self.stdout.write('- Data Managers: Full CRUD access to X-rays and body parts')
        self.stdout.write('- Medical Researchers: View-only access for research')
        self.stdout.write('- System Administrators: Full access to everything')
        self.stdout.write('\nTo add a user to a group, use the Django admin interface.') 