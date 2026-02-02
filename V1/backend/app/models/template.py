from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class Template(Base):
    """Design template model"""
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))  # quote, tip, statistic, announcement, etc.
    
    # Template configuration
    style = Column(String(50))  # minimal, bold, corporate, lifestyle, neon
    layout_type = Column(String(50))  # single, split, overlay, grid
    
    # Design specifications (JSON)
    design_config = Column(JSON)  # Full template configuration
    # Example: {
    #   "dimensions": {"width": 1080, "height": 1080},
    #   "background": {"type": "gradient", "colors": ["#fff", "#f0f0f0"]},
    #   "text_areas": [{"position": "center", "max_chars": 100, ...}],
    #   "fonts": {"primary": "Inter", "secondary": "Roboto"}
    # }
    
    # Preview
    preview_url = Column(String(500))
    thumbnail_url = Column(String(500))
    
    # Metadata
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Template {self.name}>"
