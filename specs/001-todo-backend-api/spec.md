# Feature Specification: Todo Backend API

**Feature Branch**: `001-todo-backend-api`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Specify the backend system for a multi-user Todo web application with JWT auth, FastAPI, SQLModel, Neon PostgreSQL"

## Clarifications

### Session 2026-02-07

- Q: Should JWT verification use HS256 with shared secret or JWKS-based asymmetric verification? → A: JWKS-based verification (RS256). Backend fetches public key from Better Auth's `/api/auth/jwks` endpoint and verifies JWT signature asymmetrically. No shared secret needed for JWT verification.
- Q: Which database migration tool should be used? → A: Alembic. SQLAlchemy's dedicated migration tool, auto-generates migrations from SQLModel model changes. Industry standard for FastAPI + SQLModel projects.
- Q: How should JWKS public keys be cached for JWT verification? → A: Cache with configurable TTL (default 1 hour) and background refresh. Stale cache serves requests if auth server is temporarily unavailable.
- Q: Should todos have a description field? → A: Yes. An optional `description` field (string, max 2000 chars, nullable) is added to the Todo entity. Users may provide it at creation or update time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated User Creates a Todo (Priority: P1)

A registered user sends a request with a valid JWT Bearer token to
create a new todo item. The backend validates the token, extracts the
user identity, and persists the todo in the database scoped to
that user.

**Why this priority**: Creating todos is the core action of the
application. Without this, the product has no value.

**Independent Test**: Send a POST request with a valid JWT and a
JSON body containing a todo title. Verify a 201 response with the
created todo object. Query the database and confirm the todo is
stored with the correct user_id.

**Acceptance Scenarios**:

1. **Given** a valid JWT token and a JSON body `{"title": "Buy milk"}`, **When** the user sends POST /api/todos, **Then** the system returns 201 with the created todo containing an id, title, description=null, is_completed=false, created_at, and updated_at.
4. **Given** a valid JWT token and a JSON body `{"title": "Groceries", "description": "Milk, eggs, bread"}`, **When** the user sends POST /api/todos, **Then** the system returns 201 with the created todo containing description="Milk, eggs, bread".
2. **Given** a valid JWT token and a JSON body missing the `title` field, **When** the user sends POST /api/todos, **Then** the system returns 422 with a validation error describing the missing field.
3. **Given** no Authorization header, **When** any user sends POST /api/todos, **Then** the system returns 401 Unauthorized.

---

### User Story 2 - Authenticated User Lists Their Todos (Priority: P1)

A registered user retrieves all of their own todo items. The backend
MUST return only todos belonging to the authenticated user and MUST
NOT expose todos of other users.

**Why this priority**: Listing todos is co-equal with creation as
the primary read operation. User isolation is a security requirement.

**Independent Test**: Create todos for two different users. Request
GET /api/todos with User A's token. Verify only User A's todos are
returned. Repeat with User B's token and verify only User B's todos
are returned.

**Acceptance Scenarios**:

1. **Given** User A has 3 todos and User B has 2 todos, **When** User A sends GET /api/todos with a valid JWT, **Then** the system returns 200 with exactly 3 todos, all belonging to User A.
2. **Given** a user with no todos, **When** the user sends GET /api/todos, **Then** the system returns 200 with an empty list.
3. **Given** an expired JWT token, **When** the user sends GET /api/todos, **Then** the system returns 401 Unauthorized.

---

### User Story 3 - Authenticated User Updates a Todo (Priority: P2)

A registered user updates the title or completion status of one of
their own todos. The backend verifies ownership before allowing the
update.

**Why this priority**: Updating (especially marking complete) is the
second most common action after creation and listing.

**Independent Test**: Create a todo for User A. Send PATCH /api/todos/{id}
with User A's token and `{"is_completed": true}`. Verify the response
reflects the update. Then attempt the same with User B's token and
verify a 404 is returned (ownership isolation).

**Acceptance Scenarios**:

1. **Given** User A owns todo with id=X, **When** User A sends PATCH /api/todos/X with `{"is_completed": true}`, **Then** the system returns 200 with the updated todo showing is_completed=true.
2. **Given** User A owns todo with id=X, **When** User B sends PATCH /api/todos/X, **Then** the system returns 404 Not Found (does not reveal the todo exists to another user).
3. **Given** a non-existent todo id, **When** User A sends PATCH /api/todos/999, **Then** the system returns 404 Not Found.

---

