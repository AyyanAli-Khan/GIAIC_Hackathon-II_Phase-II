# Implementation Plan: Todo Backend API

**Branch**: `001-todo-backend-api` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-backend-api/spec.md`

## Summary

Build a stateless FastAPI backend providing authenticated CRUD endpoints for a multi-user Todo application. JWTs issued by Better Auth (frontend) are verified via RS256 using PyJWT's `PyJWKClient` with JWKS caching. All data persists in Neon Serverless PostgreSQL via SQLModel ORM with Alembic migrations. User isolation is enforced at the query level. The backend follows a layered architecture: routers → services → repositories.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: FastAPI, SQLModel, PyJWT (with `PyJWKClient`), Uvicorn, Alembic, python-dotenv, httpx (for JWKS fetch)
**Storage**: Neon Serverless PostgreSQL (via `DATABASE_URL` env var)
**Testing**: pytest, pytest-asyncio, httpx (TestClient)
**Target Platform**: Linux server / containerized deployment
**Project Type**: Web application (backend only — this feature)
**Performance Goals**: <500ms p95 per endpoint, 100 concurrent users
**Constraints**: Stateless JWT auth, no in-memory persistence, no raw SQL
**Scale/Scope**: Single Todo table, ~100 concurrent users initial target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Determinism | PASS | All dependencies verified via Context7 MCP (FastAPI, SQLModel, PyJWT PyJWKClient, Better Auth JWKS) |
| II. Security-First | PASS | JWT verification on all protected endpoints, user isolation at query level, CORS restricted, no hardcoded secrets |
| III. Non-Hallucination | PASS | PyJWT `PyJWKClient` with `cache_jwk_set` and `lifespan` confirmed via Context7. SQLModel `table=True` and `Field` confirmed. FastAPI `Depends`, `HTTPBearer` confirmed. |
| IV. Separation of Concerns | PASS | Layered architecture: routers → services → repositories. Auth as dependency injection. DB sessions via `Depends`. |
| V. Reproducibility | PASS | UV for deps, `.env.example` template, Alembic for migrations |
| VI. Observability | PASS | Structured JSON logging via `structlog`, request logging middleware, auth failure warnings |
| VII. Production Realism | PASS | Real Neon PostgreSQL, real JWT verification via JWKS, proper HTTP status codes |

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app factory, CORS, middleware
│   ├── config.py            # Settings via environment variables
│   ├── database.py          # Engine, session factory, get_session dependency
│   ├── auth/
│   │   ├── __init__.py
│   │   └── dependencies.py  # JWT verification dependency (PyJWKClient)
│   ├── models/
│   │   ├── __init__.py
│   │   └── todo.py          # SQLModel table + request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py        # GET /api/health
│   │   └── todos.py         # CRUD /api/todos
│   ├── services/
│   │   ├── __init__.py
│   │   └── todo_service.py  # Business logic (CRUD with ownership)
│   └── repositories/
│       ├── __init__.py
│       └── todo_repository.py  # Database queries (SQLModel sessions)
├── alembic/
│   ├── env.py
│   ├── versions/
│   └── alembic.ini
├── tests/
│   ├── conftest.py          # Fixtures: test client, test DB, JWT helpers
│   ├── unit/
│   │   └── test_todo_service.py
│   └── integration/
│       ├── test_health.py
│       ├── test_todos_crud.py
│       └── test_auth.py     # Invalid/expired/missing token tests
├── .env.example
├── pyproject.toml           # UV/pip project config
└── README.md
```

**Structure Decision**: Web application backend-only layout. The `backend/` directory contains the complete FastAPI application. Frontend is a separate Next.js project (out of scope for this feature). The layered architecture (routers → services → repositories) enforces separation of concerns per Constitution Principle IV.

## Architecture

### Data Flow

```
Request
  → CORS middleware
  → Logging middleware (method, path, start time)
  → FastAPI router
  → Auth dependency: HTTPBearer → PyJWKClient.get_signing_key_from_jwt(token) → jwt.decode(RS256) → extract sub claim
  → Service layer (business logic + ownership enforcement)
  → Repository layer (SQLModel queries filtered by user_id)
  → Neon PostgreSQL
  → Response (JSON) + logging (status, duration, user_id)
```

### JWT Verification Strategy

1. On startup, initialize `PyJWKClient` with:
   - URL: `{BETTER_AUTH_URL}/api/auth/jwks`
   - `cache_jwk_set=True`
   - `lifespan=3600` (1 hour TTL)
