<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
  Modified principles: N/A (initial creation)
  Added sections:
    - Core Principles (7 principles)
    - Constraints & Security Requirements
    - Development Workflow & Quality Gates
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check section is generic)
    - .specify/templates/spec-template.md ✅ no changes needed (template is domain-agnostic)
    - .specify/templates/tasks-template.md ✅ no changes needed (phase structure accommodates all principle-driven task types)
    - .specify/templates/checklist-template.md ✅ no changes needed (generic template)
    - .specify/templates/agent-file-template.md ✅ no changes needed (populated per feature)
  Follow-up TODOs: None
-->
# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Determinism Over Improvisation

All architectural and tooling choices MUST be explicit and justified.
No library, framework, or integration pattern may be introduced without
documented rationale. Every technical decision MUST reference verified,
up-to-date documentation (via Context7 MCP or official sources).
Internal knowledge assumptions are NOT acceptable as the sole basis
for implementation decisions.

### II. Security-First Design

Authentication, authorization, and user isolation are mandatory at
every layer — they are NOT optional enhancements.

- JWT-based authentication MUST be enforced on every backend endpoint.
- User isolation MUST be enforced at the database query level; no
  cross-user data leakage is permitted.
- Token expiry MUST be validated server-side in FastAPI.
- Input validation MUST exist on all API endpoints.
- SQL injection protection MUST rely on ORM usage only (SQLModel).
- CORS configuration MUST be explicit and restrictive.
- Secrets MUST NEVER be hardcoded; all secrets are provided via
  environment variables.

### III. Non-Hallucination

Only real, verified libraries, APIs, and frameworks may be used.

- All library APIs and integration patterns MUST be verified against
  current documentation using Context7 MCP before implementation.
- No invented, deprecated, or undocumented APIs are permitted.
- CLI commands and framework features MUST be validated externally
  before being used in implementation or documentation.

### IV. Separation of Concerns

Frontend, backend, auth, database, and tooling MUST be cleanly
decoupled.

- Frontend (Next.js 16+ App Router) handles UI and auth flows via
  Better Auth. No direct database access from frontend.
- Backend (Python FastAPI) owns all business logic, organized in
  clean service layers: routers, services, repositories.
- Database (Neon Serverless PostgreSQL) is the sole persistence layer.
  All access goes through SQLModel ORM.
- Auth boundary: Better Auth manages sessions on the frontend;
  FastAPI validates JWT tokens independently using the shared
  BETTER_AUTH_SECRET. No coupling between frontend session storage
  and backend state (stateless JWT only).
- Dependency injection MUST be used for auth verification and DB
  sessions in FastAPI.

### V. Reproducibility

The entire system MUST be reproducible from a fresh machine using
documented setup.

- UV MUST be used for Python environment and dependency management.
- All dependencies MUST be pinned and documented.
- Environment variables MUST be documented (with example `.env`
  templates, never containing real secrets).
- Setup steps MUST be captured in documentation or scripts that
  allow zero-ambiguity reproduction.

### VI. Observability

All critical flows MUST be logged and traceable.

- Auth events (login, logout, token validation failures) MUST be
  logged.
- API calls MUST be logged with request context (method, path,
  user identity, status code).
- Database operations MUST be traceable for debugging.
- Structured logging MUST be used throughout the backend.
- Error responses MUST include sufficient context for debugging
  without leaking sensitive information.

### VII. Production Realism

No demo-only shortcuts, mock auth, or in-memory persistence are
permitted.

- Neon Serverless PostgreSQL is the ONLY persistence layer; no
  in-memory or file-based persistence.
- Authentication MUST use real JWT flows; no mock auth or bypass
  mechanisms.
- All API responses MUST use proper HTTP status codes (401, 403,
  404, 422, 500).
- Request/response schemas MUST be defined using Pydantic/SQLModel.
- Rate limiting strategy MUST be defined or planned.

## Constraints & Security Requirements

### Technology Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | Next.js 16+ (App Router)         |
| Auth (FE)     | Better Auth                       |
| Backend       | Python FastAPI                    |
| ORM           | SQLModel                          |
| Database      | Neon Serverless PostgreSQL        |
| Tooling       | UV (Python env/deps)              |
| Verification  | Context7 MCP, Playwright MCP     |

### Security Constraints

- BETTER_AUTH_SECRET MUST be shared between frontend and backend
  for JWT verification.
- JWT tokens MUST include user identity and expiry claims.
- All endpoints MUST reject unauthenticated requests with
  `401 Unauthorized`.
- No direct database access from the frontend.
- No undocumented or deprecated APIs.
- No "temporary" shortcuts that bypass authentication or
  authorization.
- No coupling between frontend auth session storage and backend
  session state.

### Data Constraints

- All user todos MUST be stored in Neon Serverless PostgreSQL.
- SQLModel ORM MUST be used for all database interactions.
- Migrations strategy MUST be documented.
- No in-memory or file-based persistence.

## Development Workflow & Quality Gates

### API Design Standards

- RESTful endpoints using FastAPI.
- Proper HTTP status codes: 401, 403, 404, 422, 500.
- Request/response schemas defined via Pydantic/SQLModel.
- Every API request MUST validate JWT and enforce task ownership.

### Testing Requirements

- Unit tests MUST cover business logic.
- Integration tests MUST cover API endpoints with JWT auth.
- Auth failure cases MUST be tested:
  - Expired token
  - Invalid token
  - Missing token
- Tests MUST be structured under `tests/` with clear separation
  (unit, integration, contract).

### Code Quality

- Code MUST be typed (Python type hints, TypeScript strict mode).
- Code MUST be structured following separation of concerns
  (routers, services, repositories).
- Smallest viable diff: do not refactor unrelated code.
- No hardcoded secrets; all via environment variables.

## Governance

This constitution is the authoritative source for all architectural
and quality decisions in the Todo Full-Stack Web Application project.

- **Supremacy**: This constitution supersedes all other practices.
  All PRs, code reviews, and design decisions MUST verify
  compliance with these principles.
- **Amendment process**: Any amendment MUST be documented with
  rationale, approved by the project owner, and include a
  migration plan for affected artifacts.
- **Versioning**: Constitution versions follow semantic versioning:
  - MAJOR: Backward-incompatible principle removals or redefinitions.
  - MINOR: New principles added or existing ones materially expanded.
  - PATCH: Clarifications, wording fixes, non-semantic refinements.
- **Compliance review**: Every spec, plan, and task list MUST
  include a Constitution Check gate verifying alignment with
  these principles before implementation proceeds.
- **Complexity justification**: Any deviation from simplicity MUST
  be explicitly justified in a Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