### User Story 4 - Authenticated User Deletes a Todo (Priority: P2)

A registered user deletes one of their own todos. The backend verifies
ownership before allowing deletion.

**Why this priority**: Deletion completes the CRUD lifecycle and
is required for basic usability.

**Independent Test**: Create a todo for User A. Send DELETE /api/todos/{id}
with User A's token. Verify 204 No Content. Confirm the todo no longer
exists in the database. Attempt deletion with User B's token and verify 404.

**Acceptance Scenarios**:

1. **Given** User A owns todo with id=X, **When** User A sends DELETE /api/todos/X, **Then** the system returns 204 No Content and the todo is removed from the database.
2. **Given** User A owns todo with id=X, **When** User B sends DELETE /api/todos/X, **Then** the system returns 404 Not Found.
3. **Given** a non-existent todo id, **When** User A sends DELETE /api/todos/999, **Then** the system returns 404 Not Found.

---

### User Story 5 - Health Check Endpoint (Priority: P3)

An operations engineer or load balancer sends a request to the health
check endpoint to verify the backend is running and can reach the
database.

**Why this priority**: Required for production readiness but does
not deliver direct user value.

**Independent Test**: Send GET /api/health with no authentication.
Verify the response includes `{"status": "healthy"}` and a 200 status
code when the database is reachable.

**Acceptance Scenarios**:

1. **Given** the backend is running and the database is reachable, **When** GET /api/health is sent, **Then** the system returns 200 with `{"status": "healthy"}`.
2. **Given** the database is unreachable, **When** GET /api/health is sent, **Then** the system returns 503 with `{"status": "unhealthy", "detail": "database unreachable"}`.

---

### Edge Cases

- What happens when a JWT is structurally valid but signed with a
  wrong secret? The system MUST return 401 Unauthorized.
- What happens when the `sub` claim in the JWT does not correspond
  to a known user? The system MUST trust the JWT sub claim as the
  user identity (Better Auth is the authority for user identity).
- What happens when two concurrent requests attempt to create todos
  for the same user? Both MUST succeed independently (no race
  condition on user-scoped inserts).
- What happens when the request body exceeds reasonable size? The
  system MUST reject with 422 and a descriptive error.
- What happens when the todo title is an empty string? The system
  MUST reject with 422; titles MUST be at least 1 character.
- What happens when the todo title exceeds 500 characters? The
  system MUST reject with 422.
- What happens when the JWKS endpoint is unreachable? The system
  MUST use the cached JWKS keys (stale cache) to verify tokens.
  If no cached keys exist (e.g., first startup), the system MUST
  return 503 on protected endpoints until keys are fetched.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose RESTful CRUD endpoints for todos at `/api/todos` and `/api/todos/{id}`.
- **FR-002**: System MUST validate JWT Bearer tokens on every protected endpoint using the public key fetched from Better Auth's JWKS endpoint (`/api/auth/jwks`).
- **FR-003**: System MUST extract the user identity (`sub` claim) from the validated JWT and use it to scope all database queries to that user.
- **FR-004**: System MUST enforce per-user task ownership: a user MUST NOT read, update, or delete another user's todos.
- **FR-005**: System MUST return 404 (not 403) when a user attempts to access another user's todo, to prevent information disclosure.
- **FR-006**: System MUST validate all request bodies using Pydantic/SQLModel schemas with explicit constraints (title: 1-500 chars, description: 0-2000 chars optional/nullable, is_completed: boolean).
- **FR-007**: System MUST expose an unauthenticated health check endpoint at GET /api/health that reports backend and database status.
- **FR-008**: System MUST persist all data in Neon Serverless PostgreSQL via SQLModel ORM; no in-memory or file-based storage.
- **FR-009**: System MUST return proper HTTP status codes: 200 (OK), 201 (Created), 204 (No Content), 401 (Unauthorized), 404 (Not Found), 422 (Validation Error), 500 (Internal Server Error), 503 (Service Unavailable).
- **FR-010**: System MUST include `created_at` and `updated_at` timestamps on all todo records, automatically managed.

### Key Entities

- **User**: Represents the authenticated identity derived from the JWT `sub` claim. The backend does NOT manage user registration or credentials. Better Auth on the frontend is the authority. The backend uses the JWT sub claim directly as the user_id to associate todos with owners.
- **Todo**: Represents a task item belonging to a single user. Attributes: id (UUID), title (string, 1-500 chars), description (string, 0-2000 chars, optional/nullable), is_completed (boolean, default false), user_id (string, from JWT sub), created_at (datetime), updated_at (datetime).

