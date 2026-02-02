from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.content import Content, ContentType, Platform
from app.models.user import User
from app.services.ai_content_service import ai_content_generator
from app.services.hashtag_service import hashtag_service
from app.services.design_service import design_service

router = APIRouter(prefix="/content", tags=["Content Generation"])


# Pydantic schemas
class ContentGenerationRequest(BaseModel):
    idea: str
    platform: str = "instagram"
    count: int = 30
    tone: str = "professional"
    brand_id: Optional[int] = None
    generate_designs: bool = False
    design_style: str = "minimal"


class ReelScriptRequest(BaseModel):
    idea: str
    count: int = 10
    duration: str = "30s"
    tone: str = "engaging"


class HashtagRequest(BaseModel):
    content: str
    platform: str = "instagram"
    niche: Optional[str] = None
    count: int = 30


class ContentResponse(BaseModel):
    id: int
    content_type: str
    platform: str
    generated_text: str
    caption: Optional[str]
    hashtags: Optional[List[str]]
    design_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_content(
    request: ContentGenerationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """
    Generate social media content from an idea
    
    This is the core feature: 1 idea → 30+ posts
    """
    
    try:
        # Generate posts using AI
        posts = ai_content_generator.generate_posts(
            idea=request.idea,
            platform=request.platform,
            count=request.count,
            tone=request.tone
        )
        
        generated_content = []
        
        for post_data in posts:
            # Generate hashtags for each post
            hashtag_result = hashtag_service.generate_hashtags(
                content=post_data["content"],
                platform=request.platform,
                count=20
            )
            
            recommended_hashtags = hashtag_result.get("recommended_set", [])
            
            # Generate caption
            caption = ai_content_generator.generate_caption(
                post_content=post_data["content"],
                platform=request.platform
            )
            
            # Create content record
            content = Content(
                user_id=user_id,
                brand_id=request.brand_id,
                content_type=ContentType.POST,
                platform=Platform(request.platform.lower()),
                original_idea=request.idea,
                generated_text=post_data["content"],
                caption=caption,
                hashtags=recommended_hashtags,
                content_category=post_data.get("content_type", "general"),
                tone=request.tone,
                status="draft"
            )
            
            db.add(content)
            db.commit()
            db.refresh(content)
            
            # Generate design if requested
            if request.generate_designs:
                # Run design generation in background
                background_tasks.add_task(
                    generate_design_for_content,
                    content.id,
                    post_data["content"],
                    request.design_style
                )
            
            generated_content.append({
                "id": content.id,
                "content": content.generated_text,
                "caption": content.caption,
                "hashtags": content.hashtags,
                "content_type": post_data.get("content_type"),
                "hook": post_data.get("hook"),
                "estimated_engagement": post_data.get("estimated_engagement")
            })
        
        return {
            "success": True,
            "message": f"Generated {len(generated_content)} posts successfully",
            "count": len(generated_content),
            "posts": generated_content,
            "original_idea": request.idea,
            "platform": request.platform
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating content: {str(e)}"
        )


@router.post("/reels/scripts")
async def generate_reel_scripts(
    request: ReelScriptRequest,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Generate reel/short-form video scripts"""
    
    try:
        scripts = ai_content_generator.generate_reel_scripts(
            idea=request.idea,
            count=request.count,
            duration=request.duration,
            tone=request.tone
        )
        
        saved_scripts = []
        
        for script_data in scripts:
            content = Content(
                user_id=user_id,
                content_type=ContentType.REEL_SCRIPT,
                platform=Platform.INSTAGRAM,  # Default to Instagram
                original_idea=request.idea,
                generated_text=str(script_data),  # Store full script as JSON string
                tone=request.tone,
                status="draft"
            )
            
            db.add(content)
            db.commit()
            db.refresh(content)
            
            saved_scripts.append({
                "id": content.id,
                **script_data
            })
        
        return {
            "success": True,
            "message": f"Generated {len(saved_scripts)} reel scripts",
            "count": len(saved_scripts),
            "scripts": saved_scripts
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating reel scripts: {str(e)}"
        )


@router.post("/hashtags")
async def generate_hashtags(request: HashtagRequest):
    """Generate hashtags for content"""
    
    try:
        result = hashtag_service.generate_hashtags(
            content=request.content,
            platform=request.platform,
            niche=request.niche,
            count=request.count
        )
        
        return {
            "success": True,
            **result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating hashtags: {str(e)}"
        )


@router.get("/", response_model=List[ContentResponse])
async def get_user_content(
    skip: int = 0,
    limit: int = 50,
    platform: Optional[str] = None,
    content_type: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Get user's generated content"""
    
    query = db.query(Content).filter(Content.user_id == user_id)
    
    if platform:
        query = query.filter(Content.platform == platform)
    
    if content_type:
        query = query.filter(Content.content_type == content_type)
    
    content = query.order_by(Content.created_at.desc()).offset(skip).limit(limit).all()
    
    return content


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Get specific content by ID"""
    
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    return content


@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Delete content"""
    
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    db.delete(content)
    db.commit()
    
    return {"success": True, "message": "Content deleted successfully"}


# Background task function
def generate_design_for_content(content_id: int, text: str, style: str):
    """Background task to generate design for content"""
    try:
        design_path = design_service.generate_post_design(
            content=text,
            template_style=style
        )
        
        # Update content with design URL
        # Note: In production, upload to S3 and store URL
        # For now, store local path
        from app.core.database import SessionLocal
        db = SessionLocal()
        
        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            content.design_url = design_path
            db.commit()
        
        db.close()
        
    except Exception as e:
        print(f"Error generating design: {e}")
