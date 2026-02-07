"""Application configuration loaded from environment variables."""

import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self):
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "")
        self.BETTER_AUTH_URL: str = os.getenv("BETTER_AUTH_URL", "")
        self.CORS_ORIGINS: List[str] = [
            origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()
        ]
        self.LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
        self.JWKS_CACHE_TTL: int = int(os.getenv("JWKS_CACHE_TTL", "3600"))

    def validate(self) -> None:
        """Validate that required settings are present."""
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")
        if not self.BETTER_AUTH_URL:
            raise ValueError("BETTER_AUTH_URL environment variable is required")
        if self.JWKS_CACHE_TTL <= 0:
            raise ValueError("JWKS_CACHE_TTL must be a positive integer")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    settings = Settings()
    settings.validate()
    return settings
