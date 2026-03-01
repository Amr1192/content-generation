from typing import List, Dict, Optional
from openai import OpenAI
from app.core.config import settings
import json


class HashtagService:
    """Intelligent hashtag generation and recommendation service"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_TEXT_MODEL
    
    def generate_hashtags(
        self,
        content: str,
        platform: str = "instagram",
        niche: Optional[str] = None,
        count: int = 30,
        competition_level: str = "mixed"  # low, medium, high, mixed
    ) -> Dict:
        """
        Generate intelligent hashtag recommendations
        
        Args:
            content: The post content
            platform: Target platform
            niche: Brand niche/industry
            count: Number of hashtags to generate
            competition_level: Preferred competition level
        
        Returns:
            Dictionary with categorized hashtags
        """
        
        niche_context = f"\nBrand niche: {niche}" if niche else ""
        
        prompt = f"""Generate {count} highly relevant and strategic hashtags for this {platform} post:

Content: "{content}"{niche_context}

Requirements:
1. Mix of competition levels:
   - High competition (100K+ posts): Popular, high traffic
   - Medium competition (10K-100K posts): Good balance
   - Low competition (<10K posts): Niche, targeted
   
2. Categories:
   - Core topic hashtags (directly related to content)
   - Niche-specific hashtags
   - Trending/popular hashtags
   - Community hashtags
   - Call-to-action hashtags

3. Platform: {platform} (optimize for this platform's hashtag strategy)

4. Avoid:
   - Banned or spam hashtags
   - Overly generic hashtags (#love, #instagood unless truly relevant)
   - Irrelevant hashtags

Return as JSON:
{{
    "hashtags": [
        {{
            "tag": "hashtagname",
            "category": "core|niche|trending|community|cta",
            "competition": "high|medium|low",
            "estimated_posts": "100K+|10K-100K|<10K",
            "relevance_score": 0.95
        }}
    ],
    "recommended_set": ["top 15-20 hashtags for this post"],
    "strategy_notes": "Brief explanation of the hashtag strategy"
}}

Prioritize relevance and strategic value over popularity."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media growth expert specializing in hashtag strategy and organic reach optimization."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return result
            
        except Exception as e:
            print(f"Error generating hashtags: {e}")
            raise
    
    def analyze_hashtag_performance(
        self,
        hashtags: List[str],
        platform: str = "instagram"
    ) -> Dict:
        """
        Analyze hashtag performance potential
        
        Args:
            hashtags: List of hashtags to analyze
            platform: Target platform
        
        Returns:
            Analysis results
        """
        
        hashtag_list = ", ".join([f"#{tag}" for tag in hashtags])
        
        prompt = f"""Analyze these hashtags for {platform} performance potential:

Hashtags: {hashtag_list}

Provide analysis on:
1. Overall strategy quality (1-10 score)
2. Competition balance
3. Relevance and coherence
4. Potential reach estimate
5. Recommendations for improvement

Return as JSON:
{{
    "overall_score": 8.5,
    "competition_balance": "Good mix of high, medium, and low competition",
    "relevance_score": 9.0,
    "estimated_reach": "10K-50K impressions",
    "strengths": ["List of strengths"],
    "weaknesses": ["List of weaknesses"],
    "recommendations": ["Specific improvements"],
    "alternative_suggestions": ["Better hashtag alternatives if any"]
}}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a social media analytics expert who evaluates hashtag strategies."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(response.choices[0].message.content)
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing hashtags: {e}")
            raise
    
    def get_trending_hashtags(
        self,
        niche: str,
        platform: str = "instagram",
        count: int = 20
    ) -> List[Dict]:
        """
        Get trending hashtags for a specific niche
        
        Note: This is AI-generated based on general knowledge.
        For real-time trending data, integrate with platform APIs or third-party services.
        
        Args:
            niche: Industry/niche
            platform: Target platform
            count: Number of trending hashtags
        
        Returns:
            List of trending hashtags
        """
        
        prompt = f"""List {count} currently trending and effective hashtags for the {niche} niche on {platform}.

Focus on:
1. Hashtags that are actively trending
2. Niche-specific hashtags with good engagement
3. Seasonal/timely hashtags if relevant
4. Community hashtags in this niche

Return as JSON:
{{
    "trending_hashtags": [
        {{
            "tag": "hashtagname",
            "trend_status": "rising|stable|declining",
            "niche_relevance": 0.95,
            "why_trending": "Brief explanation"
        }}
    ]
}}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a social media trends analyst with deep knowledge of {platform} hashtag trends."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.6,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return result.get("trending_hashtags", [])
            
        except Exception as e:
            print(f"Error getting trending hashtags: {e}")
            raise


# Singleton instance
hashtag_service = HashtagService()
