#!/usr/bin/env python3
"""
Zenetia Zap API Demo Script
This script demonstrates how to use the various endpoints of the Zenetia Zap API
"""

import requests
import json
import time
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# Note: In a real application, you would get this token from Clerk's frontend SDK
# This is just for demonstration purposes
CLERK_JWT_TOKEN = "your_clerk_jwt_token_here"

# Headers with authentication
HEADERS = {
    "Authorization": f"Bearer {CLERK_JWT_TOKEN}",
    "Content-Type": "application/json"
}

def print_response(response, title="Response"):
    """Pretty print API response"""
    print(f"\n--- {title} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print("-" * 40)

def demo_health_check():
    """Test health check endpoint"""
    print("🏥 Testing Health Check")
    response = requests.get(f"{API_BASE}/core/health")
    print_response(response, "Health Check")

def demo_authentication():
    """Test authentication endpoints"""
    print("🔐 Testing Authentication")
    
    # Login with demo admin
    login_data = {
        "email": "admin@zenetia.com",
        "password": "admin123"
    }
    response = requests.post(f"{API_BASE}/auth/login", params=login_data)
    print_response(response, "Login")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get user profile
        profile_response = requests.get(f"{API_BASE}/auth/profile", headers=headers)
        print_response(profile_response, "User Profile")
        
        return token
    return None

def demo_core_endpoints():
    """Test core system endpoints"""
    print("⚡ Testing Core Endpoints")
    
    # Get supported formats
    response = requests.get(f"{API_BASE}/core/formats")
    print_response(response, "Supported Formats")
    
    # Get usage stats
    response = requests.get(f"{API_BASE}/core/stats")
    print_response(response, "Usage Statistics")

def demo_file_upload():
    """Test file upload (using a simple text file as example)"""
    print("📁 Testing File Upload")
    
    # Create a simple test file
    test_file_path = Path("test_upload.txt")
    test_file_path.write_text("This is a test file for upload demonstration.")
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_upload.txt', f, 'text/plain')}
            response = requests.post(f"{API_BASE}/core/upload", files=files)
            print_response(response, "File Upload")
            
            if response.status_code == 200:
                return response.json().get("file_id")
    finally:
        # Clean up test file
        if test_file_path.exists():
            test_file_path.unlink()
    
    return None

def demo_file_validation():
    """Test file validation"""
    print("✅ Testing File Validation")
    
    # Create a simple test file
    test_file_path = Path("test_validation.txt")
    test_file_path.write_text("This is a test file for validation.")
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_validation.txt', f, 'text/plain')}
            response = requests.post(f"{API_BASE}/core/validate", files=files)
            print_response(response, "File Validation")
    finally:
        # Clean up test file
        if test_file_path.exists():
            test_file_path.unlink()

def demo_user_registration():
    """Test user registration"""
    print("👤 Testing User Registration")
    
    user_data = {
        "email": "newuser@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=user_data)
    print_response(response, "User Registration")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🔐 Testing Authentication Endpoints...")
    
    # Test token verification
    try:
        response = requests.post(f"{API_BASE}/auth/verify", headers=HEADERS)
        print(f"Token verification: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Auth test failed: {e}")
    
    # Test user profile
    try:
        response = requests.get(f"{API_BASE}/auth/me", headers=HEADERS)
        print(f"User profile: {response.status_code}")
        if response.status_code == 200:
            print(f"User: {response.json()}")
    except Exception as e:
        print(f"Profile test failed: {e}")

def test_pdf_merge():
    """Test PDF merging functionality"""
    print("\n📄 Testing PDF Merge...")
    
    # Create sample PDF files (in a real scenario, you'd have actual PDF files)
    files = [
        ("files", ("sample1.pdf", b"dummy pdf content 1", "application/pdf")),
        ("files", ("sample2.pdf", b"dummy pdf content 2", "application/pdf"))
    ]
    
    try:
        response = requests.post(
            f"{API_BASE}/pdf/merge",
            files=files,
            headers={"Authorization": f"Bearer {CLERK_JWT_TOKEN}"}
        )
        print(f"PDF Merge: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Conversion ID: {result['conversion_id']}")
            print(f"Download URL: {result['download_url']}")
    except Exception as e:
        print(f"PDF merge test failed: {e}")

def test_pdf_to_word():
    """Test PDF to Word conversion"""
    print("\n📝 Testing PDF to Word Conversion...")
    
    files = {
        "file": ("sample.pdf", b"dummy pdf content", "application/pdf")
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/pdf/to-word",
            files=files,
            headers={"Authorization": f"Bearer {CLERK_JWT_TOKEN}"}
        )
        print(f"PDF to Word: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Conversion ID: {result['conversion_id']}")
            print(f"Download URL: {result['download_url']}")
            print(f"User ID: {result.get('user_id')}")
    except Exception as e:
        print(f"PDF to Word test failed: {e}")

def test_system_health():
    """Test system health endpoints"""
    print("\n🏥 Testing System Health...")
    
    # Test main health endpoint
    try:
        response = requests.get(f"{API_BASE}/core/health")
        print(f"System Health: {response.status_code}")
        if response.status_code == 200:
            print(f"System: {response.json()['status']}")
    except Exception as e:
        print(f"System health test failed: {e}")
    
    # Test auth health endpoint
    try:
        response = requests.get(f"{API_BASE}/auth/health")
        print(f"Auth Health: {response.status_code}")
        if response.status_code == 200:
            health = response.json()
            print(f"Auth: {health['status']}")
            print(f"Clerk Integration: {health['clerk_integration']}")
    except Exception as e:
        print(f"Auth health test failed: {e}")

def main():
    """Main demo function"""
    print("🚀 Zenetia Zap API Demo with Clerk Authentication")
    print("=" * 50)
    
    print("\n⚠️  IMPORTANT SETUP NOTES:")
    print("1. Make sure to create a .env file with your Clerk credentials")
    print("2. Update CLERK_JWT_TOKEN in this script with a real token from Clerk")
    print("3. Start the FastAPI server: uvicorn app.main:app --reload")
    print("4. Install dependencies: pip install -r requirements.txt")
    
    # Test if server is running
    try:
        response = requests.get(f"{API_BASE}/core/health")
        if response.status_code != 200:
            print("\n❌ Server is not running or not healthy!")
            return
    except Exception as e:
        print(f"\n❌ Cannot connect to server: {e}")
        print("Make sure the server is running on http://localhost:8000")
        return
    
    print("\n✅ Server is running!")
    
    # Run tests
    test_system_health()
    
    if CLERK_JWT_TOKEN == "your_clerk_jwt_token_here":
        print("\n⚠️  Skipping authenticated tests - please set a real Clerk JWT token")
        print("To get a token:")
        print("1. Sign in to your Clerk-enabled frontend")
        print("2. Use Clerk's session.getToken() method")
        print("3. Update CLERK_JWT_TOKEN in this script")
    else:
        test_auth_endpoints()
        test_pdf_merge()
        test_pdf_to_word()
    
    print("\n✅ Demo completed!")

if __name__ == "__main__":
    main() 