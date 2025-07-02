"""
Audio processing service
"""

import os
import asyncio
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

# Try to import audio processing libraries, handle gracefully if not available
try:
    from pydub import AudioSegment
    from pydub.effects import normalize
    AUDIO_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Audio processing not available: {str(e)}")
    AUDIO_AVAILABLE = False
    AudioSegment = None
    normalize = None

class AudioService:
    """Service for audio processing operations"""
    
    def __init__(self):
        self.audio_available = AUDIO_AVAILABLE
    
    async def convert_audio(
        self, 
        input_path: str, 
        output_path: str, 
        target_format: str,
        bitrate: Optional[int] = None,
        sample_rate: Optional[int] = None
    ) -> bool:
        """
        Convert audio file to different format
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Apply sample rate if specified
            if sample_rate:
                audio = audio.set_frame_rate(sample_rate)
            
            # Export parameters
            export_params = {"format": target_format}
            
            if bitrate:
                export_params["bitrate"] = f"{bitrate}k"
            
            # Export audio
            audio.export(output_path, **export_params)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting audio: {str(e)}")
            return False
    
    async def trim_audio(
        self, 
        input_path: str, 
        output_path: str, 
        start_time: float, 
        end_time: Optional[float] = None
    ) -> bool:
        """
        Trim audio file to specified time range
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Convert time to milliseconds
            start_ms = int(start_time * 1000)
            end_ms = int(end_time * 1000) if end_time else len(audio)
            
            # Trim audio
            trimmed_audio = audio[start_ms:end_ms]
            
            # Export trimmed audio
            trimmed_audio.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error trimming audio: {str(e)}")
            return False
    
    async def merge_audio(self, input_paths: List[str], output_path: str) -> bool:
        """
        Merge multiple audio files into one
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            if not input_paths:
                return False
            
            # Load first audio file
            combined = AudioSegment.from_file(input_paths[0])
            
            # Append other audio files
            for audio_path in input_paths[1:]:
                audio = AudioSegment.from_file(audio_path)
                combined += audio
            
            # Export merged audio
            combined.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input files
            for audio_path in input_paths:
                if os.path.exists(audio_path):
                    os.remove(audio_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error merging audio files: {str(e)}")
            return False
    
    async def adjust_volume(self, input_path: str, output_path: str, volume_change: float) -> bool:
        """
        Adjust volume of audio file (volume_change in dB)
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Adjust volume
            adjusted_audio = audio + volume_change
            
            # Export adjusted audio
            adjusted_audio.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adjusting audio volume: {str(e)}")
            return False
    
    async def normalize_audio(self, input_path: str, output_path: str) -> bool:
        """
        Normalize audio levels
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Normalize audio
            normalized_audio = normalize(audio)
            
            # Export normalized audio
            normalized_audio.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error normalizing audio: {str(e)}")
            return False
    
    async def fade_in_out(
        self, 
        input_path: str, 
        output_path: str, 
        fade_in_duration: float = 1.0,
        fade_out_duration: float = 1.0
    ) -> bool:
        """
        Add fade in/out effects to audio
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Convert duration to milliseconds
            fade_in_ms = int(fade_in_duration * 1000)
            fade_out_ms = int(fade_out_duration * 1000)
            
            # Apply fade effects
            audio_with_fade = audio.fade_in(fade_in_ms).fade_out(fade_out_ms)
            
            # Export audio with fades
            audio_with_fade.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding fade effects: {str(e)}")
            return False
    
    async def change_speed(self, input_path: str, output_path: str, speed_factor: float) -> bool:
        """
        Change playback speed of audio
        """
        if not self.audio_available:
            logger.error("Audio processing not available")
            return False
            
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_path)
            
            # Change speed by manipulating frame rate
            # speed_factor > 1.0 = faster, < 1.0 = slower
            new_sample_rate = int(audio.frame_rate * speed_factor)
            
            # Apply speed change
            speed_changed = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
            speed_changed = speed_changed.set_frame_rate(audio.frame_rate)
            
            # Export speed-changed audio
            speed_changed.export(output_path, format=self._get_format_from_path(output_path))
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error changing audio speed: {str(e)}")
            return False
    
    def _get_format_from_path(self, file_path: str) -> str:
        """
        Extract format from file path
        """
        return os.path.splitext(file_path)[1][1:].lower() 