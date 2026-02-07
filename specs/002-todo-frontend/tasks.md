# Implementation Tasks: Todo Frontend Web Application

**Branch**: `002-todo-frontend` | **Date**: 2026-02-07
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Overview

This tasks file organizes implementation by **user story** to enable independent, incremental delivery. Each user story phase is a complete, testable increment that delivers value.

**Implementation Strategy**: MVP-first with incremental story delivery
- **MVP = User Story 1** (P1: Sign Up and Create First Todo)
- **Post-MVP** = User Stories 2, 3, 5, 4 (in priority order)

**Parallel Execution**: Tasks marked `[P]` can run in parallel within each phase (different files, no dependencies).

**Total Task Count**: 47 tasks across 7 phases

---

## Task Format

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential (T001, T002...)
- **[P]**: Parallelizable (optional marker)
- **[Story]**: User story label (e.g., [US1], [US2]) - ONLY for user story phases
- **Description**: Clear action with exact file path

---

## Dependency Graph: User Story Completion Order

```
Phase 1: Setup (T001-T003)
  ↓
Phase 2: Foundational (T004-T015)
  ↓
Phase 3: User Story 1 [US1] (T016-T026) ← MVP MILESTONE
  ↓
Phase 4: User Story 2 [US2] (T027-T031) ← Can start after US1 complete
  ↓
Phase 5: User Story 3 [US3] (T032-T034) ← Depends on US2 (needs edit/toggle features)
  ↓
Phase 6: User Story 5 [US5] (T035-T037) ← Can run in parallel with US3
  ↓
Phase 7: User Story 4 [US4] (T038-T041) ← Depends on all CRUD features (US1, US2, US3)
  ↓
Phase 8: Polish & Cross-Cutting (T042-T047)
```

**Independent Stories**: US5 (Session Recovery) can run in parallel with US3 (Delete)
**Dependent Stories**: US4 (Filter/Sort) requires all CRUD features (US1, US2, US3)

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize Next.js 16 project with TypeScript, Tailwind CSS 4, and core dependencies.

**Tasks**:

- [X] T001 Create Next.js 16 project with TypeScript and Tailwind CSS using create-next-app in frontend/
- [X] T002 Install core dependencies: @tanstack/react-query, better-auth, sonner, react-hook-form, zod in frontend/package.json
- [X] T003 Create environment variables template in frontend/.env.example with NEXT_PUBLIC_BACKEND_API_URL, NEXT_PUBLIC_APP_URL, BETTER_AUTH_SECRET, DATABASE_URL

**Validation**: `npm run build` succeeds, TypeScript compiles without errors, Tailwind CSS configured.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Set up infrastructure needed by ALL user stories - auth config, API client, providers, UI primitives, routing structure.

**Independent Test Criteria**:
- Better Auth server and client configured successfully
- React Query provider renders without errors
- API client can attach JWT to requests (unit test)
- Middleware redirects unauthenticated users to /signin
- Shared UI components render correctly (Storybook or manual test)

**Tasks**:

### Auth Configuration

- [X] T004 [P] Configure Better Auth server in frontend/lib/auth.ts with session expiration (7 days), updateAge (1 day), nextCookies plugin
- [X] T005 [P] Configure Better Auth client in frontend/lib/auth-client.ts with jwtClient plugin
- [X] T006 Create middleware in frontend/middleware.ts for route protection (redirect unauthenticated to /signin, authenticated away from auth pages)

### API Integration

- [X] T007 [P] Copy type-safe API client from specs/002-todo-frontend/contracts/api-client.ts to frontend/lib/api/api-client.ts
- [X] T008 [P] Copy React Query hooks from specs/002-todo-frontend/contracts/react-query-hooks.ts to frontend/lib/api/react-query-hooks.ts

### Providers & Layout

- [X] T009 Create React Query providers in frontend/app/providers.tsx with QueryClient singleton pattern (server vs client)
- [X] T010 Update root layout in frontend/app/layout.tsx to wrap children with Providers and Toaster

### Tailwind Configuration

