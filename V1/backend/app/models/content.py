from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ContentType(str, enum.Enum):
    """Content type enumeration"""
    POST = "post"
    REEL_SCRIPT = "reel_script"
    CAROUSEL = "carousel"
    STORY = "story"


class Platform(str, enum.Enum):
    """Social media platform enumeration"""
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"


class Content(Base):
    """Generated content model"""
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    
    # Content details
    content_type = Column(Enum(ContentType), nullable=False)
    platform = Column(Enum(Platform), nullable=False)
    
    original_idea = Column(Text, nullable=False)  # User's input
    generated_text = Column(Text, nullable=False)  # AI-generated content
    caption = Column(Text)
    hashtags = Column(JSON)  # ["hashtag1", "hashtag2", ...]
    
    # Metadata
    content_category = Column(String(50))  # educational, promotional, inspirational, etc.
    tone = Column(String(50))
    
    # Design (if applicable)
    design_template_id = Column(Integer)
    design_url = Column(String(500))  # URL to generated design
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, published
    
    # Analytics (to be populated after publishing)
    engagement_rate = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    scheduled_at = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<Content {self.id} - {self.content_type}>"
