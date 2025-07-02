"""
Image processing service
"""

import os
import asyncio
from typing import Optional
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np
from rembg import remove, new_session
import logging

logger = logging.getLogger(__name__)

class ImageService:
    """Service for image processing operations"""
    
    def __init__(self):
        # Initialize background removal session
        try:
            self.bg_removal_session = new_session('u2net')
        except Exception as e:
            logger.warning(f"Could not initialize background removal: {str(e)}")
            self.bg_removal_session = None
    
    async def convert_image(
        self, 
        input_path: str, 
        output_path: str, 
        target_format: str,
        quality: int = 95
    ) -> bool:
        """
        Convert image to different format
        """
        try:
            # Open image
            with Image.open(input_path) as img:
                # Convert to RGB if necessary (for JPEG)
                if target_format.lower() in ['jpg', 'jpeg'] and img.mode in ['RGBA', 'P']:
                    img = img.convert('RGB')
                
                # Save with specified quality
                save_kwargs = {}
                if target_format.lower() in ['jpg', 'jpeg']:
                    save_kwargs['quality'] = quality
                    save_kwargs['optimize'] = True
                elif target_format.lower() == 'png':
                    save_kwargs['optimize'] = True
                elif target_format.lower() == 'webp':
                    save_kwargs['quality'] = quality
                    save_kwargs['optimize'] = True
                
                img.save(output_path, format=target_format.upper(), **save_kwargs)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting image: {str(e)}")
            return False
    
    async def resize_image(
        self, 
        input_path: str, 
        output_path: str, 
        width: Optional[int] = None,
        height: Optional[int] = None,
        maintain_aspect_ratio: bool = True
    ) -> bool:
        """
        Resize image to specified dimensions
        """
        try:
            with Image.open(input_path) as img:
                original_width, original_height = img.size
                
                if maintain_aspect_ratio:
                    if width and not height:
                        # Calculate height based on width
                        ratio = width / original_width
                        height = int(original_height * ratio)
                    elif height and not width:
                        # Calculate width based on height
                        ratio = height / original_height
                        width = int(original_width * ratio)
                    elif width and height:
                        # Use the smaller ratio to fit within bounds
                        ratio = min(width / original_width, height / original_height)
                        width = int(original_width * ratio)
                        height = int(original_height * ratio)
                
                # Resize image
                resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
                resized_img.save(output_path)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error resizing image: {str(e)}")
            return False
    
    async def crop_image(
        self, 
        input_path: str, 
        output_path: str, 
        x: int, 
        y: int, 
        width: int, 
        height: int
    ) -> bool:
        """
        Crop image to specified rectangle
        """
        try:
            with Image.open(input_path) as img:
                # Define crop box (left, top, right, bottom)
                crop_box = (x, y, x + width, y + height)
                
                # Crop image
                cropped_img = img.crop(crop_box)
                cropped_img.save(output_path)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error cropping image: {str(e)}")
            return False
    
    async def remove_background(self, input_path: str, output_path: str) -> bool:
        """
        Remove background from image using AI
        """
        try:
            if self.bg_removal_session is None:
                # Fallback: simple background removal using OpenCV
                return await self._simple_background_removal(input_path, output_path)
            
            # Read input image
            with open(input_path, 'rb') as input_file:
                input_data = input_file.read()
            
            # Remove background
            output_data = remove(input_data, session=self.bg_removal_session)
            
            # Save output
            with open(output_path, 'wb') as output_file:
                output_file.write(output_data)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error removing background: {str(e)}")
            # Try simple fallback
            return await self._simple_background_removal(input_path, output_path)
    
    async def _simple_background_removal(self, input_path: str, output_path: str) -> bool:
        """
        Simple background removal fallback using OpenCV
        """
        try:
            # Read image
            img = cv2.imread(input_path)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply GrabCut algorithm for background removal
            mask = np.zeros(gray.shape[:2], np.uint8)
            bgdModel = np.zeros((1, 65), np.float64)
            fgdModel = np.zeros((1, 65), np.float64)
            
            # Define rectangle around the main object (simple heuristic)
            height, width = img.shape[:2]
            rect = (width//8, height//8, 6*width//8, 6*height//8)
            
            cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)
            
            # Create mask
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Apply mask to create result with transparency
            img_rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
            img_rgba[:, :, 3] = mask2 * 255
            
            # Save as PNG to preserve transparency
            cv2.imwrite(output_path, img_rgba)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error in simple background removal: {str(e)}")
            return False
    
    async def compress_image(
        self, 
        input_path: str, 
        output_path: str, 
        quality: int = 80,
        max_width: Optional[int] = None,
        max_height: Optional[int] = None
    ) -> bool:
        """
        Compress image to reduce file size
        """
        try:
            with Image.open(input_path) as img:
                # Resize if max dimensions specified
                if max_width or max_height:
                    original_width, original_height = img.size
                    
                    if max_width and original_width > max_width:
                        ratio = max_width / original_width
                        new_height = int(original_height * ratio)
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    
                    if max_height and img.size[1] > max_height:
                        ratio = max_height / img.size[1]
                        new_width = int(img.size[0] * ratio)
                        img = img.resize((new_width, max_height), Image.Resampling.LANCZOS)
                
                # Convert to RGB if saving as JPEG
                file_ext = os.path.splitext(output_path)[1].lower()
                if file_ext in ['.jpg', '.jpeg'] and img.mode in ['RGBA', 'P']:
                    img = img.convert('RGB')
                
                # Save with compression
                save_kwargs = {'optimize': True}
                if file_ext in ['.jpg', '.jpeg']:
                    save_kwargs['quality'] = quality
                elif file_ext == '.webp':
                    save_kwargs['quality'] = quality
                
                img.save(output_path, **save_kwargs)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error compressing image: {str(e)}")
            return False
    
    async def rotate_image(self, input_path: str, output_path: str, angle: float) -> bool:
        """
        Rotate image by specified angle
        """
        try:
            with Image.open(input_path) as img:
                # Rotate image
                rotated_img = img.rotate(angle, expand=True)
                rotated_img.save(output_path)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error rotating image: {str(e)}")
            return False
    
    async def enhance_image(
        self, 
        input_path: str, 
        output_path: str,
        brightness: float = 1.0,
        contrast: float = 1.0,
        saturation: float = 1.0,
        sharpness: float = 1.0
    ) -> bool:
        """
        Enhance image with various adjustments
        """
        try:
            with Image.open(input_path) as img:
                # Apply enhancements
                if brightness != 1.0:
                    enhancer = ImageEnhance.Brightness(img)
                    img = enhancer.enhance(brightness)
                
                if contrast != 1.0:
                    enhancer = ImageEnhance.Contrast(img)
                    img = enhancer.enhance(contrast)
                
                if saturation != 1.0:
                    enhancer = ImageEnhance.Color(img)
                    img = enhancer.enhance(saturation)
                
                if sharpness != 1.0:
                    enhancer = ImageEnhance.Sharpness(img)
                    img = enhancer.enhance(sharpness)
                
                img.save(output_path)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error enhancing image: {str(e)}")
            return False
    
    async def add_watermark(
        self, 
        input_path: str, 
        output_path: str, 
        watermark_text: str,
        position: str = "bottom-right",
        opacity: float = 0.7
    ) -> bool:
        """
        Add text watermark to image
        """
        try:
            from PIL import ImageDraw, ImageFont
            
            with Image.open(input_path) as img:
                # Create watermark
                watermark = Image.new('RGBA', img.size, (0, 0, 0, 0))
                draw = ImageDraw.Draw(watermark)
                
                # Try to use a nice font, fallback to default
                try:
                    font_size = max(20, img.size[0] // 30)
                    font = ImageFont.truetype("arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()
                
                # Get text size
                bbox = draw.textbbox((0, 0), watermark_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Calculate position
                margin = 20
                if position == "bottom-right":
                    x = img.size[0] - text_width - margin
                    y = img.size[1] - text_height - margin
                elif position == "bottom-left":
                    x = margin
                    y = img.size[1] - text_height - margin
                elif position == "top-right":
                    x = img.size[0] - text_width - margin
                    y = margin
                elif position == "top-left":
                    x = margin
                    y = margin
                else:  # center
                    x = (img.size[0] - text_width) // 2
                    y = (img.size[1] - text_height) // 2
                
                # Draw text with transparency
                alpha = int(255 * opacity)
                draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, alpha))
                
                # Composite watermark onto image
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                watermarked = Image.alpha_composite(img, watermark)
                
                # Convert back to RGB if needed
                if output_path.lower().endswith(('.jpg', '.jpeg')):
                    watermarked = watermarked.convert('RGB')
                
                watermarked.save(output_path)
            
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding watermark: {str(e)}")
            return False 