"""Integration tests for authentication failures."""

import pytest
from fastapi.testclient import TestClient


class TestAuthenticationFailures:
    """Test all authentication failure scenarios across protected endpoints."""

    @pytest.fixture
    def protected_endpoints(self):
        """List of protected endpoints to test.

        Returns:
            list: List of (method, url) tuples for protected endpoints
        """
        return [
            ("POST", "/api/todos"),
            ("GET", "/api/todos"),
            ("PATCH", "/api/todos/00000000-0000-0000-0000-000000000000"),
            ("DELETE", "/api/todos/00000000-0000-0000-0000-000000000000"),
        ]

    def test_missing_jwt_returns_401(self, client: TestClient, protected_endpoints):
        """Test that missing JWT returns 401 for all protected endpoints."""
        for method, url in protected_endpoints:
            if method == "POST":
                response = client.post(url, json={"title": "Test"})
            elif method == "GET":
                response = client.get(url)
            elif method == "PATCH":
                response = client.patch(url, json={"title": "Updated"})
            elif method == "DELETE":
                response = client.delete(url)

            assert response.status_code == 401, f"{method} {url} should return 401 without auth"

    def test_invalid_jwt_signature_returns_401(
        self, client: TestClient, invalid_token: str, protected_endpoints
    ):
        """Test that invalid JWT signature returns 401 for all protected endpoints."""
        for method, url in protected_endpoints:
            headers = {"Authorization": f"Bearer {invalid_token}"}

            if method == "POST":
                response = client.post(url, json={"title": "Test"}, headers=headers)
            elif method == "GET":
                response = client.get(url, headers=headers)
            elif method == "PATCH":
                response = client.patch(url, json={"title": "Updated"}, headers=headers)
            elif method == "DELETE":
                response = client.delete(url, headers=headers)

            assert response.status_code == 401, f"{method} {url} should return 401 with invalid token"

    def test_expired_jwt_returns_401(
        self, client: TestClient, expired_token: str, protected_endpoints
    ):
        """Test that expired JWT returns 401 for all protected endpoints."""
        for method, url in protected_endpoints:
            headers = {"Authorization": f"Bearer {expired_token}"}

            if method == "POST":
                response = client.post(url, json={"title": "Test"}, headers=headers)
            elif method == "GET":
                response = client.get(url, headers=headers)
            elif method == "PATCH":
                response = client.patch(url, json={"title": "Updated"}, headers=headers)
            elif method == "DELETE":
                response = client.delete(url, headers=headers)

            assert response.status_code == 401, f"{method} {url} should return 401 with expired token"

    def test_malformed_jwt_returns_401(self, client: TestClient, protected_endpoints):
        """Test that malformed JWT returns 401 for all protected endpoints."""
        malformed_token = "not.a.valid.jwt.token.at.all"

        for method, url in protected_endpoints:
            headers = {"Authorization": f"Bearer {malformed_token}"}

            if method == "POST":
                response = client.post(url, json={"title": "Test"}, headers=headers)
            elif method == "GET":
                response = client.get(url, headers=headers)
            elif method == "PATCH":
                response = client.patch(url, json={"title": "Updated"}, headers=headers)
            elif method == "DELETE":
                response = client.delete(url, headers=headers)

            assert response.status_code == 401, f"{method} {url} should return 401 with malformed token"

    def test_bearer_prefix_required(self, client: TestClient, valid_token: str):
        """Test that Bearer prefix is required in Authorization header."""
        # Missing "Bearer " prefix
        response = client.get(
            "/api/todos",
            headers={"Authorization": valid_token},
        )

        assert response.status_code == 401

    def test_health_endpoint_does_not_require_auth(self, client: TestClient):
        """Test that health endpoint is accessible without authentication."""
        response = client.get("/api/health")

        # Should return 200, not 401
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
