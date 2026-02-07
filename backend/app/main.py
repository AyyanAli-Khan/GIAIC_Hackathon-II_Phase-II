"""FastAPI application factory and configuration."""

import logging
import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import SQLModel

from app.config import get_settings
from app.database import engine

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info("application_startup", message="Starting Todo Backend API")

    # Create database tables (for development - use Alembic in production)
    # SQLModel.metadata.create_all(engine)

    yield

    # Shutdown
    logger.info("application_shutdown", message="Shutting down Todo Backend API")


def create_app() -> FastAPI:
    """Create and configure FastAPI application.

    Returns:
        FastAPI: Configured application instance
    """
    settings = get_settings()

    app = FastAPI(
        title="Todo Backend API",
        description="Multi-user Todo application with JWT authentication",
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all HTTP requests with structured logging."""
        start_time = time.time()

        # Extract user_id if available (will be set by auth dependency)
        user_id = getattr(request.state, "user_id", None)

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log request
        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
            user_id=user_id,
        )

        return response

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Handle all unhandled exceptions."""
        logger.error(
            "unhandled_exception",
            error=str(exc),
            path=request.url.path,
            method=request.method,
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    # Validation error handler
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors."""
        logger.warning(
            "validation_error",
            errors=exc.errors(),
            path=request.url.path,
            method=request.method,
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    # Register routers
    from app.routers import health, todos

    app.include_router(health.router, prefix="/api", tags=["health"])
    app.include_router(todos.router, prefix="/api", tags=["todos"])

    return app


# Create app instance
app = create_app()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Todo Backend API", "version": "0.1.0"}
