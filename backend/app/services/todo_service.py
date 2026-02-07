"""Todo business logic service."""

from typing import List
from uuid import UUID

from fastapi import HTTPException, status

from app.models.todo import Todo, TodoCreate, TodoPublic, TodoUpdate
from app.repositories.todo_repository import TodoRepository


class TodoService:
    """Service for Todo business logic.

    Enforces ownership rules and converts between internal and public models.
    """

    def __init__(self, repository: TodoRepository):
        """Initialize service with repository.

        Args:
            repository: Todo repository for database operations
        """
        self.repository = repository

    def create_todo(self, todo_data: TodoCreate, user_id: str) -> TodoPublic:
        """Create a new todo for a user.

        Args:
            todo_data: Todo creation data
            user_id: User ID owning the todo

        Returns:
            TodoPublic: Created todo (without user_id)
        """
        todo = self.repository.create(todo_data, user_id)
        return TodoPublic.model_validate(todo)

    def list_todos(self, user_id: str) -> List[TodoPublic]:
        """List all todos for a user.

        Args:
            user_id: User ID to filter by

        Returns:
            List[TodoPublic]: List of user's todos
        """
        todos = self.repository.list_by_user(user_id)
        return [TodoPublic.model_validate(todo) for todo in todos]

    def update_todo(self, todo_id: UUID, update_data: TodoUpdate, user_id: str) -> TodoPublic:
        """Update a todo, ensuring ownership.

        Args:
            todo_id: Todo UUID
            update_data: Update data
            user_id: User ID to verify ownership

        Returns:
            TodoPublic: Updated todo

        Raises:
            HTTPException: 404 if todo not found or not owned by user
        """
        todo = self.repository.get_by_id_and_user(todo_id, user_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )

        updated_todo = self.repository.update(todo, update_data)
        return TodoPublic.model_validate(updated_todo)

    def delete_todo(self, todo_id: UUID, user_id: str) -> None:
        """Delete a todo, ensuring ownership.

        Args:
            todo_id: Todo UUID
            user_id: User ID to verify ownership

        Raises:
            HTTPException: 404 if todo not found or not owned by user
        """
        todo = self.repository.get_by_id_and_user(todo_id, user_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )

        self.repository.delete(todo)