## Product Scope

### Responsibilities of the Backend Service

- Validate JWT Bearer tokens on all protected API endpoints.
- Provide RESTful CRUD endpoints for todo items.
- Enforce per-user data isolation at the query level.
- Persist all data in Neon Serverless PostgreSQL via SQLModel.
- Return structured error responses with proper HTTP status codes.
- Expose a health check endpoint for operational monitoring.
- Log all critical flows (auth, API requests, errors).

### Explicit Non-Goals

- The backend does NOT handle user registration, login, or
  password management (Better Auth on the frontend owns this).
- The backend does NOT serve frontend assets or HTML pages.
- The backend does NOT manage frontend sessions or cookies.
- The backend does NOT send emails, notifications, or push messages.
- The backend does NOT implement real-time features (WebSockets, SSE).
- The backend does NOT provide admin endpoints or user management.

## Non-Functional Requirements

### Security

- JWT verification MUST be performed server-side using the public
  key fetched from Better Auth's JWKS endpoint (`/api/auth/jwks`).
  Verification uses RS256 asymmetric algorithm.
- JWKS public keys MUST be cached with a configurable TTL (default
  1 hour) and refreshed in the background. Stale cache MUST serve
  requests if the auth server is temporarily unavailable.
- Token expiry (`exp` claim) MUST be enforced; expired tokens MUST
  be rejected with 401.
- All request inputs MUST be validated via Pydantic/SQLModel schemas.
- SQL injection MUST be prevented through exclusive use of SQLModel
  ORM (no raw SQL).
- CORS MUST be configured to allow only the frontend origin.
- All secrets MUST be loaded from environment variables; none hardcoded.

### Performance

- API endpoints MUST respond within 500ms at p95 under normal load.
- The system MUST support at least 100 concurrent authenticated users.
- Database connections MUST be pooled appropriately for Neon Serverless.

### Error Handling & Reliability

- All API errors MUST return a JSON body with `{"detail": "..."}`.
- Unhandled exceptions MUST be caught by a global exception handler
  that returns 500 with a generic error message (no stack traces in
  production).
- Database connection failures MUST be reported via the health check
  endpoint (503) and logged.

### Observability & Logging

- All API requests MUST be logged with: method, path, status code,
  response time, user identity (if authenticated).
- Auth failures (invalid token, expired token) MUST be logged at
  WARNING level.
- Database errors MUST be logged at ERROR level.
- Structured JSON logging MUST be used.

## API Contract

### Authentication

All endpoints except `GET /api/health` require a valid JWT Bearer
token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

The JWT is issued by Better Auth on the frontend. The backend
validates it using the public key from Better Auth's JWKS endpoint
(`/api/auth/jwks`) with RS256 algorithm. The `sub` claim identifies
the user.

### Endpoints

#### GET /api/health

- **Auth**: None
- **Response 200**: `{"status": "healthy"}`
- **Response 503**: `{"status": "unhealthy", "detail": "database unreachable"}`

#### POST /api/todos

- **Auth**: Required (JWT Bearer)
- **Request Body**:
  ```json
  {
    "title": "string (1-500 chars, required)",
    "description": "string (0-2000 chars, optional, nullable)",
    "is_completed": "boolean (optional, default: false)"
  }
  ```
- **Response 201**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "description": "string or null",
    "is_completed": false,
    "created_at": "2026-02-07T12:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  }
  ```
- **Response 401**: `{"detail": "Could not validate credentials"}`
- **Response 422**: `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}`

#### GET /api/todos

- **Auth**: Required (JWT Bearer)
- **Response 200**:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "description": "string or null",
      "is_completed": false,
      "created_at": "2026-02-07T12:00:00Z",
      "updated_at": "2026-02-07T12:00:00Z"
    }
  ]
  ```
- **Response 401**: `{"detail": "Could not validate credentials"}`

#### PATCH /api/todos/{id}

- **Auth**: Required (JWT Bearer)
- **Request Body** (all fields optional):
  ```json
  {
    "title": "string (1-500 chars, optional)",
    "description": "string (0-2000 chars, optional, nullable)",
    "is_completed": "boolean (optional)"
  }
  ```
- **Response 200**: Updated todo object (same shape as POST response)
- **Response 401**: `{"detail": "Could not validate credentials"}`
- **Response 404**: `{"detail": "Todo not found"}`
- **Response 422**: Validation error

