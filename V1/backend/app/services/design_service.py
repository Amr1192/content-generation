from typing import Dict, Optional, List
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import os
from datetime import datetime


class DesignService:
    """Design template generation and customization service"""
    
    def __init__(self):
        self.output_dir = "uploads/designs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate_post_design(
        self,
        content: str,
        template_style: str = "minimal",
        brand_colors: Optional[Dict] = None,
        dimensions: tuple = (1080, 1080)
    ) -> str:
        """
        Generate a designed social media post image
        
        Args:
            content: Text content to display
            template_style: Design style (minimal, bold, gradient, etc.)
            brand_colors: Brand color palette
            dimensions: Image dimensions (width, height)
        
        Returns:
            Path to generated image
        """
        
        # Default colors if none provided
        if brand_colors is None:
            brand_colors = {
                "primary": "#6366f1",  # Indigo
                "secondary": "#8b5cf6",  # Purple
                "background": "#ffffff",
                "text": "#1f2937"
            }
        
        # Create image
        img = Image.new('RGB', dimensions, color=brand_colors["background"])
        draw = ImageDraw.Draw(img)
        
        # Apply style-specific design
        if template_style == "gradient":
            img = self._apply_gradient_background(img, brand_colors)
            # Improve contrast on colorful backgrounds
            brand_colors["text"] = "#ffffff"
        elif template_style == "bold":
            img = self._apply_bold_style(img, brand_colors)
            # Bold style uses saturated background; use white text.
            brand_colors["text"] = "#ffffff"
        elif template_style == "minimal":
            img = self._apply_minimal_style(img, brand_colors)
        
        # Add text content
        img = self._add_text_to_image(img, content, brand_colors)
        
        # Save image
        filename = f"post_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.png"
        filepath = os.path.join(self.output_dir, filename)
        img.save(filepath, quality=95)
        
        return filepath
    
    def generate_carousel_design(
        self,
        slides: List[str],
        template_style: str = "minimal",
        brand_colors: Optional[Dict] = None
    ) -> List[str]:
        """
        Generate multiple slides for a carousel post
        
        Args:
            slides: List of text content for each slide
            template_style: Design style
            brand_colors: Brand colors
        
        Returns:
            List of paths to generated slide images
        """
        
        slide_paths = []
        
        for i, slide_content in enumerate(slides):
            filepath = self.generate_post_design(
                content=f"Slide {i+1}/{len(slides)}\n\n{slide_content}",
                template_style=template_style,
                brand_colors=brand_colors
            )
            slide_paths.append(filepath)
        
        return slide_paths
    
    def _apply_gradient_background(self, img: Image.Image, colors: Dict) -> Image.Image:
        """Apply gradient background"""
        width, height = img.size
        
        # Create gradient from primary to secondary color
        # Simple vertical gradient implementation
        primary = self._hex_to_rgb(colors["primary"])
        secondary = self._hex_to_rgb(colors["secondary"])
        
        for y in range(height):
            # Calculate color for this row
            ratio = y / height
            r = int(primary[0] * (1 - ratio) + secondary[0] * ratio)
            g = int(primary[1] * (1 - ratio) + secondary[1] * ratio)
            b = int(primary[2] * (1 - ratio) + secondary[2] * ratio)
            
            # Draw line
            draw = ImageDraw.Draw(img)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        return img
    
    def _apply_bold_style(self, img: Image.Image, colors: Dict) -> Image.Image:
        """Apply bold, vibrant style"""
        width, height = img.size
        draw = ImageDraw.Draw(img)
        
        # Stronger, clearly distinct look from minimal/gradient:
        # full saturated background + geometric overlays.
        primary_rgb = self._hex_to_rgb(colors["primary"])
        secondary_rgb = self._hex_to_rgb(colors["secondary"])

        draw.rectangle([(0, 0), (width, height)], fill=primary_rgb)
        draw.polygon([(0, 0), (width * 0.55, 0), (0, height * 0.55)], fill=secondary_rgb)
        draw.polygon([(width, height), (width * 0.45, height), (width, height * 0.45)], fill=secondary_rgb)
        
        return img
    
    def _apply_minimal_style(self, img: Image.Image, colors: Dict) -> Image.Image:
        """Apply minimal, clean style"""
        width, height = img.size
        draw = ImageDraw.Draw(img)
        
        # Add subtle border
        border_color = self._hex_to_rgb(colors["primary"])
        border_width = 3
        
        # Draw border
        draw.rectangle(
            [(border_width, border_width), (width - border_width, height - border_width)],
            outline=border_color,
            width=border_width
        )
        
        return img
    
    def _add_text_to_image(self, img: Image.Image, text: str, colors: Dict) -> Image.Image:
        """Add text content to image"""
        width, height = img.size
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fallback to default
        try:
            # Try common font paths
            font_paths = [
                "C:/Windows/Fonts/arial.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc"
            ]
            
            font = None
            for font_path in font_paths:
                if os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, 48)
                    break
            
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Word wrap text
        wrapped_text = self._wrap_text(text, font, width - 200, draw)
        
        # Calculate text position (centered)
        bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # Draw text
        text_color = self._hex_to_rgb(colors["text"])
        draw.multiline_text(
            (x, y),
            wrapped_text,
            fill=text_color,
            font=font,
            align="center"
        )
        
        return img
    
    def _wrap_text(self, text: str, font, max_width: int, draw) -> str:
        """Wrap text to fit within max width"""
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            width = bbox[2] - bbox[0]
            
            if width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines)
    
    def _hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def get_template_styles(self) -> List[Dict]:
        """Get available template styles"""
        return [
            {
                "name": "minimal",
                "description": "Clean, minimal design with subtle borders",
                "best_for": "Professional content, quotes, tips"
            },
            {
                "name": "gradient",
                "description": "Vibrant gradient backgrounds",
                "best_for": "Inspirational content, announcements"
            },
            {
                "name": "bold",
                "description": "Bold colors with accent bars",
                "best_for": "Attention-grabbing content, promotions"
            }
        ]


# Singleton instance
design_service = DesignService()
