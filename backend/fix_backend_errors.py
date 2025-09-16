#!/usr/bin/env python3
"""
Backend Error Diagnosis and Fix Script
This script helps identify and fix common backend issues preventing data saving.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_python_packages():
    """Check if all required packages are installed"""
    print("🔍 Checking Python packages...")
    
    required_packages = [
        'Django==4.2.7',
        'djangorestframework==3.14.0',
        'mongoengine==0.27.0',
        'django-cors-headers==4.3.1',
        'PyJWT==2.8.0',
        'python-decouple==3.8',
        'pandas==2.1.3',
        'django-ratelimit==4.1.0'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        package_name = package.split('==')[0]
        try:
            __import__(package_name.replace('-', '_'))
            print(f"✅ {package_name} - OK")
        except ImportError:
            print(f"❌ {package_name} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages...")
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to install {package}: {e}")
    
    return len(missing_packages) == 0

def check_mongodb_connection():
    """Check MongoDB connection"""
    print("\n🔍 Checking MongoDB connection...")
    
    try:
        import mongoengine
        from decouple import config
        
        # Get MongoDB URI from environment
        mongodb_uri = config('MONGODB_URI', default='mongodb://localhost:27017/buyer_leads')
        print(f"📍 MongoDB URI: {mongodb_uri}")
        
        # Try to connect
        mongoengine.connect(host=mongodb_uri)
        print("✅ MongoDB connection - OK")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n💡 Solutions:")
        print("1. Make sure MongoDB is running:")
        print("   - Windows: Start MongoDB service")
        print("   - Mac: brew services start mongodb-community")
        print("   - Linux: sudo systemctl start mongod")
        print("2. Check if MongoDB URI in .env is correct")
        print("3. Install MongoDB if not installed")
        return False

def check_django_setup():
    """Check Django configuration"""
    print("\n🔍 Checking Django setup...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buyer_leads.settings')
        import django
        django.setup()
        
        from django.core.management import execute_from_command_line
        
        # Check if migrations are needed
        print("📋 Checking migrations...")
        try:
            from django.core.management.commands.showmigrations import Command
            print("✅ Django setup - OK")
            return True
        except Exception as e:
            print(f"❌ Django setup issue: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def check_cors_settings():
    """Check CORS configuration"""
    print("\n🔍 Checking CORS settings...")
    
    try:
        from buyer_leads.settings import CORS_ALLOWED_ORIGINS, CORS_ALLOW_CREDENTIALS
        
        expected_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        
        print(f"📍 CORS Origins: {CORS_ALLOWED_ORIGINS}")
        print(f"📍 CORS Credentials: {CORS_ALLOW_CREDENTIALS}")
        
        if all(origin in CORS_ALLOWED_ORIGINS for origin in expected_origins):
            print("✅ CORS configuration - OK")
            return True
        else:
            print("⚠️  CORS configuration might need adjustment")
            return False
            
    except Exception as e:
        print(f"❌ CORS check failed: {e}")
        return False

def run_django_checks():
    """Run Django system checks"""
    print("\n🔍 Running Django system checks...")
    
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'buyer_leads.settings')
        import django
        django.setup()
        
        from django.core.management import call_command
        from io import StringIO
        
        # Capture output
        output = StringIO()
        call_command('check', stdout=output)
        result = output.getvalue()
        
        if "System check identified no issues" in result:
            print("✅ Django system checks - OK")
            return True
        else:
            print(f"⚠️  Django system checks found issues:\n{result}")
            return False
            
    except Exception as e:
        print(f"❌ Django system checks failed: {e}")
        return False

def test_api_endpoints():
    """Test if API endpoints are accessible"""
    print("\n🔍 Testing API endpoints...")
    
    try:
        import requests
        
        base_url = "http://localhost:8000/api"
        
        # Test demo login
        response = requests.post(f"{base_url}/auth/demo-login/", timeout=5)
        if response.status_code == 200:
            print("✅ Demo login endpoint - OK")
            
            # Get token and test protected endpoint
            token = response.json().get('token')
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test buyers list
            response = requests.get(f"{base_url}/leads/buyers/", headers=headers, timeout=5)
            if response.status_code == 200:
                print("✅ Buyers list endpoint - OK")
                return True
            else:
                print(f"❌ Buyers list endpoint failed: {response.status_code}")
                return False
        else:
            print(f"❌ Demo login endpoint failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("💡 Make sure Django development server is running:")
        print("   python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        return False

def main():
    """Main diagnosis function"""
    print("🚀 Backend Error Diagnosis Starting...\n")
    
    checks = [
        ("Python Packages", check_python_packages),
        ("MongoDB Connection", check_mongodb_connection),
        ("Django Setup", check_django_setup),
        ("CORS Settings", check_cors_settings),
        ("Django System Checks", run_django_checks),
        ("API Endpoints", test_api_endpoints),
    ]
    
    results = {}
    
    for check_name, check_func in checks:
        try:
            results[check_name] = check_func()
        except Exception as e:
            print(f"❌ {check_name} check crashed: {e}")
            results[check_name] = False
    
    print("\n" + "="*50)
    print("📊 DIAGNOSIS SUMMARY")
    print("="*50)
    
    all_passed = True
    for check_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! Backend should be working correctly.")
    else:
        print("\n⚠️  Some checks failed. Please address the issues above.")
        print("\n💡 Common solutions:")
        print("1. Install missing packages: pip install -r requirements.txt")
        print("2. Start MongoDB service")
        print("3. Run migrations: python manage.py migrate")
        print("4. Start Django server: python manage.py runserver")

if __name__ == "__main__":
    main()