"""Health check endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from app.database import get_session

router = APIRouter()


@router.get("/health")
async def health_check(session: Annotated[Session, Depends(get_session)]):
    """Check application and database health.

    This endpoint does not require authentication.

    Args:
        session: Database session

    Returns:
        dict: Health status
            - 200: {"status": "healthy"} if database is reachable
            - 503: {"status": "unhealthy", "detail": "database unreachable"} if database fails
    """
    try:
        # Attempt a simple database query to verify connection
        session.exec(select(1))
        return {"status": "healthy"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "detail": "database unreachable",
            },
        )
