"""Integration tests for health check endpoint."""

import pytest
from fastapi.testclient import TestClient


class TestHealthCheck:
    """Tests for GET /api/health endpoint."""

    def test_health_check_returns_healthy(self, client: TestClient):
        """Test that health check returns 200 with healthy status."""
        response = client.get("/api/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_check_no_auth_required(self, client: TestClient):
        """Test that health check does not require authentication."""
        # No Authorization header provided
        response = client.get("/api/health")

        # Should still return 200
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
