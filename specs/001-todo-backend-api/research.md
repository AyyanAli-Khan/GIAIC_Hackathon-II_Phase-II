# Research: Todo Backend API

**Branch**: `001-todo-backend-api` | **Date**: 2026-02-07

## Research Findings

### 1. JWT Verification with JWKS (RS256)

**Decision**: Use PyJWT's built-in `PyJWKClient` for JWKS-based RS256 verification.

**Rationale**: PyJWT (v2.x+) includes `PyJWKClient` which handles fetching, caching, and key rotation from a JWKS endpoint natively. No additional libraries needed. The `cache_jwk_set=True` and `lifespan` parameters provide TTL-based caching out of the box.

**Alternatives considered**:
- `python-jose`: Less actively maintained, PyJWT is the de facto standard
- `authlib/joserfc`: More features than needed; PyJWT is simpler for our use case
- Manual JWKS fetch with httpx + manual cache: Reinvents PyJWT built-in

**Context7 verification**: PyJWKClient confirmed with `cache_jwk_set`, `lifespan`, `get_signing_key_from_jwt()`, and `jwt.decode()` with `algorithms=["RS256"]`.

### 2. SQLModel with FastAPI

**Decision**: Use SQLModel with `table=True` for database models, separate Pydantic models for request/response schemas.

**Rationale**: SQLModel combines SQLAlchemy and Pydantic. Using `table=True` creates database-backed models. Separate schema classes (without `table=True`) define API contracts. This pattern is documented in SQLModel's FastAPI tutorial.

**Alternatives considered**:
- Pure SQLAlchemy + separate Pydantic models: More boilerplate, no benefit
- Tortoise ORM: Less mature, not as well integrated with FastAPI

**Context7 verification**: SQLModel `Field`, `table=True`, `UUID` primary keys, `Relationship`, and foreign keys all confirmed.

### 3. Database Connection for Neon Serverless

**Decision**: Use `psycopg2-binary` with SQLModel/SQLAlchemy `create_engine`. Connection string from `DATABASE_URL` env var.

**Rationale**: Neon Serverless PostgreSQL supports standard PostgreSQL wire protocol. `psycopg2-binary` is the most widely used Python PostgreSQL driver and works with Neon without modifications. Connection pooling is handled by Neon's built-in pooler (PgBouncer).

**Alternatives considered**:
- `asyncpg`: Would require async engine setup; adds complexity without clear benefit for our scale
- `psycopg[binary]` (v3): Newer but less ecosystem support; v2 is proven

### 4. Alembic Migrations with SQLModel

**Decision**: Use Alembic with SQLModel metadata for auto-generated migrations.

**Rationale**: Alembic is the only production-grade migration tool for SQLAlchemy-based ORMs. SQLModel models expose their metadata through `SQLModel.metadata`, which Alembic can introspect for auto-generation.

**Configuration**: `alembic.ini` points to `DATABASE_URL`. `env.py` imports `SQLModel` and sets `target_metadata = SQLModel.metadata`.

### 5. Structured Logging

**Decision**: Use `structlog` for structured JSON logging.

**Rationale**: `structlog` produces machine-parseable JSON logs, supports context binding (e.g., user_id, request_id), and integrates with Python's standard logging. It satisfies Constitution Principle VI (Observability).

**Alternatives considered**:
- `python-json-logger`: Less feature-rich than structlog
- Standard `logging` with JSON formatter: More manual configuration

### 6. CORS Configuration

**Decision**: Use FastAPI's built-in `CORSMiddleware` with `CORS_ORIGINS` from environment variable.

**Rationale**: FastAPI provides `CORSMiddleware` out of the box. Origins loaded from env var ensures no hardcoded frontend URLs. Only the frontend origin is allowed.
