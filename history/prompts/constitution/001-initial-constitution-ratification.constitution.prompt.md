---
id: 001
title: Initial Constitution Ratification
stage: constitution
date: 2026-02-07
surface: agent
model: claude-opus-4-6
feature: none
branch: master
user: Ayyan
command: /sp.constitution
labels: ["constitution", "governance", "initial-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
---

## Prompt

Project: Todo Full-Stack Web Application (Multi-User, Secure, Production-Grade)

Core Principles:
- Determinism over improvisation: All architectural and tooling choices must be explicit and justified.
- Security-first design: Authentication, authorization, and user isolation are mandatory, not optional.
- Non-hallucination: Only real, verified libraries, APIs, and frameworks may be used.
- Separation of concerns: Frontend, backend, auth, database, and AI tooling must be cleanly decoupled.
- Reproducibility: The entire system must be reproducible from a fresh machine using documented setup.
- Observability: All critical flows (auth, API calls, DB operations) must be logged and traceable.
- Production realism: No demo-only shortcuts, mock auth, or in-memory persistence.

Key Standards:
- API Design:
  - RESTful endpoints using FastAPI
  - Proper HTTP status codes (401, 403, 404, 422, 500)
  - Request/response schemas defined using Pydantic/SQLModel
- Authentication & Authorization:
  - Better Auth on Next.js frontend
  - JWT-based authentication between frontend (better-auth) and FastAPI backend
  - Every API request must validate JWT and enforce task ownership
  - User isolation enforced at query level (no cross-user data leakage)
- Database:
  - Neon Serverless PostgreSQL as the only persistence layer
  - SQLModel ORM with migrations strategy documented
  - All the user todo's should be store in our PostgreSQL Database
  - No in-memory or file-based persistence
- Frontend:
  - Next.js 16+ App Router
  - Responsive UI
  - Auth flows handled via Better Auth
- Backend:
  - Python FastAPI
  - Clean service layers (routers, services, repositories)
  - Dependency injection for auth verification and DB sessions
- Tooling & Documentation:
  - UV for Python environment and dependency management
  - Context7 MCP must be used to verify up-to-date library APIs and integration details
  - Playwright MCP may be used to verify frontend or external documentation flows
- Testing:
  - Unit tests for business logic
  - Integration tests for API endpoints with JWT auth
  - Auth failure cases must be tested (expired token, invalid token, missing token)

Constraints:
- No hardcoded secrets; all secrets must be provided via environment variables
- BETTER_AUTH_SECRET must be shared between frontend and backend for JWT verification
- JWT tokens must include user identity and expiry
- All endpoints must reject unauthenticated requests with 401 Unauthorized
- No direct database access from frontend
- No undocumented or deprecated APIs
- No "temporary" shortcuts that bypass authentication or authorization
- No coupling between frontend auth session storage and backend session state (stateless JWT only)

Security Requirements:
- JWT verification must be implemented server-side in FastAPI
- Token expiry must be enforced
- Input validation on all API endpoints
- SQL injection protection via ORM usage only
- CORS configuration must be explicit
- Rate limiting strategy must be defined or planned

Quality Gates:
- Code must be typed and structured

## Response snapshot

Created the project constitution v1.0.0 for the Todo Full-Stack Web Application. The constitution defines 7 core principles (Determinism, Security-First, Non-Hallucination, Separation of Concerns, Reproducibility, Observability, Production Realism), plus sections for Constraints & Security Requirements, Development Workflow & Quality Gates, and Governance. All placeholders were resolved. Technology stack codified: Next.js 16+ / Better Auth / FastAPI / SQLModel / Neon PostgreSQL / UV. Sync Impact Report confirms all templates are compatible with no updates needed.

## Outcome

- Impact: Initial constitution ratified — establishes governance foundation for all future specs, plans, and tasks
- Tests: N/A (governance artifact)
- Files: .specify/memory/constitution.md (created)
- Next prompts: /sp.specify to create feature specification, /sp.plan to create implementation plan
- Reflection: User provided comprehensive input covering all 7 principles plus detailed standards, constraints, and security requirements. No clarification needed.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS — no unresolved placeholders, version matches report, dates ISO format, principles are declarative and testable
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
