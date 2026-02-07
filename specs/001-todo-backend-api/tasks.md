# Tasks: Todo Backend API

**Input**: Design documents from `/specs/001-todo-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml

**Tests**: The spec requires unit tests for business logic, integration tests for API endpoints with JWT auth, and auth failure case tests. Test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project directory structure per plan.md layout in backend/
- [X] T002 Initialize Python project with UV: create backend/pyproject.toml with all dependencies (fastapi, uvicorn, sqlmodel, pyjwt[crypto], alembic, psycopg2-binary, python-dotenv, structlog, httpx, pytest, pytest-asyncio)
- [X] T003 [P] Create backend/.env.example with DATABASE_URL, BETTER_AUTH_URL, CORS_ORIGINS, LOG_LEVEL, JWKS_CACHE_TTL placeholders
- [X] T004 [P] Create backend/app/config.py with Settings class loading all environment variables (DATABASE_URL, BETTER_AUTH_URL, CORS_ORIGINS, LOG_LEVEL, JWKS_CACHE_TTL) using python-dotenv

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create backend/app/database.py with SQLModel engine (from DATABASE_URL), Session factory, and `get_session` dependency using `yield` pattern
- [X] T006 Create backend/app/models/todo.py with Todo SQLModel table (id UUID PK, title VARCHAR 500, description VARCHAR 2000 nullable, is_completed boolean default false, user_id VARCHAR 255 indexed, created_at/updated_at timestamps) and TodoCreate, TodoUpdate, TodoPublic schema classes
- [X] T007 Initialize Alembic in backend/alembic/ with env.py configured to use SQLModel.metadata and DATABASE_URL from environment
- [X] T008 Generate initial Alembic migration for the todo table in backend/alembic/versions/
- [X] T009 Create backend/app/auth/__init__.py and backend/app/auth/dependencies.py with JWT verification dependency: initialize PyJWKClient with BETTER_AUTH_URL/api/auth/jwks (cache_jwk_set=True, lifespan from JWKS_CACHE_TTL), get_signing_key_from_jwt, jwt.decode with RS256, extract sub claim, raise HTTPException(401) on failure
- [X] T010 Create backend/app/main.py with FastAPI app factory, CORSMiddleware (origins from CORS_ORIGINS env var), structured JSON logging middleware (method, path, status, duration, user_id), global exception handler (500 with generic message, no stack trace), and router includes
- [X] T011 [P] Create backend/app/repositories/__init__.py and backend/app/repositories/todo_repository.py with TodoRepository class: all queries scoped by user_id (create, list_by_user, get_by_id_and_user, update, delete)
- [X] T012 [P] Create backend/app/services/__init__.py and backend/app/services/todo_service.py with TodoService class: create_todo, list_todos, update_todo, delete_todo — all accepting user_id, raising HTTPException(404) for not-found/not-owned
- [X] T013 Create backend/tests/conftest.py with pytest fixtures: test database session (SQLite or test PostgreSQL), FastAPI TestClient, JWT token helper (generate valid/expired/invalid test tokens using RSA key pair)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Create Todo (Priority: P1)

**Goal**: Authenticated user can create a todo with title and optional description

**Independent Test**: POST /api/todos with valid JWT returns 201 with created todo

### Tests for User Story 1

- [X] T014 [P] [US1] Write integration test for POST /api/todos in backend/tests/integration/test_todos_crud.py: test create with title only (201, description=null), create with title+description (201), missing title (422), empty title (422), title >500 chars (422), no auth header (401)

### Implementation for User Story 1

- [X] T015 [US1] Create backend/app/routers/todos.py with POST /api/todos endpoint: accept TodoCreate body, call get_current_user dependency, call TodoService.create_todo with user_id, return 201 with TodoPublic response
- [X] T016 [US1] Register todos router in backend/app/main.py under /api prefix

**Checkpoint**: User Story 1 independently testable — POST /api/todos creates todos for authenticated users

---

## Phase 4: User Story 2 — List Todos (Priority: P1)

**Goal**: Authenticated user lists only their own todos (user isolation)

**Independent Test**: GET /api/todos returns only the authenticated user's todos, never another user's

### Tests for User Story 2

- [X] T017 [P] [US2] Write integration test for GET /api/todos in backend/tests/integration/test_todos_crud.py: test list returns only own todos (create for 2 users, verify isolation), empty list for user with no todos (200, []), expired token (401)

### Implementation for User Story 2

- [X] T018 [US2] Add GET /api/todos endpoint to backend/app/routers/todos.py: call get_current_user dependency, call TodoService.list_todos with user_id, return 200 with list of TodoPublic

**Checkpoint**: User Stories 1 AND 2 both work — create and list todos with full user isolation

---

## Phase 5: User Story 3 — Update Todo (Priority: P2)

**Goal**: Authenticated user updates title, description, or completion status of their own todo

**Independent Test**: PATCH /api/todos/{id} with owner's token returns 200; with non-owner's token returns 404

### Tests for User Story 3

- [X] T019 [P] [US3] Write integration test for PATCH /api/todos/{id} in backend/tests/integration/test_todos_crud.py: test update is_completed (200), update title (200), update description (200), non-owner gets 404, non-existent id gets 404, invalid body (422)

### Implementation for User Story 3

- [X] T020 [US3] Add PATCH /api/todos/{id} endpoint to backend/app/routers/todos.py: accept TodoUpdate body and UUID path param, call get_current_user dependency, call TodoService.update_todo with user_id + todo_id, return 200 with updated TodoPublic or 404

**Checkpoint**: User Stories 1, 2, AND 3 work — create, list, and update with ownership enforcement

---

## Phase 6: User Story 4 — Delete Todo (Priority: P2)

**Goal**: Authenticated user deletes their own todo

**Independent Test**: DELETE /api/todos/{id} with owner's token returns 204; with non-owner's token returns 404

### Tests for User Story 4

- [X] T021 [P] [US4] Write integration test for DELETE /api/todos/{id} in backend/tests/integration/test_todos_crud.py: test delete own todo (204, confirm gone), non-owner gets 404, non-existent id gets 404

### Implementation for User Story 4

- [X] T022 [US4] Add DELETE /api/todos/{id} endpoint to backend/app/routers/todos.py: accept UUID path param, call get_current_user dependency, call TodoService.delete_todo with user_id + todo_id, return 204 or 404

**Checkpoint**: Full CRUD operational — create, list, update, delete with ownership enforcement

---

## Phase 7: User Story 5 — Health Check (Priority: P3)

**Goal**: Unauthenticated health check endpoint reports backend and database status

**Independent Test**: GET /api/health returns 200 with {"status": "healthy"} when DB reachable

### Tests for User Story 5

- [X] T023 [P] [US5] Write integration test for GET /api/health in backend/tests/integration/test_health.py: test healthy response (200), no auth required

### Implementation for User Story 5

- [X] T024 [US5] Create backend/app/routers/health.py with GET /api/health endpoint: attempt DB connection via get_session, return 200 {"status": "healthy"} or 503 {"status": "unhealthy", "detail": "database unreachable"}
- [X] T025 [US5] Register health router in backend/app/main.py under /api prefix

**Checkpoint**: All user stories independently functional

---

## Phase 8: Auth Failure Tests (Cross-Cutting)

**Purpose**: Verify all auth failure scenarios per spec Failure Modes table

- [X] T026 [P] Write auth failure integration tests in backend/tests/integration/test_auth.py: test missing JWT (401), invalid JWT signature (401), expired JWT (401), malformed JWT (401) — against all protected endpoints

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T027 [P] Write unit tests for TodoService in backend/tests/unit/test_todo_service.py: test create, list, update (ownership check), delete (ownership check), not-found cases
- [X] T028 [P] Verify structured JSON logging outputs correct fields (method, path, status, duration, user_id) by reviewing backend/app/main.py logging middleware
- [X] T029 Run all tests with `uv run pytest tests/ -v` and verify all pass
- [X] T030 Run quickstart.md validation: follow setup steps from specs/001-todo-backend-api/quickstart.md on a clean environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Phase 3) and US2 (Phase 4) can proceed in parallel after Phase 2
  - US3 (Phase 5) can proceed in parallel with US1/US2 (independent endpoint)
  - US4 (Phase 6) can proceed in parallel with US3 (independent endpoint)
  - US5 (Phase 7) can proceed in parallel with all other stories (no dependencies)
- **Auth Tests (Phase 8)**: Depends on at least one protected endpoint being implemented (Phase 3+)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Tests MUST be written FIRST and FAIL before implementation
- Implementation tasks follow dependency order: service → router → integration
- Story complete before moving to next priority (for sequential execution)

### Parallel Opportunities

- T003 + T004 can run in parallel (different files)
- T011 + T012 can run in parallel (repository and service are separate files)
- All test tasks marked [P] within different stories can run in parallel
- Once Foundational phase completes, ALL user stories (Phase 3-7) can start in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Create Todo)
4. Complete Phase 4: User Story 2 (List Todos)
5. **STOP and VALIDATE**: Test create + list with user isolation
6. Deploy/demo if ready — this is the MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test → MVP increment
3. Add US2 (List) → Test → MVP with read capability
4. Add US3 (Update) → Test → Full edit support
5. Add US4 (Delete) → Test → Full CRUD
6. Add US5 (Health) → Test → Production-ready
7. Auth tests + Polish → Hardened and validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
