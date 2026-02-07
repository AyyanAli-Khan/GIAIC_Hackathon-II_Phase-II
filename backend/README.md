# Todo Backend API

FastAPI backend for multi-user Todo application with JWT authentication.

## Features

- ✅ RESTful CRUD API for todos
- ✅ JWT authentication via Better Auth (RS256/JWKS)
- ✅ User isolation at query level
- ✅ Structured JSON logging
- ✅ Health check endpoint
- ✅ PostgreSQL persistence via SQLModel
- ✅ Database migrations via Alembic

## Tech Stack

- **Python**: 3.12+
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon Serverless)
- **Auth**: JWT verification via PyJWT PyJWKClient
- **Logging**: structlog
- **Testing**: pytest, pytest-asyncio

## Project Structure

```
backend/
├── app/
│   ├── auth/
│   │   └── dependencies.py      # JWT verification
│   ├── models/
│   │   └── todo.py              # SQLModel models
│   ├── routers/
│   │   ├── health.py            # Health check
│   │   └── todos.py             # CRUD endpoints
│   ├── services/
│   │   └── todo_service.py      # Business logic
│   ├── repositories/
│   │   └── todo_repository.py   # Database queries
│   ├── config.py                # Settings
│   ├── database.py              # DB connection
│   └── main.py                  # FastAPI app
├── alembic/
│   ├── versions/                # Migrations
│   └── env.py                   # Alembic config
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
├── pyproject.toml
└── .env.example
```

## Setup

### 1. Install Dependencies

Using UV (recommended):

```bash
uv sync
```

Or using pip:

```bash
pip install -e .
pip install -e ".[dev]"
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=INFO
JWKS_CACHE_TTL=3600
```

### 3. Run Migrations

```bash
uv run alembic upgrade head
```

### 4. Start Server

```bash
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Health

- `GET /api/health` - Health check (no auth required)

### Todos

All todo endpoints require JWT authentication via `Authorization: Bearer <token>` header.

- `POST /api/todos` - Create a todo
- `GET /api/todos` - List user's todos
- `PATCH /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo

## Testing

### Run All Tests

```bash
uv run pytest tests/ -v
```

### Run Unit Tests Only

```bash
uv run pytest tests/unit/ -v
```

### Run Integration Tests Only

```bash
uv run pytest tests/integration/ -v
```

### Run with Coverage

```bash
uv run pytest tests/ --cov=app --cov-report=html
```

## Development

### Create a New Migration

After modifying models:

```bash
uv run alembic revision --autogenerate -m "Description of changes"
uv run alembic upgrade head
```

### View API Documentation

Once the server is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Architecture

### Layered Architecture

```
Request → Router → Service → Repository → Database
         ↓
    Auth Dependency (JWT verification)
```

### User Isolation

User isolation is enforced at 3 layers:

1. **Auth dependency**: Extracts `user_id` from JWT
2. **Service layer**: Passes `user_id` to repository
3. **Repository layer**: ALL queries include `WHERE user_id = :current_user_id`

### Error Handling

- `401 Unauthorized`: Missing, invalid, or expired JWT
- `404 Not Found`: Todo not found or not owned by user
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Unhandled exceptions
- `503 Service Unavailable`: Database unreachable

## License

MIT
