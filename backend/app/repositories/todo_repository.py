"""Todo repository for database operations."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select

from app.models.todo import Todo, TodoCreate, TodoUpdate


class TodoRepository:
    """Repository for Todo database operations.

    All queries are scoped by user_id for security.
    """

    def __init__(self, session: Session):
        """Initialize repository with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def create(self, todo_data: TodoCreate, user_id: str) -> Todo:
        """Create a new todo for a user.

        Args:
            todo_data: Todo creation data
            user_id: User ID owning the todo

        Returns:
            Todo: Created todo with ID and timestamps
        """
        todo = Todo(
            title=todo_data.title,
            description=todo_data.description,
            is_completed=todo_data.is_completed,
            user_id=user_id,
        )
        self.session.add(todo)
        self.session.commit()
        self.session.refresh(todo)
        return todo

    def list_by_user(self, user_id: str) -> List[Todo]:
        """List all todos for a user.

        Args:
            user_id: User ID to filter by

        Returns:
            List[Todo]: List of user's todos, ordered by created_at desc
        """
        statement = (
            select(Todo)
            .where(Todo.user_id == user_id)
            .order_by(Todo.created_at.desc())
        )
        results = self.session.exec(statement)
        return list(results.all())

    def get_by_id_and_user(self, todo_id: UUID, user_id: str) -> Optional[Todo]:
        """Get a todo by ID, ensuring it belongs to the user.

        Args:
            todo_id: Todo UUID
            user_id: User ID to verify ownership

        Returns:
            Optional[Todo]: Todo if found and owned by user, None otherwise
        """
        statement = select(Todo).where(Todo.id == todo_id, Todo.user_id == user_id)
        result = self.session.exec(statement)
        return result.first()

    def update(self, todo: Todo, update_data: TodoUpdate) -> Todo:
        """Update a todo with new data.

        Args:
            todo: Existing todo to update
            update_data: Update data (only provided fields are updated)

        Returns:
            Todo: Updated todo
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            setattr(todo, key, value)

        # Update timestamp
        todo.updated_at = datetime.utcnow()

        self.session.add(todo)
        self.session.commit()
        self.session.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        """Delete a todo.

        Args:
            todo: Todo to delete
        """
        self.session.delete(todo)
        self.session.commit()
