---
id: 003
title: Spec Clarification Review
stage: spec
date: 2026-02-07
surface: agent
model: claude-opus-4-6
feature: 001-todo-backend-api
branch: 001-todo-backend-api
user: Ayyan
command: /sp.clarify
labels: ["clarification", "jwt", "jwks", "alembic", "caching"]
links:
  spec: specs/001-todo-backend-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-backend-api/spec.md
tests:
---

## Prompt

You are a senior backend engineer performing a specification quality review. Review the backend specification and identify ambiguities, missing details, or risky assumptions. Propose clarifications for JWT token structure, user identity extraction, error response format, task ownership enforcement strategy, and database migration strategy.

## Response snapshot

Identified 3 high-impact clarification points through structured ambiguity scan. All 3 resolved interactively:

1. JWT Verification Method: Changed from HS256 with shared BETTER_AUTH_SECRET to JWKS-based RS256 verification via Better Auth's `/api/auth/jwks` endpoint. Updated FR-002, Security section, API Contract authentication, Assumptions, and Constraints. Added BETTER_AUTH_URL env var requirement.

2. Database Migration Strategy: Alembic selected as the migration tool. Added to Constraints section.

3. JWKS Key Caching Strategy: Cache with configurable TTL (1 hour default) and background refresh. Stale cache serves requests during auth server downtime. Added to Security section and Edge Cases.

## Outcome

- Impact: Resolved 3 critical ambiguities that would have caused implementation rework or security vulnerabilities
- Tests: N/A (specification refinement)
- Files: specs/001-todo-backend-api/spec.md (updated — 7 sections modified)
- Next prompts: /sp.plan (recommended next step)
- Reflection: The HS256 vs JWKS discovery was the highest-impact finding — Better Auth's documented default is JWKS/RS256, not HS256. Without this clarification, the backend implementation would have used the wrong verification method.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All 3 clarifications integrated and validated PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
