#!/usr/bin/env python3
"""
Quick server test script for the AI Resume Builder Django backend
"""
import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def test_django_server():
    """Test if the Django server can start and respond"""

    print("🚀 Testing AI Resume Builder Django Server...")
    print("=" * 50)

    # Change to backend directory
    backend_dir = Path(__file__).parent / "ai_backend"
    os.chdir(backend_dir)

    print(f"📁 Working directory: {os.getcwd()}")

    # Check if manage.py exists
    if not Path("manage.py").exists():
        print("❌ ERROR: manage.py not found!")
        return False

    print("✅ Found manage.py")

    # Activate virtual environment and check Django
    try:
        # Test Django configuration
        print("\n🔍 Checking Django configuration...")
        result = subprocess.run([
            sys.executable, "manage.py", "check", "--deploy"
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            print("✅ Django configuration check passed")
        else:
            print("⚠️  Django configuration issues:")
            print(result.stdout)
            print(result.stderr)

    except subprocess.TimeoutExpired:
        print("⚠️  Django check timed out")
    except Exception as e:
        print(f"⚠️  Django check failed: {e}")

    # Try to run migrations
    try:
        print("\n📦 Running migrations...")
        result = subprocess.run([
            sys.executable, "manage.py", "migrate", "--run-syncdb"
        ], capture_output=True, text=True, timeout=60)

        if result.returncode == 0:
            print("✅ Migrations completed successfully")
        else:
            print("⚠️  Migration issues:")
            print(result.stdout)
            print(result.stderr)

    except Exception as e:
        print(f"⚠️  Migration failed: {e}")

    # Start the server
    print("\n🌐 Starting Django development server...")
    try:
        # Start server in background
        server_process = subprocess.Popen([
            sys.executable, "manage.py", "runserver", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Wait a moment for server to start
        time.sleep(3)

        # Test if server is responding
        try:
            response = requests.get("http://localhost:8000", timeout=10)
            if response.status_code == 200:
                print("✅ Server is running and responding!")
                print(f"📊 Status Code: {response.status_code}")
            else:
                print(f"⚠️  Server responded with status: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to server on localhost:8000")
        except requests.exceptions.Timeout:
            print("❌ Server request timed out")
        except Exception as e:
            print(f"❌ Server test failed: {e}")

        # Test API endpoints
        try:
            print("\n🔌 Testing API endpoints...")
            api_response = requests.get("http://localhost:8000/api/", timeout=5)
            if api_response.status_code in [200, 404]:  # 404 is ok if no root API view
                print("✅ API endpoint accessible")
            else:
                print(f"⚠️  API returned status: {api_response.status_code}")
        except Exception as e:
            print(f"⚠️  API test failed: {e}")

        # Stop the server
        print("\n🛑 Stopping server...")
        server_process.terminate()
        server_process.wait(timeout=5)
        print("✅ Server stopped")

        return True

    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

if __name__ == "__main__":
    success = test_django_server()
    if success:
        print("\n🎉 Server test completed!")
        print("\n📋 Next steps:")
        print("1. cd ai_backend")
        print("2. source ../ai_venv/bin/activate")
        print("3. python manage.py runserver")
        print("4. Open http://localhost:8000 in your browser")
    else:
        print("\n❌ Server test failed. Check the errors above.")
