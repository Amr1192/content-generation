from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "ContentKing"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # Anthropic (optional)
    ANTHROPIC_API_KEY: str = ""
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Email (optional - for future use)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Allow extra fields in .env without errors
        extra = "ignore"


settings = Settings()