- [X] T011 Configure Tailwind theme in frontend/app/globals.css with navy blue color palette (primary #1E3A8A, accent teal/green, neutrals, semantic colors) using @theme directive
- [X] T012 Update global styles in frontend/app/globals.css with Tailwind directives and base layer customizations

### Shared UI Primitives

- [X] T013 [P] Create Button component in frontend/components/ui/Button.tsx with variants (primary, secondary, danger), states (default, hover, disabled, loading)
- [X] T014 [P] Create Input component in frontend/components/ui/Input.tsx with label, error state, and variants (text, textarea)
- [X] T015 [P] Create Card component in frontend/components/ui/Card.tsx with white background, shadow, rounded corners

**Validation**: Run `npm run dev`, navigate to `/`, middleware redirects work, no console errors.

---

## Phase 3: User Story 1 [US1] - Sign Up and Create First Todo (Priority: P1) ← MVP

**Goal**: New user can sign up, be redirected to dashboard, create first todo, logout, sign back in, and see persisted todo.

**Independent Test Criteria**:
- ✅ User completes signup with valid email/password → redirected to /dashboard
- ✅ Authenticated user on dashboard can enter "Buy milk" → todo appears in list with is_completed=false
- ✅ User logs out, signs back in → sees previously created todo
- ✅ Complete flow < 90 seconds (SC-001)

**Acceptance Scenarios** (from spec.md):
1. Visitor on homepage → click "Sign Up" → submit valid credentials → redirect to /dashboard with empty list
2. Authenticated user with no todos → enter "Buy milk" → todo appears with is_completed=false
3. User with one todo → logout → sign back in → see previously created todo

**Tasks**:

### Landing Page (Public)

- [X] T016 [P] [US1] Create public landing page in frontend/app/page.tsx with hero section, "Sign Up" CTA, "Sign In" CTA

### Auth Pages

- [X] T017 [P] [US1] Create auth route group in frontend/app/(auth)/layout.tsx
- [X] T018 [P] [US1] Create signup page in frontend/app/(auth)/signup/page.tsx with SignUpForm component
- [X] T019 [P] [US1] Create signin page in frontend/app/(auth)/signin/page.tsx with SignInForm component

### Auth Components

- [X] T020 [P] [US1] Create SignUpForm component in frontend/components/auth/SignUpForm.tsx using Better Auth signUp(), React Hook Form, Zod validation (email format, password min 8 chars)
- [X] T021 [P] [US1] Create SignInForm component in frontend/components/auth/SignInForm.tsx using Better Auth signIn(), React Hook Form, Zod validation

### Dashboard & Todo Create

- [X] T022 [US1] Create dashboard page in frontend/app/dashboard/page.tsx with auth guard (useSession hook, redirect if unauthenticated)
- [X] T023 [P] [US1] Create TodoForm component in frontend/components/todos/TodoForm.tsx with title (required, 1-500 chars), description (optional, 0-2000 chars), is_completed checkbox, useCreateTodo mutation with optimistic update
- [X] T024 [P] [US1] Create TodoList component in frontend/components/todos/TodoList.tsx using useTodos hook, loading skeleton, empty state, error handling
- [X] T025 [P] [US1] Create TodoItem component in frontend/components/todos/TodoItem.tsx with checkbox, title, description, edit/delete buttons (edit/delete disabled in US1, enabled in US2)
- [X] T026 [P] [US1] Create EmptyState component in frontend/components/ui/EmptyState.tsx with illustration, "No tasks yet!" heading, "Add your first todo above" description

**Validation**:
- Manual E2E test: Sign up → create todo → logout → sign in → verify todo persists
- Dashboard loads with todos in < 2 seconds (SC-002)
- Optimistic create: todo appears immediately < 100ms (SC-003)

**Parallel Opportunities**: T016-T021 can run in parallel (independent files), T023-T026 can run in parallel after T022 complete.

---

## Phase 4: User Story 2 [US2] - Sign In and Manage Existing Todos (Priority: P1)

**Goal**: Returning user can sign in, view todos, toggle completion status, edit todo title/description.

**Independent Test Criteria**:
- ✅ User signs in with existing credentials → sees dashboard with all their todos
- ✅ User clicks checkbox next to "Buy milk" → todo marked complete with strikethrough, persists after reload
- ✅ User clicks "Edit" on todo → inline form appears → changes title to "Buy organic milk" → updated title persists after reload

**Acceptance Scenarios** (from spec.md):
1. Existing user with saved todos → sign in → see dashboard with all todos
2. User viewing todo list → click checkbox → todo marked complete with strikethrough, persists after reload
3. User viewing todo → click "Edit" → change title to "Buy organic milk" → updated title persists

**Tasks**:

### Toggle Completion

- [ ] T027 [US2] Enable checkbox interaction in TodoItem component (frontend/components/todos/TodoItem.tsx) using useToggleTodo mutation with optimistic update and rollback

### Inline Editing

- [ ] T028 [P] [US2] Create TodoEditForm component in frontend/components/todos/TodoEditForm.tsx with title/description inputs, Save/Cancel buttons, React Hook Form, Zod validation
- [ ] T029 [US2] Add edit mode state to TodoItem component (frontend/components/todos/TodoItem.tsx) with toggle between display and edit views, edit button handler
- [ ] T030 [US2] Integrate useUpdateTodo mutation in TodoEditForm (frontend/components/todos/TodoEditForm.tsx) with optimistic update and rollback

### Visual Feedback

- [ ] T031 [P] [US2] Add completion visual styles to TodoItem (frontend/components/todos/TodoItem.tsx) with strikethrough text, muted color for completed todos, checkmark animation

**Validation**:
- Manual test: Toggle checkbox → strikethrough appears immediately, persists after refresh
- Manual test: Click edit → inline form appears → save → title updates, persists after refresh
- Optimistic updates < 100ms perceived latency (SC-003)

**Parallel Opportunities**: T028 and T031 can run in parallel.

---

## Phase 5: User Story 3 [US3] - Delete Unwanted Todos (Priority: P2)

**Goal**: User can delete todos with confirmation prompt, removed todos don't reappear after reload.

**Independent Test Criteria**:
- ✅ User with multiple todos → click "Delete" on "Buy milk" → confirmation prompt appears → confirm → todo removed, doesn't reappear after reload
- ✅ User viewing delete confirmation → click "Cancel" → todo remains unchanged

**Acceptance Scenarios** (from spec.md):
1. User with multiple todos → click "Delete" → confirm → todo removed, doesn't reappear
2. User viewing confirmation → click "Cancel" → todo remains

**Tasks**:

- [ ] T032 [P] [US3] Create Spinner component in frontend/components/ui/Spinner.tsx with small/medium/large variants
- [ ] T033 [US3] Add delete button to TodoItem component (frontend/components/todos/TodoItem.tsx) with confirmation dialog using window.confirm (simple approach) or modal component
- [ ] T034 [US3] Integrate useDeleteTodo mutation in TodoItem (frontend/components/todos/TodoItem.tsx) with optimistic removal and rollback on error

**Validation**:
- Manual test: Delete todo → confirm → todo disappears, doesn't reappear after refresh
- Manual test: Delete todo → cancel → todo remains unchanged
- Optimistic delete < 100ms perceived latency (SC-003)

**Parallel Opportunities**: T032 can start immediately after Phase 4.

---

## Phase 6: User Story 5 [US5] - Session Timeout Recovery (Priority: P2)

**Goal**: JWT expires while viewing app → system shows "Session Expired" message and redirects to signin, user can re-authenticate and resume work, previously created todos still visible.

**Independent Test Criteria**:
- ✅ Authenticated user with expired JWT → attempts to create todo → "Session Expired - Please Sign In" toast → redirect to /signin
- ✅ User re-authenticates after session expiry → return to dashboard → all previously created todos visible
- ✅ Recovery flow < 30 seconds (SC-006)

**Acceptance Scenarios** (from spec.md):
1. User with expired JWT → attempt to create todo → "Session Expired" message → redirect to /signin
2. User re-authenticates → return to dashboard → all previous todos visible

**Tasks**:

- [ ] T035 [US5] Add 401 error detection to API client (frontend/lib/api/api-client.ts) throwing ApiClientError with status 401
- [ ] T036 [US5] Add global error handler in React Query hooks (frontend/lib/api/react-query-hooks.ts) to detect 401, clear session via authClient.signOut(), show toast, redirect to /signin
- [ ] T037 [P] [US5] Add session expiry toast notification with "Your session has expired. Please sign in again." message using sonner toast library

**Validation**:
- Simulate expired token (manually modify JWT or wait for expiration) → attempt action → toast appears → redirect to /signin
- Re-authenticate → todos still present

**Parallel Opportunities**: T037 can run in parallel with T035-T036.

---

## Phase 7: User Story 4 [US4] - Filter and Sort Todos (Priority: P3)

**Goal**: User with many todos can filter (Show All/Active/Completed) and sort (Date/Alphabetical).

**Independent Test Criteria**:
- ✅ User with 10 mixed todos (5 complete, 5 active) → select "Show Active Only" → only 5 active todos display
- ✅ User viewing filtered todos → select "Sort by Date (Newest First)" → todos reordered with most recent at top

**Acceptance Scenarios** (from spec.md):
1. User with 10 mixed todos → select "Show Active Only" → 5 active todos display
2. User viewing filtered todos → select "Sort by Date (Newest First)" → todos reordered

**Tasks**:

- [ ] T038 [P] [US4] Add filter state to dashboard page (frontend/app/dashboard/page.tsx) with filter buttons (All/Active/Completed)
- [ ] T039 [P] [US4] Add sort state to dashboard page (frontend/app/dashboard/page.tsx) with sort dropdown (Date/Alphabetical)
- [ ] T040 [US4] Integrate useFilteredTodos hook from react-query-hooks (frontend/app/dashboard/page.tsx) passing filter and sortBy props
- [ ] T041 [P] [US4] Add filter/sort UI controls in dashboard header (frontend/app/dashboard/page.tsx) with button group for filters, dropdown for sort

**Validation**:
- Create 10 todos (mix completed/active) → filter by Active → verify only active todos show
- Change sort to Alphabetical → verify todos reorder by title
- Dashboard with filtered todos loads in < 3 seconds on 3G (SC-004)

**Parallel Opportunities**: T038, T039, T041 can run in parallel, then T040.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Accessibility audit, performance optimization, production logging, responsive design polish, error handling edge cases.

**Tasks**:

### Accessibility

- [ ] T042 [P] Add ARIA labels to all interactive elements (buttons, inputs, checkboxes) across all components with descriptive labels for screen readers
- [ ] T043 [P] Add keyboard navigation support: Tab (navigate), Enter (activate), Escape (close modals/cancel edits), Space (toggle checkboxes)
- [ ] T044 [P] Verify WCAG AA color contrast (4.5:1 for text, 3:1 for UI components) using axe DevTools or Lighthouse audit

### Performance

- [ ] T045 Optimize bundle size with code splitting and lazy loading for non-critical components (EmptyState, modals), target < 200KB initial JS bundle
- [ ] T046 Run Lighthouse audit and achieve Performance score > 90, Accessibility score = 100, Best Practices score > 90

### Production Logging

- [ ] T047 Add production error logging strategy: Integrate Sentry or LogRocket for frontend error tracking, capture unhandled promise rejections, API errors, auth failures

**Validation**:
- Lighthouse scores meet targets (Performance > 90, Accessibility = 100)
- Bundle size < 200KB (verify with `npm run build`)
- All 6 Success Criteria from spec.md met:
  - SC-001: Signup + first todo < 90 seconds ✅
  - SC-002: Dashboard loads < 2 seconds ✅
  - SC-003: Optimistic updates < 100ms ✅
  - SC-004: 3G todos load < 3 seconds ✅
  - SC-005: 95% signin success rate ✅
  - SC-006: Session recovery < 30 seconds ✅

**Parallel Opportunities**: T042-T044 can run in parallel.

---

## Parallel Execution Examples

### Within Phase 2 (Foundational)
Run in parallel (different files, no dependencies):
- T004 (auth server config) + T005 (auth client config) + T007 (API client) + T008 (React Query hooks)
- T013 (Button) + T014 (Input) + T015 (Card)

Sequential: T009 (providers) depends on T007/T008 complete, T010 (layout) depends on T009 complete

### Within Phase 3 (User Story 1)
Run in parallel after T016-T021 complete:
- T023 (TodoForm) + T024 (TodoList) + T025 (TodoItem) + T026 (EmptyState)

Sequential: T022 (dashboard page) must complete first (imports TodoForm and TodoList)

### Within Phase 4 (User Story 2)
Run in parallel:
- T028 (TodoEditForm) + T031 (visual styles)

Sequential: T027 → T029 → T030 (edit mode flow)

### Across Phases
Phase 6 (US5 - Session Recovery) can run in parallel with Phase 5 (US3 - Delete) - independent features.

---

## MVP Scope (Recommended First Deployment)

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1)**

**Tasks T001-T026** deliver:
- ✅ User signup and signin
- ✅ Create first todo
- ✅ View todo list
- ✅ Logout and sign back in with todos persisted
- ✅ Complete onboarding flow < 90 seconds
- ✅ Dashboard loads < 2 seconds
- ✅ Optimistic updates < 100ms

**Post-MVP Increments**:
- **Increment 2**: Add Phase 4 (US2 - Toggle/Edit) - essential for todo management
- **Increment 3**: Add Phase 5 (US3 - Delete) + Phase 6 (US5 - Session Recovery) in parallel
- **Increment 4**: Add Phase 7 (US4 - Filter/Sort) - power user feature
- **Final Polish**: Phase 8 - accessibility, performance, production logging

---

## Task Summary

**Total Tasks**: 47
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 12 tasks
- Phase 3 (US1 - MVP): 11 tasks
- Phase 4 (US2): 5 tasks
- Phase 5 (US3): 3 tasks
- Phase 6 (US5): 3 tasks
- Phase 7 (US4): 4 tasks
- Phase 8 (Polish): 6 tasks

**Parallelizable Tasks**: 26 tasks (marked with [P])

**Dependency-Free Stories**:
- US5 (Session Recovery) can run in parallel with US3 (Delete)

**Dependent Stories**:
- US2 depends on US1 (needs TodoItem component)
- US3 depends on US2 (needs edit/toggle features)
- US4 depends on US1, US2, US3 (needs all CRUD features)

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All TaskIDs sequential (T001-T047)
✅ All user story phase tasks have story labels ([US1], [US2], [US3], [US4], [US5])
✅ All parallelizable tasks marked with [P]
✅ All tasks include exact file paths
✅ Setup and Foundational phases have NO story labels
✅ Polish phase has NO story labels

---

## Next Steps

Run `/sp.implement` to execute tasks with TDD workflow (Red-Green-Refactor), or manually implement tasks in order. Start with **MVP (T001-T026)** for first deployment.