#### DELETE /api/todos/{id}

- **Auth**: Required (JWT Bearer)
- **Response 204**: No content
- **Response 401**: `{"detail": "Could not validate credentials"}`
- **Response 404**: `{"detail": "Todo not found"}`

## Data Model

### User (derived from JWT)

| Field | Type   | Description                                |
|-------|--------|--------------------------------------------|
| id    | String | From JWT `sub` claim (Better Auth user ID) |

The backend does NOT maintain a full user table. User identity is
derived from the JWT `sub` claim on every request. Todos reference
the user_id field directly.

### Todo

| Field        | Type     | Constraints                               |
|--------------|----------|-------------------------------------------|
| id           | UUID     | Primary key, auto-generated               |
| title        | String   | 1-500 characters, required                |
| description  | String   | 0-2000 characters, optional (nullable)    |
| is_completed | Boolean  | Default: false                            |
| user_id      | String   | From JWT sub, indexed, required           |
| created_at   | DateTime | Auto-set on creation                      |
| updated_at   | DateTime | Auto-set on creation and update           |

### Ownership Model

- Every todo has a `user_id` field set to the authenticated user's
  JWT `sub` claim at creation time.
- All read, update, and delete queries MUST filter by both `todo.id`
  AND `todo.user_id = current_user_id`.
- If no matching record is found, return 404 (never 403, to prevent
  information disclosure).

## Failure Modes

| Failure                      | HTTP Status                  | Response Body                                    | Logging       |
|------------------------------|------------------------------|--------------------------------------------------|---------------|
| Missing JWT                  | 401                          | `{"detail": "Not authenticated"}`                | WARNING       |
| Invalid JWT signature        | 401                          | `{"detail": "Could not validate credentials"}`   | WARNING       |
| Expired JWT                  | 401                          | `{"detail": "Token has expired"}`                | WARNING       |
| Malformed JWT                | 401                          | `{"detail": "Could not validate credentials"}`   | WARNING       |
| Todo not found / not owned   | 404                          | `{"detail": "Todo not found"}`                   | INFO          |
| Validation error             | 422                          | FastAPI default validation error format           | INFO          |
| Database unreachable         | 503 (health) / 500 (other)   | `{"detail": "..."}`                              | ERROR         |
| Unhandled exception          | 500                          | `{"detail": "Internal server error"}`            | ERROR + trace |

## Assumptions & Constraints

### Assumptions

- Better Auth issues JWTs with at minimum `sub` (user ID) and `exp`
  (expiration) claims.
- The JWT signing algorithm is RS256 (asymmetric). The backend
  fetches the public key from Better Auth's JWKS endpoint
  (`/api/auth/jwks`) to verify tokens. No shared secret is
  needed for JWT verification.
- The frontend sends the JWT as a Bearer token in the Authorization
  header on every API request.
- BETTER_AUTH_URL environment variable MUST be provided to configure
  the JWKS endpoint URL (e.g., `https://frontend.example.com`).
- Neon Serverless PostgreSQL is accessible from the backend
  deployment environment.
- The backend does not need to manage user lifecycle (registration,
  deletion) — Better Auth is the authority.

### Constraints

- BETTER_AUTH_URL MUST be provided via environment variable to
  locate the JWKS endpoint for JWT verification.
- DATABASE_URL MUST be provided via environment variable pointing
  to Neon Serverless PostgreSQL.
- No in-memory or file-based persistence; all data in PostgreSQL.
- No mock authentication; JWT validation is always enforced.
- UV MUST be used for Python dependency management.
- Alembic MUST be used for database schema migrations. Migrations
  MUST be auto-generated from SQLModel model changes and version-
  controlled in the repository.
- All library usage (FastAPI, SQLModel, PyJWT) MUST be verified
  against current documentation via Context7 MCP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create, read, update, and delete their own todos via the API within 500ms per request at p95.
- **SC-002**: No user can access, modify, or delete another user's todos under any circumstances (100% user isolation).
- **SC-003**: All requests with invalid, expired, or missing JWT tokens are rejected with 401 within 50ms.
- **SC-004**: The system handles at least 100 concurrent authenticated users without degradation.
- **SC-005**: The health check endpoint accurately reports system status (healthy/unhealthy) within 200ms.
- **SC-006**: All API errors return structured JSON responses with appropriate HTTP status codes (no HTML error pages or stack traces).
