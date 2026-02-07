"""Todo CRUD endpoints."""

from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.todo import TodoCreate, TodoPublic, TodoUpdate
from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService

router = APIRouter()


def get_todo_service(session: Annotated[Session, Depends(get_session)]) -> TodoService:
    """Dependency to get TodoService with repository.

    Args:
        session: Database session

    Returns:
        TodoService: Service instance with repository
    """
    repository = TodoRepository(session)
    return TodoService(repository)


@router.post("/todos", response_model=TodoPublic, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    user_id: Annotated[str, Depends(get_current_user)],
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> TodoPublic:
    """Create a new todo for the authenticated user.

    Args:
        todo_data: Todo creation data
        user_id: Authenticated user ID from JWT
        service: Todo service instance

    Returns:
        TodoPublic: Created todo
    """
    return service.create_todo(todo_data, user_id)


@router.get("/todos", response_model=List[TodoPublic])
async def list_todos(
    user_id: Annotated[str, Depends(get_current_user)],
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> List[TodoPublic]:
    """List all todos for the authenticated user.

    Args:
        user_id: Authenticated user ID from JWT
        service: Todo service instance

    Returns:
        List[TodoPublic]: List of user's todos
    """
    return service.list_todos(user_id)


@router.patch("/todos/{todo_id}", response_model=TodoPublic)
async def update_todo(
    todo_id: UUID,
    update_data: TodoUpdate,
    user_id: Annotated[str, Depends(get_current_user)],
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> TodoPublic:
    """Update a todo for the authenticated user.

    Args:
        todo_id: Todo UUID
        update_data: Update data
        user_id: Authenticated user ID from JWT
        service: Todo service instance

    Returns:
        TodoPublic: Updated todo

    Raises:
        HTTPException: 404 if todo not found or not owned by user
    """
    return service.update_todo(todo_id, update_data, user_id)


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: UUID,
    user_id: Annotated[str, Depends(get_current_user)],
    service: Annotated[TodoService, Depends(get_todo_service)],
) -> None:
    """Delete a todo for the authenticated user.

    Args:
        todo_id: Todo UUID
        user_id: Authenticated user ID from JWT
        service: Todo service instance

    Raises:
        HTTPException: 404 if todo not found or not owned by user
    """
    service.delete_todo(todo_id, user_id)
