"""Database connection and session management."""

from typing import Generator

from sqlmodel import Session, create_engine

from app.config import get_settings

settings = get_settings()

# Create SQLModel engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.LOG_LEVEL == "DEBUG",  # Log SQL queries in debug mode
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=300,  # Recycle connections after 5 minutes
)


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a database session.

    Yields:
        Session: SQLModel database session

    Example:
        @app.get("/items")
        def get_items(session: Session = Depends(get_session)):
            items = session.exec(select(Item)).all()
            return items
    """
    with Session(engine) as session:
        yield session
