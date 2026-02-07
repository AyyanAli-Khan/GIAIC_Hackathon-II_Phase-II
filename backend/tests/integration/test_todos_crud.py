"""Integration tests for Todo CRUD endpoints."""

import pytest
from fastapi.testclient import TestClient


class TestCreateTodo:
    """Tests for POST /api/todos endpoint."""

    def test_create_todo_with_title_only(self, client: TestClient, valid_token: str):
        """Test creating a todo with title only (description should be null)."""
        response = client.post(
            "/api/todos",
            json={"title": "Buy groceries"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] is None
        assert data["is_completed"] is False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_todo_with_title_and_description(self, client: TestClient, valid_token: str):
        """Test creating a todo with both title and description."""
        response = client.post(
            "/api/todos",
            json={
                "title": "Buy groceries",
                "description": "Milk, bread, eggs",
            },
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["description"] == "Milk, bread, eggs"
        assert data["is_completed"] is False

    def test_create_todo_with_is_completed_true(self, client: TestClient, valid_token: str):
        """Test creating a todo with is_completed set to true."""
        response = client.post(
            "/api/todos",
            json={
                "title": "Already done task",
                "description": "This was completed before adding",
                "is_completed": True,
            },
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Already done task"
        assert data["description"] == "This was completed before adding"
        assert data["is_completed"] is True

    def test_create_todo_missing_title(self, client: TestClient, valid_token: str):
        """Test creating a todo without a title returns 422."""
        response = client.post(
            "/api/todos",
            json={"description": "Some description"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 422

    def test_create_todo_empty_title(self, client: TestClient, valid_token: str):
        """Test creating a todo with empty title returns 422."""
        response = client.post(
            "/api/todos",
            json={"title": ""},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 422

    def test_create_todo_title_too_long(self, client: TestClient, valid_token: str):
        """Test creating a todo with title >500 chars returns 422."""
        long_title = "x" * 501
        response = client.post(
            "/api/todos",
            json={"title": long_title},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 422

    def test_create_todo_no_auth_header(self, client: TestClient):
        """Test creating a todo without auth header returns 401."""
        response = client.post(
            "/api/todos",
            json={"title": "Buy groceries"},
        )

        assert response.status_code == 401


class TestListTodos:
    """Tests for GET /api/todos endpoint."""

    def test_list_returns_only_own_todos(
        self, client: TestClient, user_token_factory
    ):
        """Test that list endpoint returns only the authenticated user's todos."""
        user1_token = user_token_factory("user-1")
        user2_token = user_token_factory("user-2")

        # Create todos for user 1
        client.post(
            "/api/todos",
            json={"title": "User 1 Todo 1"},
            headers={"Authorization": f"Bearer {user1_token}"},
        )
        client.post(
            "/api/todos",
            json={"title": "User 1 Todo 2"},
            headers={"Authorization": f"Bearer {user1_token}"},
        )

        # Create todos for user 2
        client.post(
            "/api/todos",
            json={"title": "User 2 Todo 1"},
            headers={"Authorization": f"Bearer {user2_token}"},
        )

        # User 1 should only see their own todos
        response = client.get(
            "/api/todos",
            headers={"Authorization": f"Bearer {user1_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert all(todo["title"].startswith("User 1") for todo in data)

    def test_list_empty_for_user_with_no_todos(self, client: TestClient, valid_token: str):
        """Test that list returns empty array for user with no todos."""
        response = client.get(
            "/api/todos",
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_list_with_expired_token(self, client: TestClient, expired_token: str):
        """Test that list with expired token returns 401."""
        response = client.get(
            "/api/todos",
            headers={"Authorization": f"Bearer {expired_token}"},
        )

        assert response.status_code == 401


class TestUpdateTodo:
    """Tests for PATCH /api/todos/{id} endpoint."""

    def test_update_is_completed(self, client: TestClient, valid_token: str):
        """Test updating is_completed status."""
        # Create a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "Test todo"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todo_id = create_response.json()["id"]

        # Update is_completed
        response = client.patch(
            f"/api/todos/{todo_id}",
            json={"is_completed": True},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_completed"] is True
        assert data["title"] == "Test todo"

    def test_update_title(self, client: TestClient, valid_token: str):
        """Test updating title."""
        # Create a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "Old title"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todo_id = create_response.json()["id"]

        # Update title
        response = client.patch(
            f"/api/todos/{todo_id}",
            json={"title": "New title"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New title"

    def test_update_description(self, client: TestClient, valid_token: str):
        """Test updating description."""
        # Create a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "Test todo"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todo_id = create_response.json()["id"]

        # Update description
        response = client.patch(
            f"/api/todos/{todo_id}",
            json={"description": "New description"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "New description"

    def test_update_non_owner_gets_404(self, client: TestClient, user_token_factory):
        """Test that non-owner cannot update another user's todo."""
        user1_token = user_token_factory("user-1")
        user2_token = user_token_factory("user-2")

        # User 1 creates a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "User 1 todo"},
            headers={"Authorization": f"Bearer {user1_token}"},
        )
        todo_id = create_response.json()["id"]

        # User 2 tries to update it
        response = client.patch(
            f"/api/todos/{todo_id}",
            json={"title": "Hacked!"},
            headers={"Authorization": f"Bearer {user2_token}"},
        )

        assert response.status_code == 404

    def test_update_non_existent_id_gets_404(self, client: TestClient, valid_token: str):
        """Test that updating non-existent todo returns 404."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.patch(
            f"/api/todos/{fake_uuid}",
            json={"title": "New title"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 404

    def test_update_invalid_body(self, client: TestClient, valid_token: str):
        """Test that updating with invalid body returns 422."""
        # Create a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "Test todo"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todo_id = create_response.json()["id"]

        # Update with invalid body
        response = client.patch(
            f"/api/todos/{todo_id}",
            json={"title": ""},  # Empty title is invalid
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 422


class TestDeleteTodo:
    """Tests for DELETE /api/todos/{id} endpoint."""

    def test_delete_own_todo(self, client: TestClient, valid_token: str):
        """Test deleting own todo returns 204."""
        # Create a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "Test todo"},
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todo_id = create_response.json()["id"]

        # Delete it
        response = client.delete(
            f"/api/todos/{todo_id}",
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 204

        # Confirm it's gone
        get_response = client.get(
            "/api/todos",
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        todos = get_response.json()
        assert len(todos) == 0

    def test_delete_non_owner_gets_404(self, client: TestClient, user_token_factory):
        """Test that non-owner cannot delete another user's todo."""
        user1_token = user_token_factory("user-1")
        user2_token = user_token_factory("user-2")

        # User 1 creates a todo
        create_response = client.post(
            "/api/todos",
            json={"title": "User 1 todo"},
            headers={"Authorization": f"Bearer {user1_token}"},
        )
        todo_id = create_response.json()["id"]

        # User 2 tries to delete it
        response = client.delete(
            f"/api/todos/{todo_id}",
            headers={"Authorization": f"Bearer {user2_token}"},
        )

        assert response.status_code == 404

    def test_delete_non_existent_id_gets_404(self, client: TestClient, valid_token: str):
        """Test that deleting non-existent todo returns 404."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.delete(
            f"/api/todos/{fake_uuid}",
            headers={"Authorization": f"Bearer {valid_token}"},
        )

        assert response.status_code == 404
