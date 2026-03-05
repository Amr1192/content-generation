from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import re
from pathlib import Path
import mimetypes
import secrets

from app.core.database import get_db
from app.models.content import Content, ContentType, Platform
from app.models.content_image import ContentImage
from app.models.user import User
from app.services.ai_content_service import ai_content_generator
from app.services.hashtag_service import hashtag_service
from app.services.design_service import design_service
from app.services.ai_image_service import ai_image_service

router = APIRouter(prefix="/content", tags=["Content Generation"])


# Pydantic schemas
class ContentGenerationRequest(BaseModel):
    idea: str
    image_instructions: Optional[str] = None
    platform: str = "instagram"
    count: int = 10
    tone: str = "professional"
    brand_id: Optional[int] = None
    generate_designs: bool = False  # legacy key kept for compatibility
    generate_images: bool = False
    image_mode: Literal["ai", "template"] = "ai"
    image_count: int = Field(default=1, ge=1, le=6)
    image_style: str = "photorealistic"
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
    image_urls: List[str] = Field(default_factory=list)
    images: List[dict] = Field(default_factory=list)
    created_at: datetime
    
    class Config:
        from_attributes = True


class ContentUpdateRequest(BaseModel):
    generated_text: Optional[str] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None
    status: Optional[str] = None


class GenerateImagesRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=6)
    image_mode: Literal["ai", "template"] = "ai"
    image_style: str = "photorealistic"
    design_style: str = "minimal"
    image_instructions: Optional[str] = None


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
            # Keep this endpoint responsive: avoid per-post extra AI calls.
            recommended_hashtags = _generate_basic_hashtags(
                content=post_data["content"],
                idea=request.idea,
                count=12
            )
            
            # Create content record
            content = Content(
                user_id=user_id,
                brand_id=request.brand_id,
                content_type=ContentType.POST,
                platform=Platform(request.platform.lower()),
                original_idea=request.idea,
                generated_text=post_data["content"],
                caption=None,
                hashtags=recommended_hashtags,
                content_category=post_data.get("content_type", "general"),
                tone=request.tone,
                status="draft"
            )
            
            db.add(content)
            db.flush()
            
            should_generate_images = request.generate_images or request.generate_designs
            if should_generate_images:
                image_urls: List[str] = []
                for _ in range(request.image_count):
                    if request.image_mode == "ai":
                        image_prompt = _build_ai_image_prompt(
                            idea=request.idea,
                            image_instructions=request.image_instructions,
                            post_content=post_data["content"],
                            platform=request.platform,
                            tone=request.tone,
                            style=request.image_style
                        )
                        image_url = ai_image_service.generate_image(prompt=image_prompt)
                    else:
                        image_url = design_service.generate_post_design(
                            content=post_data["content"],
                            template_style=request.design_style
                        )

                    image_urls.append(image_url)
                    db.add(ContentImage(content_id=content.id, image_url=image_url, source="generated"))

                if image_urls:
                    content.design_url = image_urls[0]
            
            db.flush()
            content_images = _list_content_images(db, content.id)
            generated_content.append({
                "id": content.id,
                "content": content.generated_text,
                "caption": content.caption,
                "hashtags": content.hashtags,
                "design_url": content.design_url,
                "image_urls": [img.image_url for img in content_images],
                "images": [_serialize_content_image(img) for img in content_images],
                "content_type": post_data.get("content_type"),
                "hook": post_data.get("hook"),
                "estimated_engagement": post_data.get("estimated_engagement")
            })
        
        db.commit()
        
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


def _generate_basic_hashtags(content: str, idea: str, count: int = 12) -> List[str]:
    """Generate simple hashtags from idea/content keywords."""
    raw = f"{idea} {content}".lower()
    words = re.findall(r"[a-z0-9]+", raw)
    stop_words = {
        "the", "and", "for", "with", "that", "this", "from", "your", "you",
        "are", "was", "were", "have", "has", "had", "about", "into", "what",
        "when", "where", "which", "while", "will", "would", "could", "should",
        "them", "they", "their", "there", "here", "just", "more", "less",
        "very", "also", "than", "then", "into", "onto", "over", "under",
    }

    seen = set()
    tags: List[str] = []
    for w in words:
        if len(w) < 4 or w in stop_words:
            continue
        if w in seen:
            continue
        seen.add(w)
        tags.append(w)
        if len(tags) >= count:
            break

    return tags


def _build_ai_image_prompt(
    idea: str,
    image_instructions: Optional[str],
    post_content: str,
    platform: str,
    tone: str,
    style: str
) -> str:
    """Build context-rich prompt with strict priority for explicit image instructions."""
    clean_content = " ".join(post_content.split())
    direct_image_instructions = " ".join((image_instructions or "").split())
    explicit_image_instructions = _extract_explicit_image_instructions(idea)
    resolved_instructions = direct_image_instructions or explicit_image_instructions
    instruction_section = (
        f"Explicit image instructions (highest priority): {resolved_instructions}. "
        if resolved_instructions
        else "No explicit image instructions were provided. "
    )

    return (
        "You are generating a social media image. "
        "Follow instruction priority in this exact order: "
        "1) explicit image instructions from the user's idea, "
        "2) core idea, "
        "3) post context, "
        "4) style/tone hints. "
        "If a lower-priority hint conflicts with higher-priority instructions, ignore the lower-priority hint. "
        f"{instruction_section}"
        f"Core idea: {idea}. "
        f"Post message/context (supporting only): {clean_content}. "
        f"Desired mood/tone: {tone}. "
        f"Preferred visual style (only if no conflict): {style}. "
        "Do not render text, captions, logos, UI elements, or watermarks. "
        "Output a single clear scene with strong composition and visual storytelling."
    )