2. Per request: `get_signing_key_from_jwt(token)` fetches/returns cached key
3. `jwt.decode(token, signing_key, algorithms=["RS256"])` validates signature + expiry
4. Extract `sub` claim as `user_id`
5. On key fetch failure with warm cache: use stale cached keys
6. On key fetch failure with cold cache (first startup): return 503

### User Isolation Enforcement Points

1. **Auth dependency**: Extracts `user_id` from JWT — injected into all route handlers
2. **Service layer**: Passes `user_id` to all repository calls
3. **Repository layer**: ALL queries include `WHERE user_id = :current_user_id`
4. **Response**: Never returns `user_id` in API responses (internal field only)

### Error Handling Strategy

| Layer | Error | Action |
|-------|-------|--------|
| Auth dependency | Missing/invalid/expired JWT | Raise HTTPException(401) |
| Router | Validation error | FastAPI auto-422 via Pydantic |
| Service | Todo not found (including ownership mismatch) | Raise HTTPException(404) |
| Repository | DB connection failure | Raise, caught by global handler → 500 |
| Global | Unhandled exception | Exception handler → 500 + log traceback |
| Health | DB unreachable | Return 503 with detail |

### Database Design

**Table: `todo`**

| Column       | Type                     | Constraints                    |
|--------------|--------------------------|--------------------------------|
| id           | UUID                     | PK, default uuid4              |
| title        | VARCHAR(500)             | NOT NULL                       |
| description  | VARCHAR(2000)            | NULLABLE                       |
| is_completed | BOOLEAN                  | NOT NULL, default FALSE        |
| user_id      | VARCHAR(255)             | NOT NULL, INDEX                |
| created_at   | TIMESTAMP WITH TIME ZONE | NOT NULL, default now()        |
| updated_at   | TIMESTAMP WITH TIME ZONE | NOT NULL, default now(), on update now() |

**Indexes**:
- `ix_todo_user_id` on `user_id` (all queries filter by user_id)
- `ix_todo_user_id_created_at` composite index on `(user_id, created_at DESC)` for listing with default sort order

**Migration approach**: Alembic with auto-generation from SQLModel metadata. Migrations stored in `backend/alembic/versions/` and version-controlled.

### Environment Variables

| Variable         | Required | Description                                    |
|------------------|----------|------------------------------------------------|
| DATABASE_URL     | Yes      | Neon PostgreSQL connection string              |
| BETTER_AUTH_URL  | Yes      | Base URL for JWKS endpoint (e.g., `https://app.example.com`) |
| CORS_ORIGINS     | Yes      | Comma-separated allowed origins                |
| LOG_LEVEL        | No       | Default: `INFO`                                |
| JWKS_CACHE_TTL   | No       | JWKS cache lifetime in seconds. Default: `3600` |

### Dependencies (verified via Context7 MCP)

| Package        | Purpose                          | Verified |
|----------------|----------------------------------|----------|
| fastapi        | Web framework                    | Yes — Depends, HTTPBearer, HTTPException |
| uvicorn        | ASGI server                      | Yes |
| sqlmodel       | ORM (SQLAlchemy + Pydantic)      | Yes — Field, table=True, UUID, Relationship |
| pyjwt[crypto]  | JWT decode + RS256 + PyJWKClient | Yes — PyJWKClient, cache_jwk_set, lifespan |
| alembic        | Database migrations              | Yes |
| psycopg2-binary | PostgreSQL driver               | Yes |
| python-dotenv  | Load .env files                  | Yes |
| structlog      | Structured JSON logging          | Yes |
| httpx          | Test client + HTTP requests      | Yes |
| pytest         | Test runner                      | Yes |
| pytest-asyncio | Async test support               | Yes |

## Complexity Tracking

> No constitution violations detected. All design decisions follow the simplest viable approach.

| Decision | Rationale | Simpler Alternative Rejected Because |
|----------|-----------|-------------------------------------|
| Repository pattern | Enforces user_id filtering at a single layer; prevents accidental unscoped queries | Direct DB in service would scatter WHERE clauses and risk missing user_id filter |
| PyJWKClient caching | Built-in to PyJWT (`cache_jwk_set=True`, `lifespan`); no extra library needed | Manual HTTP fetch + cache would duplicate PyJWT's built-in functionality |
