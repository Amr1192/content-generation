from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class ContentImage(Base):
    """Images attached to a generated content item."""

    __tablename__ = "content_images"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    source = Column(String(50), nullable=False, default="generated")  # generated | upload
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ContentImage {self.id} content={self.content_id}>"
