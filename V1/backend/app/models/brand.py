from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Brand(Base):
    """Brand/Profile model"""
    __tablename__ = "brands"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    industry = Column(String(100))
    
    # Brand voice and style
    tone = Column(String(50), default="professional")  # professional, casual, funny, inspirational
    color_palette = Column(JSON)  # {"primary": "#000", "secondary": "#fff", ...}
    visual_style = Column(String(50), default="minimal")  # minimal, bold, corporate, lifestyle
    
    # Social media handles
    instagram_handle = Column(String(100))
    facebook_handle = Column(String(100))
    twitter_handle = Column(String(100))
    linkedin_handle = Column(String(100))
    tiktok_handle = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Brand {self.name}>"