def _extract_explicit_image_instructions(idea: str) -> str:
    """
    Pull likely image directives from idea text.

    Examples that are prioritized:
    - Image: close-up of a doctor holding a stethoscope in a bright clinic
    - Visual: blue and white palette, minimal background
    - Scene: office desk with laptop and coffee
    """
    lines = [line.strip() for line in (idea or "").splitlines() if line.strip()]
    if not lines:
        return ""

    prefixes = (
        "image:",
        "image idea:",
        "image prompt:",
        "visual:",
        "visuals:",
        "scene:",
        "shot:",
        "composition:",
        "colors:",
        "style:",
        "background:",
        "subject:",
        "must show:",
        "include:",
        "avoid:",
    )

    extracted: List[str] = []
    for line in lines:
        lower = line.lower()
        if lower.startswith(prefixes):
            extracted.append(line)

    # Allow simple inline markers in one-line ideas.
    idea_lower = " ".join((idea or "").lower().split())
    inline_markers = ("image should", "visual should", "must show", "show ", "include ")
    if not extracted and any(marker in idea_lower for marker in inline_markers):
        extracted.append(" ".join((idea or "").split()))

    return " | ".join(extracted[:6])


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
    return [_serialize_content_response(db, item) for item in content]


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
    
    return _serialize_content_response(db, content)


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    payload: ContentUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Update editable fields of generated content."""

    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    if payload.generated_text is not None:
        content.generated_text = payload.generated_text
    if payload.caption is not None:
        content.caption = payload.caption
    if payload.hashtags is not None:
        content.hashtags = payload.hashtags
    if payload.status is not None:
        content.status = payload.status

    db.commit()
    db.refresh(content)
    return _serialize_content_response(db, content)


@router.post("/{content_id}/images/generate")
async def generate_images_for_content(
    content_id: int,
    payload: GenerateImagesRequest,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    for _ in range(payload.count):
        if payload.image_mode == "ai":
            image_prompt = _build_ai_image_prompt(
                idea=content.original_idea,
                image_instructions=payload.image_instructions,
                post_content=content.generated_text,
                platform=content.platform.value if hasattr(content.platform, "value") else str(content.platform),
                tone=content.tone or "professional",
                style=payload.image_style,
            )
            image_url = ai_image_service.generate_image(prompt=image_prompt)
        else:
            image_url = design_service.generate_post_design(
                content=content.generated_text,
                template_style=payload.design_style,
            )
        db.add(ContentImage(content_id=content.id, image_url=image_url, source="generated"))

    db.flush()
    _sync_primary_design_url(db, content)
    db.commit()
    db.refresh(content)
    return {"success": True, "content": _serialize_content_response(db, content)}


@router.post("/{content_id}/images/upload")
async def upload_images_for_content(
    content_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    upload_dir = Path("uploads/designs")
    upload_dir.mkdir(parents=True, exist_ok=True)
    saved = 0

    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            continue
        ext = Path(file.filename or "").suffix.lower()
        if not ext:
            guessed = mimetypes.guess_extension(file.content_type)
            ext = guessed or ".png"

        filename = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}_{secrets.token_hex(4)}{ext}"
        path = upload_dir / filename
        path.write_bytes(await file.read())
        image_url = str(path).replace("\\", "/")
        db.add(ContentImage(content_id=content.id, image_url=image_url, source="upload"))
        saved += 1

    if saved == 0:
        raise HTTPException(status_code=400, detail="No valid image files were uploaded.")

    db.flush()
    _sync_primary_design_url(db, content)
    db.commit()
    db.refresh(content)
    return {"success": True, "content": _serialize_content_response(db, content)}


@router.delete("/{content_id}/images/{image_id}")
async def delete_content_image(
    content_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1,  # TODO: Get from auth token
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == user_id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    image = db.query(ContentImage).filter(
        ContentImage.id == image_id,
        ContentImage.content_id == content_id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    local_path = Path(image.image_url)
    if local_path.is_file():
        try:
            local_path.unlink()
        except Exception:
            pass

    db.delete(image)
    db.flush()
    _sync_primary_design_url(db, content)
    db.commit()
    db.refresh(content)
    return {"success": True, "content": _serialize_content_response(db, content)}


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


def _list_content_images(db: Session, content_id: int) -> List[ContentImage]:
    return db.query(ContentImage).filter(
        ContentImage.content_id == content_id
    ).order_by(ContentImage.id.asc()).all()


def _serialize_content_image(image: ContentImage) -> dict:
    return {
        "id": image.id,
        "image_url": image.image_url,
        "source": image.source,
    }


def _serialize_content_response(db: Session, content: Content) -> dict:
    images = _list_content_images(db, content.id)
    return {
        "id": content.id,
        "content_type": content.content_type.value if hasattr(content.content_type, "value") else str(content.content_type),
        "platform": content.platform.value if hasattr(content.platform, "value") else str(content.platform),
        "generated_text": content.generated_text,
        "caption": content.caption,
        "hashtags": content.hashtags or [],
        "design_url": content.design_url,
        "image_urls": [img.image_url for img in images],
        "images": [_serialize_content_image(img) for img in images],
        "created_at": content.created_at,
    }


def _sync_primary_design_url(db: Session, content: Content) -> None:
    images = _list_content_images(db, content.id)
    content.design_url = images[0].image_url if images else None
