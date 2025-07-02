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

def main():
    """Run all demonstrations"""
    print("🚀 Zenetia Zap API Demonstration")
    print("=" * 50)
    
    try:
        # Test basic endpoints
        demo_health_check()
        demo_core_endpoints()
        
        # Test authentication
        token = demo_authentication()
        
        # Test file operations
        demo_file_upload()
        demo_file_validation()
        
        # Test user management
        demo_user_registration()
        
        print("\n✅ All API demonstrations completed!")
        print("\n📖 For full API documentation, visit:")
        print(f"   {BASE_URL}/docs")
        print(f"   {BASE_URL}/redoc")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API server.")
        print("Make sure the server is running at http://localhost:8000")
        print("Run: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")

if __name__ == "__main__":
    main() 