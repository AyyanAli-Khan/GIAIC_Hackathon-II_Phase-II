"""Todo data models."""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Todo(SQLModel, table=True):
    """Todo table model.

    Represents a single todo item owned by a user.
    """

    __tablename__ = "todo"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=2000, nullable=True)
    is_completed: bool = Field(default=False, nullable=False)
    user_id: str = Field(max_length=255, nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class TodoCreate(SQLModel):
    """Request schema for creating a new todo."""

    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)


class TodoUpdate(SQLModel):
    """Request schema for updating a todo.

    All fields are optional - only provided fields will be updated.
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: Optional[bool] = Field(default=None)


class TodoPublic(SQLModel):
    """Response schema for todo data.

    Does not include user_id for security reasons.
    """

    id: UUID
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime
