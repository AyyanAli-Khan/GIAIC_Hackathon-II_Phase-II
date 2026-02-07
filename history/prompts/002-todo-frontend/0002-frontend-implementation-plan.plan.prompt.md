---
id: 0002
title: Frontend Implementation Plan
stage: plan
date: 2026-02-07
surface: agent
model: claude-opus-4-6
feature: 002-todo-frontend
branch: 002-todo-frontend
user: Ayyan
command: /sp.plan
labels: ["planning", "frontend", "architecture", "next.js", "react-query", "better-auth", "tailwind"]
links:
  spec: ../spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-todo-frontend/plan.md
  - specs/002-todo-frontend/research.md
  - specs/002-todo-frontend/data-model.md
  - specs/002-todo-frontend/quickstart.md
  - specs/002-todo-frontend/contracts/api-client.ts
  - specs/002-todo-frontend/contracts/react-query-hooks.ts
tests:
  - N/A (planning phase - no tests implemented yet)
---

## Prompt

```
/sp.plan

You are a Principal Frontend Architect.

Based on the finalized frontend specification and clarifications, produce an implementation plan including:

1. Application Architecture:
   - High-level Next.js App Router structure
   - Public vs authenticated route boundaries
   - Layout and page composition strategy

2. Component Architecture:
   - Core UI components (task list, task item, forms, auth UI)
   - Shared UI primitives (buttons, modals, loaders, empty states)

3. State Management & Data Flow:
   - Auth state flow
   - API data fetching strategy
   - Error and loading state propagation

4. Auth Integration Plan:
   - Better Auth integration flow
   - JWT acquisition and request attachment strategy
   - Session expiry and logout flows

5. UX & Visual System:
   - Design system principles
   - Responsive layout strategy
   - Accessibility plan

6. API Integration Strategy:
   - How frontend calls FastAPI endpoints
   - Error handling and retries
   - Mapping backend errors to user-friendly messages

7. Too [truncated by user]
```

## Response snapshot

**Phase 0: Research** (completed via agent)
- Verified Next.js 16 App Router best practices (QueryClient singleton pattern, SSR considerations)
- Researched JWT expiration best practices → Decision: 15 min access tokens, 7 days refresh tokens
- Verified React Query v5 API for optimistic updates and parallel mutations
- Researched Better Auth integration patterns (nextCookies plugin, client-side hooks, middleware)
- Verified Tailwind CSS 4 stability and Next.js 16 compatibility
- Researched navy blue design system with complementary colors

**Phase 1: Design & Contracts** (completed)
- Created data-model.md: User, Todo, TodoListState entities with TypeScript interfaces, state transitions, API mapping
- Created contracts/api-client.ts: Type-safe API client with JWT attachment, error handling, validation parsing
- Created contracts/react-query-hooks.ts: React Query hooks with optimistic updates, rollback, parallel mutations
- Created quickstart.md: Step-by-step setup guide, project structure, development workflow, troubleshooting

**plan.md Sections**:
- Summary: Primary requirement + technical approach from research
- Technical Context: TypeScript, Next.js 16, TanStack Query, Better Auth, Tailwind CSS 4
- Constitution Check: 6/7 full pass, 1 partial (production logging TBD) - GATE PASSED
- Project Structure: Web application (frontend + backend), Next.js App Router structure
- Application Architecture: Route flow, public vs authenticated boundaries, layout composition
- Component Architecture: TodoList, TodoItem, TodoForm, TodoEditForm, shared UI primitives
- State Management & Data Flow: Auth state via Better Auth, server state via React Query, optimistic updates
- Auth Integration Plan: Better Auth setup, JWT acquisition, session expiry handling
- UX & Visual System: Navy blue theme, responsive breakpoints, WCAG AA accessibility
- API Integration Strategy: Endpoint mapping, error categorization, retry logic
- Implementation Phases: Phase 0/1 complete, Phase 2 next (Red-Green-Refactor)
- Success Metrics: 6 measurable outcomes from spec + additional plan metrics

## Outcome

- ✅ Impact: Comprehensive implementation plan ready for `/sp.tasks` - all architectural decisions documented with rationale, contracts and API client code provided, quickstart guide complete
- 🧪 Tests: N/A (planning phase)
- 📁 Files: 6 files created (plan.md, research.md, data-model.md, quickstart.md, api-client.ts, react-query-hooks.ts)
- 🔁 Next prompts: `/sp.tasks` to generate tasks.md with Red-Green-Refactor phases, then `/sp.implement` to execute
- 🧠 Reflection: Research agent successfully resolved all [NEEDS CLARIFICATION] markers from spec (JWT expiry, state library, color palette). Plan is production-ready with verified integrations, type-safe contracts, and comprehensive architecture guidance.

## Evaluation notes (flywheel)

- Failure modes observed: None - all research queries returned verified documentation from Context7 MCP
- Graders run and results (PASS/FAIL): Constitution Check PASS (6/7 full, 1 partial with completion plan)
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): N/A
