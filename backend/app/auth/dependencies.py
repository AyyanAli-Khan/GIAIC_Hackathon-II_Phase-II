"""JWT authentication dependencies."""

import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize PyJWKClient with JWKS caching
jwks_client = PyJWKClient(
    uri=f"{settings.BETTER_AUTH_URL}/api/auth/jwks",
    cache_keys=True,
    lifespan=settings.JWKS_CACHE_TTL,
)

# HTTP Bearer token security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """Extract and verify JWT token, return user_id.

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        str: User ID (sub claim from JWT)

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        # Get signing key from JWKS endpoint (cached)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify JWT
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_exp": True, "verify_aud": False},
        )

        # Extract user_id from sub claim
        user_id: str = payload.get("sub")
        if not user_id:
            logger.warning("JWT missing sub claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        return user_id

    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
