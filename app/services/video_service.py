"""
Video processing service
"""

import os
import asyncio
from typing import Optional
from moviepy.editor import VideoFileClip, concatenate_videoclips
import logging

logger = logging.getLogger(__name__)

class VideoService:
    """Service for video processing operations"""
    
    async def convert_video(
        self, 
        input_path: str, 
        output_path: str, 
        target_format: str,
        quality: str = "medium",
        resolution: Optional[str] = None
    ) -> bool:
        """
        Convert video file to different format
        """
        try:
            # Load video
            video = VideoFileClip(input_path)
            
            # Resize if resolution specified
            if resolution:
                width, height = map(int, resolution.split('x'))
                video = video.resize((width, height))
            
            # Set quality parameters
            quality_settings = {
                "low": {"bitrate": "500k"},
                "medium": {"bitrate": "1000k"},
                "high": {"bitrate": "2000k"}
            }
            
            # Export video
            video.write_videofile(
                output_path,
                codec='libx264',
                **quality_settings.get(quality, quality_settings["medium"])
            )
            
            # Clean up
            video.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting video: {str(e)}")
            return False
    
    async def compress_video(
        self, 
        input_path: str, 
        output_path: str, 
        target_size_mb: Optional[int] = None,
        quality: int = 75
    ) -> bool:
        """
        Compress video file
        """
        try:
            # Load video
            video = VideoFileClip(input_path)
            
            # Calculate bitrate if target size specified
            if target_size_mb:
                duration = video.duration
                target_bitrate = (target_size_mb * 8 * 1024) / duration  # kbps
                bitrate = f"{int(target_bitrate)}k"
            else:
                # Use quality-based bitrate
                bitrate_map = {
                    100: "2000k", 90: "1500k", 80: "1000k", 
                    70: "750k", 60: "500k", 50: "350k", 
                    40: "250k", 30: "150k", 20: "100k", 10: "50k"
                }
                
                bitrate = "1000k"  # default
                for q in sorted(bitrate_map.keys(), reverse=True):
                    if quality >= q:
                        bitrate = bitrate_map[q]
                        break
            
            # Export compressed video
            video.write_videofile(
                output_path,
                codec='libx264',
                bitrate=bitrate,
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error compressing video: {str(e)}")
            return False
    
    async def trim_video(
        self, 
        input_path: str, 
        output_path: str, 
        start_time: float, 
        end_time: Optional[float] = None
    ) -> bool:
        """
        Trim video to specified time range
        """
        try:
            # Load video
            video = VideoFileClip(input_path)
            
            # Set end time if not specified
            if end_time is None:
                end_time = video.duration
            
            # Trim video
            trimmed_video = video.subclip(start_time, end_time)
            
            # Export trimmed video
            trimmed_video.write_videofile(
                output_path,
                codec='libx264',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            trimmed_video.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error trimming video: {str(e)}")
            return False
    
    async def merge_videos(self, input_paths: list, output_path: str) -> bool:
        """
        Merge multiple video files
        """
        try:
            if not input_paths:
                return False
            
            # Load video clips
            clips = [VideoFileClip(path) for path in input_paths]
            
            # Concatenate videos
            final_video = concatenate_videoclips(clips)
            
            # Export merged video
            final_video.write_videofile(
                output_path,
                codec='libx264',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            for clip in clips:
                clip.close()
            final_video.close()
            
            for path in input_paths:
                if os.path.exists(path):
                    os.remove(path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error merging videos: {str(e)}")
            return False
    
    async def video_to_gif(
        self, 
        input_path: str, 
        output_path: str, 
        start_time: float = 0.0,
        duration: Optional[float] = None,
        fps: int = 10,
        width: Optional[int] = None
    ) -> bool:
        """
        Convert video to GIF
        """
        try:
            # Load video
            video = VideoFileClip(input_path)
            
            # Set duration if not specified
            if duration is None:
                duration = min(10.0, video.duration - start_time)  # Max 10 seconds
            
            # Extract clip
            clip = video.subclip(start_time, start_time + duration)
            
            # Resize if width specified
            if width:
                clip = clip.resize(width=width)
            
            # Convert to GIF
            clip.write_gif(output_path, fps=fps, opt='OptimizePlus', program='ffmpeg')
            
            # Clean up
            video.close()
            clip.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting video to GIF: {str(e)}")
            return False
    
    async def extract_audio(self, input_path: str, output_path: str) -> bool:
        """
        Extract audio from video
        """
        try:
            # Load video
            video = VideoFileClip(input_path)
            
            # Extract audio
            audio = video.audio
            
            # Export audio
            audio.write_audiofile(output_path)
            
            # Clean up
            audio.close()
            video.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error extracting audio from video: {str(e)}")
            return False
    
    async def add_watermark(
        self, 
        input_path: str, 
        output_path: str, 
        watermark_text: str,
        position: str = "bottom-right"
    ) -> bool:
        """
        Add text watermark to video
        """
        try:
            from moviepy.editor import TextClip, CompositeVideoClip
            
            # Load video
            video = VideoFileClip(input_path)
            
            # Create text watermark
            watermark = TextClip(
                watermark_text,
                fontsize=30,
                color='white',
                font='Arial'
            ).set_duration(video.duration).set_opacity(0.7)
            
            # Position watermark
            if position == "bottom-right":
                watermark = watermark.set_position(('right', 'bottom'))
            elif position == "bottom-left":
                watermark = watermark.set_position(('left', 'bottom'))
            elif position == "top-right":
                watermark = watermark.set_position(('right', 'top'))
            elif position == "top-left":
                watermark = watermark.set_position(('left', 'top'))
            else:  # center
                watermark = watermark.set_position('center')
            
            # Composite video with watermark
            final_video = CompositeVideoClip([video, watermark])
            
            # Export video with watermark
            final_video.write_videofile(
                output_path,
                codec='libx264',
                temp_audiofile='temp-audio.m4a',
                remove_temp=True
            )
            
            # Clean up
            video.close()
            watermark.close()
            final_video.close()
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding watermark to video: {str(e)}")
            return False 