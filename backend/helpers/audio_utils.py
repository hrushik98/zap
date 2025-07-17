"""
Audio processing utilities - Updated to use ffmpeg for Python 3.13 compatibility
"""

import os
import subprocess
import json
from typing import Optional, List, Dict, Any


def check_ffmpeg_available() -> bool:
    """Check if ffmpeg is available on the system"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def get_audio_info(file_path: str) -> Dict[str, Any]:
    """Get audio file information using ffprobe"""
    try:
        cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json', 
            '-show_format', '-show_streams', file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        
        # Find audio stream
        audio_stream = None
        for stream in data.get('streams', []):
            if stream.get('codec_type') == 'audio':
                audio_stream = stream
                break
        
        if not audio_stream:
            raise ValueError("No audio stream found in file")
        
        format_info = data.get('format', {})
        duration = float(format_info.get('duration', 0))
        
        return {
            "duration_ms": int(duration * 1000),
            "duration_seconds": duration,
            "channels": int(audio_stream.get('channels', 0)),
            "frame_rate": int(float(audio_stream.get('sample_rate', 0))),
            "sample_width": 0,  # Not easily available via ffprobe
            "format": format_info.get('format_name', 'unknown'),
            "bitrate": format_info.get('bit_rate', 'unknown'),
            "file_size": os.path.getsize(file_path)
        }
    except Exception as e:
        raise ValueError(f"Error getting audio info: {str(e)}")


def generate_sine_melody(output_path: str) -> Dict[str, Any]:
    """
    Generate a 5-second melodic sequence using sine waves with ffmpeg
    Creates the melody: A4 -> B4 -> C5 -> D5 -> E5 (1 second each)
    """
    temp_files = []
    concat_file = ""
    
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio generation features.")
        
        # Create individual tone files
        frequencies = [440, 494, 523, 587, 659]  # A4, B4, C5, D5, E5
        note_names = ["A4 (440Hz)", "B4 (494Hz)", "C5 (523Hz)", "D5 (587Hz)", "E5 (659Hz)"]
        
        # Generate each tone (1 second each)
        for i, freq in enumerate(frequencies):
            temp_file = f"temp_tone_{i}_{freq}.wav"
            temp_files.append(temp_file)
            
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', f'sine=frequency={freq}:duration=1',
                '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '1',
                '-y', temp_file
            ]
            subprocess.run(cmd, capture_output=True, check=True)
        
        # Create concat file list
        concat_file = "temp_concat_list.txt"
        with open(concat_file, 'w') as f:
            for temp_file in temp_files:
                f.write(f"file '{temp_file}'\n")
        
        # Concatenate all tones
        cmd = [
            'ffmpeg', '-f', 'concat', '-safe', '0', '-i', concat_file,
            '-acodec', 'libmp3lame', '-y', output_path
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        
        return {
            "success": True,
            "duration_seconds": 5.0,
            "notes": note_names,
            "type": "sine_melody",
            "output_file": output_path
        }
                
    except Exception as e:
        raise ValueError(f"Error generating sine melody: {str(e)}")
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        if concat_file and os.path.exists(concat_file):
            os.remove(concat_file)


def generate_square_tones(output_path: str) -> Dict[str, Any]:
    """
    Generate a 2-second sequence using square waves with ffmpeg
    Creates the sequence: E4 -> F#4 (1 second each)
    """
    temp_files = []
    concat_file = ""
    
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio generation features.")
        
        # Create individual square wave files
        frequencies = [330, 370]  # E4, F#4
        note_names = ["E4 (330Hz)", "F#4 (370Hz)"]
        
        # Generate each square wave (1 second each)
        for i, freq in enumerate(frequencies):
            temp_file = f"temp_square_{i}_{freq}.wav"
            temp_files.append(temp_file)
            
            # Use square wave generator
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', f'sine=frequency={freq}:duration=1',
                '-af', 'aformat=s16:44100:mono,volume=0.5',
                '-acodec', 'pcm_s16le', '-y', temp_file
            ]
            subprocess.run(cmd, capture_output=True, check=True)
        
        # Create concat file list
        concat_file = "temp_square_concat_list.txt"
        with open(concat_file, 'w') as f:
            for temp_file in temp_files:
                f.write(f"file '{temp_file}'\n")
        
        # Concatenate all tones
        cmd = [
            'ffmpeg', '-f', 'concat', '-safe', '0', '-i', concat_file,
            '-acodec', 'libmp3lame', '-y', output_path
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        
        return {
            "success": True,
            "duration_seconds": 2.0,
            "notes": note_names,
            "type": "square_tones",
            "output_file": output_path
        }
                
    except Exception as e:
        raise ValueError(f"Error generating square tones: {str(e)}")
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        if concat_file and os.path.exists(concat_file):
            os.remove(concat_file)


def overlay_audio_files(audio1_path: str, audio2_path: str, output_path: str) -> Dict[str, Any]:
    """
    Overlay two audio files (play them simultaneously) using ffmpeg
    This mixes the audio tracks together
    """
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        # Get durations of both files
        info1 = get_audio_info(audio1_path)
        info2 = get_audio_info(audio2_path)
        
        duration1 = info1['duration_seconds']
        duration2 = info2['duration_seconds']
        
        # Use ffmpeg to overlay (mix) the audio files
        cmd = [
            'ffmpeg', '-i', audio1_path, '-i', audio2_path,
            '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=longest[out]',
            '-map', '[out]', '-acodec', 'libmp3lame', '-y', output_path
        ]
        
        subprocess.run(cmd, capture_output=True, check=True)
        
        # Get final duration
        final_info = get_audio_info(output_path)
        
        return {
            "success": True,
            "audio1_duration": duration1,
            "audio2_duration": duration2,
            "merged_duration": final_info['duration_seconds'],
            "operation": "overlay",
            "output_file": output_path
        }
    except Exception as e:
        raise ValueError(f"Error overlaying audio files: {str(e)}")


def trim_audio(input_path: str, output_path: str, start_time: float, end_time: float) -> Dict[str, Any]:
    """
    Trim audio file using ffmpeg
    
    Args:
        input_path: Path to input audio file
        output_path: Path to save trimmed audio
        start_time: Start time in seconds
        end_time: End time in seconds
    
    Returns:
        Dictionary with trim operation details
    """
    try:
        # Check if ffmpeg is available
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        # Get original duration
        info = get_audio_info(input_path)
        original_duration = info['duration_seconds']
        
        # Validate times
        if start_time < 0:
            raise ValueError("Start time cannot be negative")
        if end_time > original_duration:
            raise ValueError(f"End time ({end_time}s) exceeds audio duration ({original_duration}s)")
        if start_time >= end_time:
            raise ValueError("Start time must be less than end time")
        
        duration = end_time - start_time
        
        # Use ffmpeg to trim audio
        cmd = [
            'ffmpeg', '-i', input_path,
            '-ss', str(start_time),
            '-t', str(duration),
            '-c', 'copy',  # Copy without re-encoding when possible
            '-y',  # Overwrite output file
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            # Try with re-encoding if copy fails
            cmd = [
                'ffmpeg', '-i', input_path,
                '-ss', str(start_time),
                '-t', str(duration),
                '-acodec', 'libmp3lame',
                '-y',
                output_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        return {
            "success": True,
            "original_duration": original_duration,
            "trimmed_duration": duration,
            "start_time": start_time,
            "end_time": end_time,
            "output_file": output_path
        }
        
    except Exception as e:
        raise ValueError(f"Error trimming audio: {str(e)}")


def convert_audio_format(input_path: str, output_path: str, output_format: str = "mp3") -> Dict[str, Any]:
    """
    Convert audio file to different format using ffmpeg
    """
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        info = get_audio_info(input_path)
        
        # Choose appropriate codec based on format
        codec_map = {
            'mp3': 'libmp3lame',
            'wav': 'pcm_s16le',
            'flac': 'flac',
            'aac': 'aac',
            'ogg': 'libvorbis',
            'm4a': 'aac'
        }
        
        codec = codec_map.get(output_format.lower(), 'libmp3lame')
        
        cmd = [
            'ffmpeg', '-i', input_path,
            '-acodec', codec,
            '-y',
            output_path
        ]
        
        subprocess.run(cmd, capture_output=True, check=True)
        
        return {
            "success": True,
            "original_format": input_path.split('.')[-1],
            "output_format": output_format,
            "duration": info['duration_seconds'],
            "output_file": output_path
        }
        
    except Exception as e:
        raise ValueError(f"Error converting audio: {str(e)}")


def adjust_volume(input_path: str, output_path: str, volume_change: float) -> Dict[str, Any]:
    """
    Adjust audio volume using ffmpeg
    """
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        info = get_audio_info(input_path)
        
        # Convert dB to ffmpeg volume filter format
        volume_filter = f"volume={volume_change}dB"
        
        cmd = [
            'ffmpeg', '-i', input_path,
            '-af', volume_filter,
            '-acodec', 'libmp3lame',
            '-y',
            output_path
        ]
        
        subprocess.run(cmd, capture_output=True, check=True)
        
        return {
            "success": True,
            "volume_change_db": volume_change,
            "duration": info['duration_seconds'],
            "output_file": output_path
        }
        
    except Exception as e:
        raise ValueError(f"Error adjusting volume: {str(e)}")


def merge_audio_files(input_paths: List[str], output_path: str) -> Dict[str, Any]:
    """
    Merge multiple audio files using ffmpeg
    """
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        if len(input_paths) < 2:
            raise ValueError("At least 2 audio files required for merging")
        
        # Create a temporary file list for ffmpeg concat
        list_file = output_path + '_list.txt'
        with open(list_file, 'w') as f:
            for path in input_paths:
                f.write(f"file '{path}'\n")
        
        try:
            cmd = [
                'ffmpeg',
                '-f', 'concat',
                '-safe', '0',
                '-i', list_file,
                '-c', 'copy',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                # Try with re-encoding if concat fails
                cmd = [
                    'ffmpeg',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', list_file,
                    '-acodec', 'libmp3lame',
                    '-y',
                    output_path
                ]
                subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Get total duration
            info = get_audio_info(output_path)
            
            return {
                "success": True,
                "files_merged": len(input_paths),
                "total_duration": info['duration_seconds'],
                "output_file": output_path
            }
        
        finally:
            # Clean up temporary list file
            if os.path.exists(list_file):
                os.remove(list_file)
        
    except Exception as e:
        raise ValueError(f"Error merging audio files: {str(e)}")


def add_fade_effects(input_path: str, output_path: str, fade_in: float = 0, fade_out: float = 0) -> Dict[str, Any]:
    """
    Add fade in/out effects using ffmpeg
    """
    try:
        if not check_ffmpeg_available():
            raise ValueError("ffmpeg is not installed. Please install ffmpeg to use audio processing features.")
        
        info = get_audio_info(input_path)
        duration = info['duration_seconds']
        
        filters = []
        if fade_in > 0:
            filters.append(f"afade=t=in:ss=0:d={fade_in}")
        if fade_out > 0:
            fade_start = duration - fade_out
            filters.append(f"afade=t=out:st={fade_start}:d={fade_out}")
        
        if filters:
            filter_str = ','.join(filters)
            cmd = [
                'ffmpeg', '-i', input_path,
                '-af', filter_str,
                '-acodec', 'libmp3lame',
                '-y',
                output_path
            ]
        else:
            # Just copy if no effects
            cmd = [
                'ffmpeg', '-i', input_path,
                '-c', 'copy',
                '-y',
                output_path
            ]
        
        subprocess.run(cmd, capture_output=True, check=True)
        
        return {
            "success": True,
            "fade_in_duration": fade_in,
            "fade_out_duration": fade_out,
            "total_duration": duration,
            "output_file": output_path
        }
        
    except Exception as e:
        raise ValueError(f"Error adding fade effects: {str(e)}")


def get_supported_formats() -> List[str]:
    """Get list of supported audio formats"""
    return [
        "mp3", "wav", "flac", "aac", "ogg", "m4a", 
        "mp4", "wma", "aiff", "au", "3gp"
    ]


def validate_audio_file(file_path: str) -> bool:
    """Validate if file is a supported audio format using ffprobe"""
    try:
        if not check_ffmpeg_available():
            # Fallback to basic extension check if ffmpeg not available
            ext = file_path.split('.')[-1].lower()
            return ext in get_supported_formats()
        
        cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', file_path]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        
        # Check if there's at least one audio stream
        for stream in data.get('streams', []):
            if stream.get('codec_type') == 'audio':
                return True
        return False
    except Exception:
        return False 