from typing import List, Dict, Optional
from openai import OpenAI
from app.core.config import settings
import json


class AIContentGenerator:
    """AI-powered content generation service using OpenAI GPT-4"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4-turbo-preview"  # or gpt-4, gpt-3.5-turbo for cost savings
    
    def generate_posts(
        self,
        idea: str,
        platform: str = "instagram",
        count: int = 30,
        tone: str = "professional",
        brand_context: Optional[str] = None
    ) -> List[Dict]:
        """
        Generate multiple social media posts from a single idea
        
        Args:
            idea: The core idea/topic for content
            platform: Target social media platform
            count: Number of posts to generate
            tone: Content tone (professional, casual, funny, inspirational)
            brand_context: Additional brand context
        
        Returns:
            List of generated posts with metadata
        """
        
        # Platform-specific parameters
        platform_params = self._get_platform_parameters(platform)
        
        # Construct the prompt
        prompt = self._construct_generation_prompt(
            idea=idea,
            platform=platform,
            count=count,
            tone=tone,
            brand_context=brand_context,
            platform_params=platform_params
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert social media content creator who creates engaging, platform-optimized posts that drive engagement."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,  # Higher for more creativity
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            content = json.loads(response.choices[0].message.content)
            posts = content.get("posts", [])
            
            return posts[:count]  # Ensure we return exactly the requested count
            
        except Exception as e:
            print(f"Error generating content: {e}")
            raise
    
    def generate_reel_scripts(
        self,
        idea: str,
        count: int = 10,
        duration: str = "30s",
        tone: str = "engaging"
    ) -> List[Dict]:
        """
        Generate short-form video/reel scripts
        
        Args:
            idea: Core concept for the reel
            count: Number of scripts to generate
            duration: Target duration (7s, 15s, 30s, 60s)
            tone: Script tone
        
        Returns:
            List of reel scripts with scene breakdowns
        """
        
        prompt = f"""Create {count} engaging short-form video scripts for {duration} reels based on this idea: "{idea}"

Tone: {tone}

For each script, provide:
1. Hook (first 3 seconds - must grab attention)
2. Scene-by-scene breakdown
3. Text overlay suggestions
4. Call-to-action
5. Trending audio suggestion (generic style, e.g., "upbeat trending audio")

Return as JSON in this format:
{{
    "scripts": [
        {{
            "title": "Script title",
            "hook": "Attention-grabbing first line",
            "scenes": [
                {{"scene": 1, "duration": "3s", "action": "What happens", "text_overlay": "Text shown"}},
                ...
            ],
            "cta": "Call to action",
            "audio_style": "Type of audio needed",
            "estimated_duration": "{duration}"
        }}
    ]
}}

Make each script unique and highly engaging. Focus on hooks that stop scrolling."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a viral short-form video content creator who understands what makes people stop scrolling and engage."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.9,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            content = json.loads(response.choices[0].message.content)
            scripts = content.get("scripts", [])
            
            return scripts[:count]
            
        except Exception as e:
            print(f"Error generating reel scripts: {e}")
            raise
    
    def generate_caption(
        self,
        post_content: str,
        platform: str = "instagram",
        include_emojis: bool = True,
        max_length: Optional[int] = None
    ) -> str:
        """
        Generate an engaging caption for a post
        
        Args:
            post_content: The main post content
            platform: Target platform
            include_emojis: Whether to include emojis
            max_length: Maximum caption length
        
        Returns:
            Generated caption
        """
        
        platform_params = self._get_platform_parameters(platform)
        if max_length is None:
            max_length = platform_params.get("max_caption_length", 2200)
        
        emoji_instruction = "Include relevant emojis" if include_emojis else "No emojis"
        
        prompt = f"""Create an engaging caption for this {platform} post:

Post content: "{post_content}"

Requirements:
- Platform: {platform}
- Max length: {max_length} characters
- {emoji_instruction}
- Include a strong hook in the first line
- Add line breaks for readability
- End with a call-to-action

Return ONLY the caption text, no JSON."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media copywriter who writes engaging captions that drive engagement."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            caption = response.choices[0].message.content.strip()
            
            # Ensure it doesn't exceed max length
            if len(caption) > max_length:
                caption = caption[:max_length-3] + "..."
            
            return caption
            
        except Exception as e:
            print(f"Error generating caption: {e}")
            raise
    
    def _get_platform_parameters(self, platform: str) -> Dict:
        """Get platform-specific parameters"""
        
        params = {
            "instagram": {
                "max_caption_length": 2200,
                "optimal_hashtags": 20,
                "max_hashtags": 30,
                "character_limit": None,
                "best_practices": [
                    "Use line breaks for readability",
                    "Front-load important information",
                    "Include call-to-action",
                    "Use emojis strategically"
                ]
            },
            "twitter": {
                "max_caption_length": 280,
                "optimal_hashtags": 2,
                "max_hashtags": 3,
                "character_limit": 280,
                "best_practices": [
                    "Be concise",
                    "Use threads for longer content",
                    "Include relevant hashtags",
                    "Tag relevant accounts"
                ]
            },
            "linkedin": {
                "max_caption_length": 3000,
                "optimal_hashtags": 5,
                "max_hashtags": 10,
                "character_limit": None,
                "best_practices": [
                    "Professional tone",
                    "Provide value",
                    "Use data and insights",
                    "Encourage discussion"
                ]
            },
            "facebook": {
                "max_caption_length": 63206,
                "optimal_hashtags": 3,
                "max_hashtags": 5,
                "character_limit": None,
                "best_practices": [
                    "Conversational tone",
                    "Ask questions",
                    "Use storytelling",
                    "Include links"
                ]
            },
            "tiktok": {
                "max_caption_length": 2200,
                "optimal_hashtags": 5,
                "max_hashtags": 10,
                "character_limit": None,
                "best_practices": [
                    "Trend-focused",
                    "Use trending sounds",
                    "Quick hooks",
                    "Authentic content"
                ]
            }
        }
        
        return params.get(platform.lower(), params["instagram"])
    
    def _construct_generation_prompt(
        self,
        idea: str,
        platform: str,
        count: int,
        tone: str,
        brand_context: Optional[str],
        platform_params: Dict
    ) -> str:
        """Construct the prompt for content generation"""
        
        brand_section = f"\n\nBrand Context: {brand_context}" if brand_context else ""
        
        prompt = f"""Generate {count} unique, engaging social media posts for {platform} based on this idea:

Idea: "{idea}"

Tone: {tone}
Platform: {platform}
Platform best practices: {', '.join(platform_params['best_practices'])}{brand_section}

Requirements:
1. Each post should be unique and approach the idea from different angles
2. Vary the content types: tips, questions, stories, quotes, educational, promotional
3. Optimize for {platform} (character limits, style, audience)
4. Make them engaging and scroll-stopping
5. Include natural hooks in the first line
6. Use emojis appropriately for the platform
7. Ensure diversity in approach (don't repeat similar structures)

Content type distribution:
- Educational/Tips: 40%
- Inspirational/Motivational: 25%
- Engaging Questions: 15%
- Storytelling: 10%
- Promotional: 10%

Return as JSON in this exact format:
{{
    "posts": [
        {{
            "content": "The full post text with emojis and formatting",
            "content_type": "educational|inspirational|question|story|promotional",
            "hook": "The first attention-grabbing line",
            "character_count": 123,
            "estimated_engagement": "high|medium|low"
        }}
    ]
}}

Make each post genuinely valuable and engaging. Avoid generic content."""
        
        return prompt


# Singleton instance
ai_content_generator = AIContentGenerator()
