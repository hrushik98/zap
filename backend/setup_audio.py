#!/usr/bin/env python3
"""
Setup script to check and install audio processing dependencies
"""

import subprocess
import sys
import platform

def check_ffmpeg():
    """Check if ffmpeg is installed and working"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True, check=True)
        version_line = result.stdout.split('\n')[0]
        print(f"✅ FFmpeg is installed: {version_line}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ FFmpeg is not installed or not in PATH")
        return False

def check_ffprobe():
    """Check if ffprobe is installed and working"""
    try:
        result = subprocess.run(['ffprobe', '-version'], capture_output=True, text=True, check=True)
        version_line = result.stdout.split('\n')[0]
        print(f"✅ FFprobe is installed: {version_line}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ FFprobe is not installed or not in PATH")
        return False

def get_installation_instructions():
    """Get platform-specific installation instructions"""
    system = platform.system().lower()
    
    if system == "windows":
        return """
🪟 Windows Installation Instructions:

1. Download FFmpeg from: https://ffmpeg.org/download.html#build-windows
2. Extract the files to a folder (e.g., C:\\ffmpeg)
3. Add the bin folder to your PATH:
   - Open System Properties → Advanced → Environment Variables
   - Edit the PATH variable and add: C:\\ffmpeg\\bin
   - Restart your terminal/command prompt

Alternative (using Chocolatey):
   choco install ffmpeg

Alternative (using Winget):
   winget install FFmpeg
"""
    
    elif system == "darwin":  # macOS
        return """
🍎 macOS Installation Instructions:

Using Homebrew (recommended):
   brew install ffmpeg

Using MacPorts:
   sudo port install ffmpeg

Manual installation:
   Download from https://evermeet.cx/ffmpeg/
"""
    
    elif system == "linux":
        return """
🐧 Linux Installation Instructions:

Ubuntu/Debian:
   sudo apt update
   sudo apt install ffmpeg

CentOS/RHEL/Fedora:
   sudo yum install ffmpeg
   # or
   sudo dnf install ffmpeg

Arch Linux:
   sudo pacman -S ffmpeg

Manual installation:
   Download from https://ffmpeg.org/download.html#build-linux
"""
    
    else:
        return """
📦 General Installation Instructions:

Please visit https://ffmpeg.org/download.html for platform-specific downloads.
Make sure to add FFmpeg to your system PATH after installation.
"""

def main():
    """Main setup function"""
    print("🎵 Audio Processing Setup Check")
    print("=" * 40)
    
    ffmpeg_ok = check_ffmpeg()
    ffprobe_ok = check_ffprobe()
    
    if ffmpeg_ok and ffprobe_ok:
        print("\n🎉 All audio processing dependencies are installed!")
        print("You can now use the audio trimming functionality.")
        
        # Test a simple ffmpeg command
        try:
            subprocess.run(['ffmpeg', '-f', 'lavfi', '-i', 'anullsrc=d=1', '-f', 'null', '-'], 
                         capture_output=True, check=True)
            print("✅ FFmpeg functionality test passed!")
        except Exception as e:
            print(f"⚠️  FFmpeg test failed: {e}")
            
        return True
    else:
        print("\n❌ Missing dependencies detected!")
        print(get_installation_instructions())
        print("\nAfter installing FFmpeg, restart your terminal and run this script again.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 