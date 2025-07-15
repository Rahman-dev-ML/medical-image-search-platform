#!/usr/bin/env python
"""
Complete setup script for Medical Image Search Platform
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and display the result"""
    print(f"\n[RUNNING] {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[SUCCESS] {description} completed successfully")
            if result.stdout.strip():
                print(result.stdout.strip())
        else:
            print(f"[ERROR] {description} failed:")
            print(result.stderr.strip())
            return False
    except Exception as e:
        print(f"[ERROR] Error running {description}: {e}")
        return False
    return True

def main():
    """Main setup function"""
    print("Medical Image Search Platform Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("[ERROR] Please run this script from the backend directory")
        sys.exit(1)
    
    # Step 1: Make migrations
    if not run_command("python manage.py makemigrations", "Creating database migrations"):
        return
    
    # Step 2: Apply migrations
    if not run_command("python manage.py migrate", "Applying database migrations"):
        return
    
    # Step 3: Create superuser
    if not run_command("python create_superuser.py", "Creating admin superuser"):
        return
    
    # Step 4: Seed database with real X-ray data
    if not run_command("python manage.py seed_data --clear --count 20", "Seeding database with X-ray data"):
        return
    
    print("\n" + "=" * 50)
    print("[SUCCESS] Setup completed successfully!")
    print("\nWhat's been created:")
    print("- Database with X-ray table")
    print("- Admin superuser (username: admin, password: admin123)")
    print("- 20 realistic X-ray records with real medical images")
    print("- All 10 body parts with various conditions")
    
    print("\nNext steps:")
    print("1. Start the server: python manage.py runserver")
    print("2. Visit API: http://127.0.0.1:8000/")
    print("3. Admin panel: http://127.0.0.1:8000/admin/")
    print("4. Test API endpoints: http://127.0.0.1:8000/api/xrays/")
    
    print("\nDatabase contains:")
    print("- Patient records with realistic medical data")
    print("- Real X-ray images from medical sources")
    print("- Searchable descriptions and diagnoses")
    print("- Tagged conditions for filtering")
    print("- Data from 10 major medical institutions")

if __name__ == "__main__":
    main() 