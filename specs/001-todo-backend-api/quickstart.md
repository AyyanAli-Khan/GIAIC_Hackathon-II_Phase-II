# Quickstart: Todo Backend API

**Branch**: `001-todo-backend-api` | **Date**: 2026-02-07

## Prerequisites

- Python 3.12+
- UV (Python package manager)
- Access to a Neon Serverless PostgreSQL database
- A running Better Auth frontend instance (for JWKS endpoint)

## Setup

### 1. Clone and navigate

```bash
cd backend
```

### 2. Install dependencies with UV

```bash
uv sync
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
JWKS_CACHE_TTL=3600
```

### 4. Run database migrations

```bash
uv run alembic upgrade head
```

### 5. Start the server

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verify

```bash
curl http://localhost:8000/api/health
# Expected: {"status": "healthy"}
```

## API Endpoints

| Method | Path             | Auth     | Description        |
|--------|------------------|----------|--------------------|
| GET    | /api/health      | None     | Health check       |
| POST   | /api/todos       | JWT      | Create a todo      |
| GET    | /api/todos       | JWT      | List user's todos  |
| PATCH  | /api/todos/{id}  | JWT      | Update a todo      |
| DELETE | /api/todos/{id}  | JWT      | Delete a todo      |

## Running Tests

```bash
uv run pytest tests/ -v
```

## Common Issues

- **401 on all requests**: Ensure `BETTER_AUTH_URL` points to a running Better Auth instance with JWKS endpoint available at `/api/auth/jwks`.
- **503 on health check**: Verify `DATABASE_URL` is correct and Neon PostgreSQL is accessible.
- **CORS errors**: Ensure `CORS_ORIGINS` includes your frontend URL.
