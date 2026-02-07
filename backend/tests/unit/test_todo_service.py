"""Unit tests for TodoService."""

from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.todo import Todo, TodoCreate, TodoUpdate
from app.repositories.todo_repository import TodoRepository
from app.services.todo_service import TodoService


class MockRepository:
    """Mock repository for testing TodoService."""

    def __init__(self):
        self.todos = []
        self.next_id = uuid4()

    def create(self, todo_data: TodoCreate, user_id: str) -> Todo:
        """Mock create method."""
        todo = Todo(
            id=self.next_id,
            title=todo_data.title,
            description=todo_data.description,
            user_id=user_id,
        )
        self.todos.append(todo)
        return todo

    def list_by_user(self, user_id: str):
        """Mock list_by_user method."""
        return [t for t in self.todos if t.user_id == user_id]

    def get_by_id_and_user(self, todo_id, user_id: str):
        """Mock get_by_id_and_user method."""
        for todo in self.todos:
            if todo.id == todo_id and todo.user_id == user_id:
                return todo
        return None

    def update(self, todo: Todo, update_data: TodoUpdate) -> Todo:
        """Mock update method."""
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(todo, key, value)
        return todo

    def delete(self, todo: Todo) -> None:
        """Mock delete method."""
        self.todos.remove(todo)


@pytest.fixture
def mock_repository():
    """Provide a mock repository."""
    return MockRepository()


@pytest.fixture
def service(mock_repository):
    """Provide a TodoService with mock repository."""
    return TodoService(mock_repository)


class TestCreateTodo:
    """Tests for TodoService.create_todo."""

    def test_create_todo_success(self, service: TodoService):
        """Test creating a todo returns TodoPublic."""
        todo_data = TodoCreate(title="Test todo", description="Test description")
        user_id = "user-123"

        result = service.create_todo(todo_data, user_id)

        assert result.title == "Test todo"
        assert result.description == "Test description"
        assert result.is_completed is False
        assert result.id is not None


class TestListTodos:
    """Tests for TodoService.list_todos."""

    def test_list_todos_returns_only_user_todos(
        self, service: TodoService, mock_repository: MockRepository
    ):
        """Test that list_todos returns only the specified user's todos."""
        # Create todos for different users
        service.create_todo(TodoCreate(title="User 1 Todo 1"), "user-1")
        service.create_todo(TodoCreate(title="User 1 Todo 2"), "user-1")
        service.create_todo(TodoCreate(title="User 2 Todo 1"), "user-2")

        # List todos for user 1
        result = service.list_todos("user-1")

        assert len(result) == 2
        assert all("User 1" in todo.title for todo in result)

    def test_list_todos_empty_for_no_todos(self, service: TodoService):
        """Test that list_todos returns empty list when user has no todos."""
        result = service.list_todos("user-with-no-todos")

        assert result == []


class TestUpdateTodo:
    """Tests for TodoService.update_todo."""

    def test_update_todo_success(self, service: TodoService, mock_repository: MockRepository):
        """Test updating a todo returns updated TodoPublic."""
        # Create a todo
        todo_data = TodoCreate(title="Original title")
        created = service.create_todo(todo_data, "user-1")

        # Update it
        update_data = TodoUpdate(title="Updated title", is_completed=True)
        result = service.update_todo(created.id, update_data, "user-1")

        assert result.title == "Updated title"
        assert result.is_completed is True

    def test_update_todo_not_found_raises_404(self, service: TodoService):
        """Test updating non-existent todo raises HTTPException 404."""
        fake_id = uuid4()
        update_data = TodoUpdate(title="Updated title")

        with pytest.raises(HTTPException) as exc_info:
            service.update_todo(fake_id, update_data, "user-1")

        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()

    def test_update_todo_wrong_owner_raises_404(
        self, service: TodoService, mock_repository: MockRepository
    ):
        """Test updating another user's todo raises HTTPException 404."""
        # User 1 creates a todo
        todo_data = TodoCreate(title="User 1 todo")
        created = service.create_todo(todo_data, "user-1")

        # User 2 tries to update it
        update_data = TodoUpdate(title="Hacked!")

        with pytest.raises(HTTPException) as exc_info:
            service.update_todo(created.id, update_data, "user-2")

        assert exc_info.value.status_code == 404


class TestDeleteTodo:
    """Tests for TodoService.delete_todo."""

    def test_delete_todo_success(self, service: TodoService, mock_repository: MockRepository):
        """Test deleting own todo succeeds."""
        # Create a todo
        todo_data = TodoCreate(title="To be deleted")
        created = service.create_todo(todo_data, "user-1")

        # Delete it
        service.delete_todo(created.id, "user-1")

        # Verify it's gone
        result = service.list_todos("user-1")
        assert len(result) == 0

    def test_delete_todo_not_found_raises_404(self, service: TodoService):
        """Test deleting non-existent todo raises HTTPException 404."""
        fake_id = uuid4()

        with pytest.raises(HTTPException) as exc_info:
            service.delete_todo(fake_id, "user-1")

        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail.lower()

    def test_delete_todo_wrong_owner_raises_404(
        self, service: TodoService, mock_repository: MockRepository
    ):
        """Test deleting another user's todo raises HTTPException 404."""
        # User 1 creates a todo
        todo_data = TodoCreate(title="User 1 todo")
        created = service.create_todo(todo_data, "user-1")

        # User 2 tries to delete it
        with pytest.raises(HTTPException) as exc_info:
            service.delete_todo(created.id, "user-2")

        assert exc_info.value.status_code == 404
