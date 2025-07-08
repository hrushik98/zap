#!/usr/bin/env python3
"""
Tesseract OCR Setup Script
Helps users install and configure Tesseract OCR for the PDF processing application.
"""

import os
import sys
import platform
import subprocess
import urllib.request
import tempfile
import zipfile
from pathlib import Path

def check_admin_privileges():
    """Check if script is running with admin privileges on Windows"""
    if platform.system() == "Windows":
        try:
            import ctypes
            return ctypes.windll.shell32.IsUserAnAdmin()
        except:
            return False
    return True

def download_tesseract_windows():
    """Download and install Tesseract OCR on Windows"""
    print("🔄 Downloading Tesseract OCR for Windows...")
    
    # Latest Tesseract Windows installer URL
    tesseract_url = "https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3.20231005/tesseract-ocr-w64-setup-5.3.3.20231005.exe"
    
    try:
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            installer_path = os.path.join(temp_dir, "tesseract-installer.exe")
            
            print(f"📥 Downloading from: {tesseract_url}")
            urllib.request.urlretrieve(tesseract_url, installer_path)
            
            print("✅ Download completed!")
            print(f"📁 Installer saved to: {installer_path}")
            
            # Ask user if they want to run the installer
            response = input("\n🤔 Do you want to run the installer now? (y/n): ").lower().strip()
            
            if response in ['y', 'yes']:
                print("🚀 Running Tesseract installer...")
                try:
                    # Run installer with elevated privileges
                    subprocess.run([installer_path], check=True)
                    print("✅ Tesseract installation completed!")
                    return True
                except subprocess.CalledProcessError:
                    print("❌ Installation failed. Please run the installer manually.")
                    print(f"📍 Installer location: {installer_path}")
                    return False
            else:
                print(f"📍 Installer saved to: {installer_path}")
                print("💡 Please run it manually with administrator privileges.")
                return False
                
    except Exception as e:
        print(f"❌ Error downloading Tesseract: {e}")
        return False

def check_tesseract_installation():
    """Check if Tesseract is properly installed"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ Tesseract is installed and accessible via PATH")
            print(f"📋 Version info: {result.stdout.split('tesseract')[1].split()[0] if 'tesseract' in result.stdout else 'Unknown'}")
            return True
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    # Check common installation paths
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            print(f"✅ Tesseract found at: {path}")
            print("⚠️  Warning: Tesseract is not in your system PATH")
            print("💡 Consider adding it to PATH for better integration")
            return True
    
    return False

def add_tesseract_to_path():
    """Help user add Tesseract to system PATH on Windows"""
    tesseract_paths = [
        r"C:\Program Files\Tesseract-OCR",
        r"C:\Program Files (x86)\Tesseract-OCR",
    ]
    
    existing_path = None
    for path in tesseract_paths:
        if os.path.exists(os.path.join(path, "tesseract.exe")):
            existing_path = path
            break
    
    if existing_path:
        print(f"\n🎯 Tesseract found at: {existing_path}")
        print("📝 To add it to your system PATH:")
        print("1. Press Win + R, type 'sysdm.cpl', press Enter")
        print("2. Click 'Environment Variables' button")
        print("3. In 'System Variables', find and select 'Path', click 'Edit'")
        print("4. Click 'New' and add this path:")
        print(f"   {existing_path}")
        print("5. Click OK to save changes")
        print("6. Restart your command prompt/IDE")
        return True
    
    return False

def install_python_requirements():
    """Install required Python packages"""
    print("\n🔄 Installing Python requirements...")
    
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True)
        print("✅ Python requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Tesseract OCR Setup for PDF Processing Application")
    print("=" * 60)
    
    system = platform.system()
    print(f"🖥️  Detected OS: {system}")
    
    # Check if Tesseract is already installed
    if check_tesseract_installation():
        print("\n🎉 Tesseract OCR is already installed and working!")
        
        # Still offer to install Python requirements
        response = input("\n🤔 Do you want to install/update Python requirements? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            install_python_requirements()
        
        print("\n✅ Setup completed! Your OCR functionality should work now.")
        return
    
    print("\n❌ Tesseract OCR is not installed or not accessible.")
    
    if system == "Windows":
        print("\n🔧 Setting up Tesseract OCR for Windows...")
        
        if not check_admin_privileges():
            print("⚠️  Warning: Running without administrator privileges")
            print("💡 You may need to run the installer manually with admin rights")
        
        success = download_tesseract_windows()
        
        if success:
            # Check again after installation
            if check_tesseract_installation():
                print("🎉 Tesseract installation successful!")
            else:
                print("⚠️  Installation completed but Tesseract not in PATH")
                add_tesseract_to_path()
        
        # Install Python requirements
        install_python_requirements()
        
    elif system == "Darwin":  # macOS
        print("\n🍎 For macOS, please install Tesseract using Homebrew:")
        print("1. Install Homebrew: https://brew.sh/")
        print("2. Run: brew install tesseract")
        print("3. Run this script again to verify installation")
        
    else:  # Linux
        print(f"\n🐧 For {system}, please install Tesseract using your package manager:")
        print("Ubuntu/Debian: sudo apt-get install tesseract-ocr")
        print("CentOS/RHEL: sudo yum install tesseract")
        print("Arch: sudo pacman -S tesseract")
        print("Then run this script again to verify installation")
    
    print("\n📚 For more information, visit:")
    print("   https://github.com/UB-Mannheim/tesseract/wiki")
    print("\n🔄 After installation, restart your FastAPI server")

if __name__ == "__main__":
    main() 