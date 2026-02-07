"""Pytest configuration and fixtures."""

import os
from datetime import datetime, timedelta
from typing import Generator

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


@pytest.fixture(name="test_engine")
def test_engine_fixture():
    """Create in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(test_engine) -> Generator[Session, None, None]:
    """Provide a test database session."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Provide a test client with overridden database session."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="rsa_keys")
def rsa_keys_fixture():
    """Generate RSA key pair for JWT testing."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    return {
        "private_key": private_pem,
        "public_key": public_pem,
    }


@pytest.fixture(name="valid_token")
def valid_token_fixture(rsa_keys) -> str:
    """Generate a valid JWT token for testing.

    Returns:
        str: Valid JWT token with sub claim set to "test-user-id"
    """
    payload = {
        "sub": "test-user-id",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1),
    }

    token = jwt.encode(
        payload,
        rsa_keys["private_key"],
        algorithm="RS256",
    )

    return token


@pytest.fixture(name="expired_token")
def expired_token_fixture(rsa_keys) -> str:
    """Generate an expired JWT token for testing."""
    payload = {
        "sub": "test-user-id",
        "iat": datetime.utcnow() - timedelta(hours=2),
        "exp": datetime.utcnow() - timedelta(hours=1),
    }

    token = jwt.encode(
        payload,
        rsa_keys["private_key"],
        algorithm="RS256",
    )

    return token


@pytest.fixture(name="invalid_token")
def invalid_token_fixture() -> str:
    """Return an invalid JWT token for testing."""
    return "invalid.jwt.token"


@pytest.fixture(name="user_token_factory")
def user_token_factory_fixture(rsa_keys):
    """Factory to generate JWT tokens for different users.

    Returns:
        Callable: Function that takes user_id and returns a JWT token
    """

    def create_token(user_id: str) -> str:
        payload = {
            "sub": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1),
        }

        token = jwt.encode(
            payload,
            rsa_keys["private_key"],
            algorithm="RS256",
        )

        return token

    return create_token
