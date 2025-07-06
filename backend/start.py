#!/usr/bin/env python3
"""
Startup script for the PDF Processing API
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting PDF Processing API...")
    print("📄 Access API documentation at: http://localhost:8000/docs")
    print("🔧 Health check at: http://localhost:8000/health")
    print("⚡ Server running on: http://localhost:8000")
    
    uvicorn.run(
        "main:app",  # Use import string for reload
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    ) 