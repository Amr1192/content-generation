from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
from app.models.brand import Brand
from app.models.user import User

router = APIRouter(prefix="/brands", tags=["Brands"])


# Pydantic schemas
class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    tone: str = "professional"
    visual_style: str = "minimal"
    color_palette: Optional[dict] = None
    instagram_handle: Optional[str] = None
    facebook_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_handle: Optional[str] = None
    tiktok_handle: Optional[str] = None


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    tone: Optional[str] = None
    visual_style: Optional[str] = None
    color_palette: Optional[dict] = None
    instagram_handle: Optional[str] = None
    facebook_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    linkedin_handle: Optional[str] = None
    tiktok_handle: Optional[str] = None


class BrandResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    industry: Optional[str]
    tone: str
    visual_style: str
    color_palette: Optional[dict]
    
    class Config:
        from_attributes = True


@router.post("/", response_model=BrandResponse)
async def create_brand(
    brand_data: BrandCreate,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Create a new brand profile"""
    
    # Default color palette if none provided
    if brand_data.color_palette is None:
        brand_data.color_palette = {
            "primary": "#6366f1",
            "secondary": "#8b5cf6",
            "background": "#ffffff",
            "text": "#1f2937"
        }
    
    brand = Brand(
        user_id=user_id,
        **brand_data.model_dump()
    )
    
    db.add(brand)
    db.commit()
    db.refresh(brand)
    
    return brand


@router.get("/", response_model=List[BrandResponse])
async def get_brands(
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Get all brands for the current user"""
    
    brands = db.query(Brand).filter(Brand.user_id == user_id).all()
    return brands


@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Get a specific brand"""
    
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == user_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return brand


@router.put("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    brand_data: BrandUpdate,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Update a brand"""
    
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == user_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    # Update fields
    for field, value in brand_data.model_dump(exclude_unset=True).items():
        setattr(brand, field, value)
    
    db.commit()
    db.refresh(brand)
    
    return brand


@router.delete("/{brand_id}")
async def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1  # TODO: Get from auth token
):
    """Delete a brand"""
    
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == user_id
    ).first()
    
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    db.delete(brand)
    db.commit()
    
    return {"success": True, "message": "Brand deleted successfully"}
