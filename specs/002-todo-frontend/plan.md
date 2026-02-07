# Implementation Plan: Todo Frontend Web Application

**Branch**: `002-todo-frontend` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-todo-frontend/spec.md`

## Summary

**Primary Requirement**: Build a modern, responsive Next.js 16 frontend for a multi-user Todo application with Better Auth authentication and FastAPI backend integration. The application must provide a professional, navy blue-themed UI with optimistic updates, inline editing, and comprehensive error handling.

**Technical Approach**:
- **Framework**: Next.js 16+ with App Router (TypeScript, React Server Components)
- **Authentication**: Better Auth with JWT RS256 tokens in HttpOnly cookies
- **State Management**: TanStack Query v5 for server state with optimistic updates
- **Styling**: Tailwind CSS 4 with navy blue (#1E3A8A) design system
- **API Integration**: Type-safe REST client with automatic JWT attachment
- **UX Pattern**: Optimistic updates with independent parallel mutations and automatic rollback

**Key Architectural Decisions** (from research.md):
1. **JWT Expiration**: 15-minute access tokens, 7-day refresh tokens (balances security with UX)
2. **State Library**: React Query for automatic caching, optimistic updates, and request deduplication
3. **Auth Integration**: Better Auth nextCookies() plugin with client-side session hooks
4. **Styling**: Tailwind CSS 4 stable (native Next.js 16 support, Rust-based build)

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+
**Primary Dependencies**:
- Next.js 16+ (App Router, React 19+)
- TanStack Query v5 (server state management)
- Better Auth (JWT-based authentication)
- Tailwind CSS 4 (styling)
- React Hook Form + Zod (form handling, validation)
- Sonner (toast notifications)

**Storage**: N/A (frontend only - all data fetched from FastAPI backend via REST API)
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Modern web browsers (Chrome 111+, Safari 16.4+, Firefox 128+)
**Project Type**: Web frontend (Next.js App Router with client-side data fetching for authenticated routes)
**Performance Goals**:
- Initial page load < 2 seconds (4G connection)
- Dashboard load with todos < 3 seconds (3G connection)
- Optimistic UI updates < 100ms perceived latency
- Bundle size < 200KB initial JS (code splitting applied)

**Constraints**:
- Must use Better Auth for authentication (no custom auth)
- Backend API contract is frozen (cannot change endpoints)
- JWTs in HttpOnly cookies (no localStorage access)
- No server-side rendering of authenticated content (App Router client-side data fetching)
- No direct database access (all data via FastAPI REST API)
- WCAG 2.1 AA accessibility compliance required

**Scale/Scope**:
- Single-user todo application (no collaboration features)
- 5 user stories (P1: Signup/Signin/CRUD, P2: Delete/Session Recovery, P3: Filter/Sort)
- ~10-15 React components (auth forms, todo list, todo item, shared UI)
- 6 API endpoints (auth via Better Auth, todos CRUD via FastAPI)
- Mobile-first responsive design (3 breakpoints: mobile <768px, tablet 768-1024px, desktop >=1024px)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Determinism Over Improvisation** | All architectural choices explicit and justified | ✅ PASS | Research.md documents all major decisions (JWT expiry, state mgmt, auth integration, styling, colors) with rationale |
| **II. Security-First Design** | Auth enforcement at every layer | ✅ PASS | Better Auth JWT in HttpOnly cookies, middleware route protection, automatic 401 handling, no token in localStorage |
| **III. Non-Hallucination** | Only verified libraries/APIs | ✅ PASS | All integrations verified via Context7 MCP (Next.js 16, TanStack Query v5, Better Auth, Tailwind CSS 4) |
| **IV. Separation of Concerns** | Clean decoupling of layers | ✅ PASS | Frontend handles UI/auth flows only, all business logic in backend, no direct DB access, Better Auth decoupled from backend |
| **V. Reproducibility** | System reproducible from docs | ✅ PASS | quickstart.md provides step-by-step setup, env vars documented, dependencies pinned in package.json |
| **VI. Observability** | Critical flows logged | ⚠️ PARTIAL | Frontend error logging via toast notifications, 401/404/422 errors logged; production logging strategy TBD in tasks phase |
| **VII. Production Realism** | No demo shortcuts | ✅ PASS | Real JWT flows (no mock auth), Neon PostgreSQL for Better Auth (not in-memory), proper HTTP status codes, typed schemas |

**Overall Gate Status**: ✅ **PASS** (6/7 full pass, 1 partial with plan for completion)

**Post-Phase 1 Re-Check**: Production logging strategy will be defined in tasks.md (Phase 2) - consider adding Sentry or LogRocket for frontend error tracking.

**Deviations from Constitution**: None - all principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-frontend/
├── plan.md              # ✅ This file (Phase 0-1 architecture plan)
├── research.md          # ✅ Phase 0 output (JWT expiry, state mgmt, auth, styling, colors)
├── data-model.md        # ✅ Phase 1 output (User, Todo, state transitions, API mapping)
├── quickstart.md        # ✅ Phase 1 output (setup instructions, dev workflow)
├── contracts/           # ✅ Phase 1 output (API client, React Query hooks)
│   ├── api-client.ts    #    Type-safe API client with JWT attachment
│   └── react-query-hooks.ts  # React Query hooks with optimistic updates
├── checklists/
│   └── requirements.md  # Spec quality checklist (18/19 passing)
└── spec.md              # Feature specification (529 lines, 31 FRs, 6 SCs)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── (auth)/                  # Auth route group (unauthenticated)
│   │   ├── signin/
│   │   │   └── page.tsx         # Signin page (Better Auth form)
│   │   └── signup/
│   │       └── page.tsx         # Signup page (Better Auth form)
│   ├── dashboard/
│   │   └── page.tsx             # Authenticated dashboard (todo list)
│   ├── layout.tsx               # Root layout (Providers, Toaster, global styles)
│   ├── page.tsx                 # Public landing page (unauthenticated home)
│   ├── providers.tsx            # React Query + Better Auth providers
│   └── globals.css              # Global Tailwind styles
│
├── components/
│   ├── todos/
│   │   ├── TodoList.tsx         # Todo list container (fetch + display)
│   │   ├── TodoItem.tsx         # Individual todo card (checkbox, title, actions)
│   │   ├── TodoForm.tsx         # Create todo form (title + description inputs)
│   │   └── TodoEditForm.tsx     # Inline edit form (Save/Cancel buttons)
│   ├── auth/
│   │   ├── SignInForm.tsx       # Signin form (email + password, Better Auth)
│   │   └── SignUpForm.tsx       # Signup form (email + password, Better Auth)
│   └── ui/
│       ├── Button.tsx           # Reusable button (primary/secondary/danger variants)
│       ├── Input.tsx            # Form input with error states
│       ├── Card.tsx             # Card container for todos
│       ├── Checkbox.tsx         # Checkbox component for completion toggle
│       ├── EmptyState.tsx       # Empty state with illustration (no todos)
│       └── Spinner.tsx          # Loading spinner
│
├── lib/
│   ├── api/
│   │   ├── api-client.ts        # Type-safe FastAPI client (JWT auth)
│   │   └── react-query-hooks.ts # React Query hooks (useTodos, useCreateTodo, etc.)
│   ├── auth.ts                  # Better Auth server config
│   ├── auth-client.ts           # Better Auth client config
│   └── utils.ts                 # Utility functions (cn, formatDate, etc.)
│
├── middleware.ts                # Route protection (redirect based on auth state)
├── tailwind.config.ts           # Tailwind config (navy blue theme)
├── tsconfig.json                # TypeScript config (strict mode)
├── next.config.js               # Next.js config
├── .env.local                   # Environment variables (NOT committed)
├── .env.example                 # Example env vars template
└── package.json                 # Dependencies and scripts

backend/                         # Existing backend (spec: 001-todo-backend-api)
├── app/
│   ├── api/routers/
│   │   └── todos.py             # Todo CRUD endpoints
│   ├── models/todo.py           # SQLModel Todo model
│   └── main.py                  # FastAPI app with CORS config
└── tests/
    └── integration/
        └── test_todos_crud.py   # Todo API tests
```

**Structure Decision**: **Option 2 - Web Application** (frontend + existing backend)

- **Backend** (`backend/`): Already implemented in feature `001-todo-backend-api` - provides REST API with JWT verification
- **Frontend** (`frontend/`): New Next.js 16 App Router application for this feature
- **Separation**: Frontend and backend are independent deployments; frontend calls backend via HTTP
- **Routing**: Next.js App Router with route groups for auth/dashboard separation
- **Component Organization**: Domain-based (todos, auth, ui) for scalability

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - Constitution Check passed (6/7 full, 1 partial). No unjustified complexity introduced.

---

## Application Architecture

### High-Level Next.js App Router Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ROOT LAYOUT (app/layout.tsx)                                │
│ - Providers (React Query, Better Auth)                      │
│ - Toaster (global notifications)                            │
│ - Global styles (Tailwind)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────┐       ┌──────────▼───────────┐
│ PUBLIC ROUTES    │       │ AUTHENTICATED ROUTES │
│ (no auth check)  │       │ (middleware protected)│
└──────────────────┘       └──────────────────────┘
        │                             │
┌───────▼──────────┐       ┌──────────▼───────────┐
│ / (page.tsx)     │       │ /dashboard           │
│ Landing page     │       │ Todo list + CRUD     │
│ - Hero section   │       │ - TodoList component │
│ - Sign Up CTA    │       │ - TodoForm component │
│ - Sign In CTA    │       │ - User info display  │
└──────────────────┘       └──────────────────────┘
        │
┌───────▼──────────┐
│ (auth) Group     │
│ /signin          │
│ /signup          │
│ - SignInForm     │
│ - SignUpForm     │
└──────────────────┘
```

**Route Flow**:
1. **Unauthenticated user** → lands on `/` → sees landing page with CTAs
2. **Click "Sign Up"** → `/signup` → Better Auth form → success → redirect to `/dashboard`
3. **Click "Sign In"** → `/signin` → Better Auth form → success → redirect to `/dashboard`
4. **Authenticated user** → visits `/` → middleware redirects to `/dashboard`
5. **Session expired** → any protected route → middleware redirects to `/signin` with toast

### Public vs Authenticated Route Boundaries

**Public Routes** (no authentication required):
- `/` - Landing page with marketing content and auth CTAs
- `/signin` - Signin form
- `/signup` - Signup form

**Authenticated Routes** (require valid JWT):
- `/dashboard` - Main todo management interface
- Future: `/profile`, `/settings` (not in MVP)

**Route Protection Mechanism**:
- **Middleware** (`middleware.ts`): Checks for Better Auth session cookie, redirects unauthenticated users to `/signin`
- **Client-Side Guard**: Each protected page uses `authClient.useSession()` to verify auth state and redirect if needed
- **API Layer**: All API requests automatically attach JWT; 401 responses trigger session clear + redirect

### Layout and Page Composition Strategy

**Root Layout** (`app/layout.tsx`):
- Server Component wrapping entire app
- Provides `<Providers>` (React Query, Better Auth)
- Includes `<Toaster>` for global notifications
- Sets up `<html>` and `<body>` with Tailwind classes

**Page Composition**:
- **Landing Page** (`app/page.tsx`): Server Component with static content, CTAs link to auth pages
- **Auth Pages** (`app/(auth)/signin/page.tsx`, `app/(auth)/signup/page.tsx`): Client Components using Better Auth hooks
- **Dashboard** (`app/dashboard/page.tsx`): Client Component using `authClient.useSession()` and React Query hooks

**Component Hierarchy** (Dashboard):
```
app/dashboard/page.tsx (Client Component)
  ├── authClient.useSession() → redirect if not authenticated
  ├── <Header>
  │   ├── User email display
  │   └── Logout button
  ├── <TodoForm> (create new todo)
  │   └── useMutation (create todo with optimistic update)
  └── <TodoList>
      ├── useQuery (fetch todos)
      ├── Loading skeleton OR
      ├── Empty state (no todos) OR
      └── <TodoItem>[] (map over todos)
          ├── Checkbox → useMutation (toggle complete)
          ├── Title/Description display OR <TodoEditForm> (inline edit)
          ├── Edit button → toggle edit mode
          └── Delete button → useMutation (delete with confirmation)
```

---

## Component Architecture

### Core UI Components

**TodoList** (`components/todos/TodoList.tsx`):
- **Responsibility**: Container for all todos, handles fetching and display
- **State**: React Query `useTodos()` hook
- **Props**: None (fetches based on authenticated user)
- **Rendering Logic**:
  - If `isLoading`: Show `<TodoListSkeleton>`
  - If `error`: Show error message with retry button
  - If `data.length === 0`: Show `<EmptyState>`
  - Else: Map `data` to `<TodoItem>[]`

**TodoItem** (`components/todos/TodoItem.tsx`):
- **Responsibility**: Display individual todo with actions
- **Props**: `{ todo: Todo, onToggle, onDelete }`
- **State**: `isEditing` (boolean) to toggle between display and edit modes
- **UI States**:
  - **Display Mode**: Checkbox, title (strikethrough if completed), description, edit/delete buttons
  - **Edit Mode**: `<TodoEditForm>` component (Save/Cancel buttons)
- **Interactions**:
  - Checkbox click → call `onToggle` (optimistic update)
  - Edit button → set `isEditing = true`
  - Delete button → show confirmation modal → call `onDelete` (optimistic remove)

**TodoForm** (`components/todos/TodoForm.tsx`):
- **Responsibility**: Create new todos
- **State**: React Hook Form with Zod validation
- **Fields**: `title` (required, 1-500 chars), `description` (optional, 0-2000 chars), `is_completed` (checkbox, default false)
- **Submit Flow**:
  1. Validate client-side (Zod schema)
  2. Call `useCreateTodo()` mutation
  3. Optimistic update: add todo to list immediately
  4. On success: Replace optimistic todo with server todo, reset form
  5. On error: Rollback optimistic todo, preserve form input, show error toast

**TodoEditForm** (`components/todos/TodoEditForm.tsx`):
- **Responsibility**: Inline editing of existing todo
- **Props**: `{ todo: Todo, onSave, onCancel }`
- **State**: React Hook Form initialized with current todo values
- **Submit Flow**:
  1. Validate client-side
  2. Call `onSave` (triggers `useUpdateTodo()` mutation)
  3. Optimistic update: update todo in list immediately
  4. On success: Exit edit mode
  5. On error: Rollback update, stay in edit mode, show error toast

### Shared UI Primitives

**Button** (`components/ui/Button.tsx`):
- **Variants**: `primary` (navy blue bg), `secondary` (outline), `danger` (red bg for delete)
- **States**: `default`, `hover`, `active`, `disabled`, `loading` (with spinner)
- **Props**: `{ variant, size, disabled, loading, onClick, children }`

**Input** (`components/ui/Input.tsx`):
- **Variants**: Text, textarea
- **States**: `default`, `focus` (blue ring), `error` (red border)
- **Props**: `{ label, error, type, placeholder, ...inputProps }`

**Card** (`components/ui/Card.tsx`):
- **Purpose**: Container for todo items and forms
- **Styling**: White background, subtle shadow, rounded corners, hover elevation

**EmptyState** (`components/ui/EmptyState.tsx`):
- **Purpose**: Show when user has no todos
- **Content**: Illustration (simple SVG icon), heading "No tasks yet!", description "Add your first todo above to get started."

**Spinner** (`components/ui/Spinner.tsx`):
- **Purpose**: Loading indicator for buttons and skeletons
- **Variants**: `small` (16px), `medium` (24px), `large` (48px)

**SignInForm** / **SignUpForm** (`components/auth/`):
- **Responsibility**: Better Auth authentication forms
- **Fields**: Email (required, email format), Password (required, min 8 chars)
- **Submit Flow**: Call Better Auth `signIn()` or `signUp()` → on success redirect to `/dashboard`
- **Error Handling**: Display inline errors for email already exists, invalid credentials, etc.

---

## State Management & Data Flow

### Auth State Flow

```
┌──────────────────┐
│ Better Auth      │
│ (lib/auth.ts)    │
└────────┬─────────┘
         │ Session cookie (HttpOnly)
         │
┌────────▼─────────┐
│ Auth Client      │
│ (lib/auth-client.│
│  ts)             │
└────────┬─────────┘
         │ useSession() hook
         │
┌────────▼─────────┐
│ Protected Pages  │
│ /dashboard       │
│ - Get user data  │
│ - Get JWT token  │
└────────┬─────────┘
         │ JWT token
         │
┌────────▼─────────┐
│ API Client       │
│ (lib/api/        │
│  api-client.ts)  │
│ - Attach to      │
│   Authorization  │
│   header         │
└──────────────────┘
```

**Auth State Updates**:
- **Sign In/Sign Up**: Better Auth creates session → cookie set → `useSession()` returns user data
- **Logout**: Call `authClient.signOut()` → cookie cleared → `useSession()` returns null → redirect to `/`
- **Session Expiry**: Backend returns 401 → API client throws error → React Query error handler clears session → redirect to `/signin`
- **Token Refresh**: Better Auth automatically refreshes tokens (7-day session, 1-day updateAge)

### API Data Fetching Strategy

**React Query Configuration**:
```typescript
{
  queries: {
    staleTime: 60 * 1000,          // 60 seconds - data considered fresh
    gcTime: 5 * 60 * 1000,         // 5 minutes - cache garbage collection
    retry: 3,                       // Retry failed queries 3 times
    refetchOnWindowFocus: true,    // Refetch when user returns to tab
    refetchOnReconnect: true,      // Refetch after network reconnection
  },
  mutations: {
    retry: 3,                       // Retry failed mutations 3 times
  },
}
```

**Data Fetching Flow**:
1. Component mounts → `useTodos()` hook checks cache
2. If cache is stale or missing → fetch `GET /api/todos` with JWT
3. Display loading skeleton while fetching
4. On success → cache data, render `<TodoItem>[]`
5. On error → display error message with retry button

**Cache Invalidation**:
- **Create Todo**: Invalidate `['todos']` after successful POST
- **Update Todo**: Invalidate `['todos', todoId]` and `['todos']` after successful PATCH
- **Delete Todo**: Invalidate `['todos']` after successful DELETE
- **Logout**: Clear all queries (`queryClient.clear()`)

### Error and Loading State Propagation

**Loading States**:
- **Initial Load**: `isLoading` from `useTodos()` → show skeleton
- **Mutation Pending**: `isPending` from `useMutation()` → disable button, show spinner
- **Background Refetch**: `isFetching && !isLoading` → subtle loading indicator (optional)

**Error States**:
- **Query Error**: `isError` + `error` from `useTodos()` → display error message with retry
- **Mutation Error**: `isError` + `error` from `useMutation()` → rollback optimistic update, show toast
- **Network Error**: Detect `!navigator.onLine` → show "You appear to be offline" banner
- **401 Error**: Automatic redirect to `/signin` with "Session expired" toast
- **422 Error**: Parse validation errors, display inline below form fields

**Error Display Hierarchy**:
1. **Inline Field Errors** (422 validation): Below input fields in red text
2. **Toast Notifications** (mutations, 401): Top-right corner, auto-dismiss after 5 seconds
3. **Banner** (network offline, global errors): Top of page, persistent until dismissed
4. **Empty State** (no data): Illustration with friendly message

---

## Auth Integration Plan

### Better Auth Integration Flow

**Setup Steps** (from quickstart.md):
1. Install `better-auth` npm package
2. Configure `lib/auth.ts` (server-side) with database connection and session settings
3. Configure `lib/auth-client.ts` (client-side) with `jwtClient()` plugin
4. Add `nextCookies()` plugin to server config (must be last in plugins array)
5. Set `BETTER_AUTH_SECRET` in environment variables (shared with backend)

**Session Management**:
- **Storage**: HttpOnly cookie (managed by Better Auth, not accessible via JavaScript)
- **Expiration**: 7 days (access token refresh every 24 hours)
- **Verification**: Backend verifies JWT via shared `BETTER_AUTH_SECRET`

### JWT Acquisition and Request Attachment Strategy

**JWT Acquisition** (in `api-client.ts`):
```typescript
const { data, error } = await authClient.token()
if (error || !data?.token) {
  throw new ApiClientError('No active session', 401)
}
const jwtToken = data.token
```

**Request Attachment**:
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
})
```

**Automatic Injection**: All API calls through `authenticatedFetch()` wrapper automatically:
1. Retrieve JWT from Better Auth
2. Attach to `Authorization` header
3. Handle 401 responses by clearing session and redirecting

### Session Expiry and Logout Flows

**Session Expiry Detection**:
1. User performs action → API call with JWT
2. Backend returns 401 (token expired or invalid)
3. `authenticatedFetch()` throws `ApiClientError` with status 401
4. React Query `onError` callback detects 401
5. Clear Better Auth session: `await authClient.signOut()`
6. Show toast: "Your session has expired. Please sign in again."
7. Redirect to `/signin`

**Manual Logout Flow**:
1. User clicks "Logout" button
2. Call `await authClient.signOut()`
3. Clear React Query cache: `queryClient.clear()`
4. Redirect to `/` (landing page)
5. Middleware prevents access to `/dashboard` until re-authentication

**Unsaved Changes Handling**:
- Per spec clarification: **Unsaved changes are lost on session expiry** (prioritizes security over draft preservation)
- No localStorage draft recovery
- User must re-authenticate and re-enter any in-progress edits

---

## UX & Visual System

### Design System Principles

**Modern & Engaging**:
- Smooth animations (150ms transitions for hovers, 300ms for modals)
- Micro-interactions (checkmark animation on todo completion, success toast with icon)
- Thoughtful color palette (navy blue primary with teal/green accents)

**Minimalist Focus**:
- Ample whitespace (8px grid system: 8/16/24/32/48px spacing)
- Clean interface without distractions (no unnecessary graphics or clutter)
- User attention focused on todo list and form

**Delight in Details**:
- Checkmark animation when todo marked complete
- Success toasts with icons (✓ for success, ⚠ for warning, ✗ for error)
- Smooth card hover elevations (subtle shadow increase)

### Responsive Layout Strategy

**Breakpoints**:
- **Mobile** (`< 768px`): Single column, full-width cards, stacked layout
- **Tablet** (`768px - 1024px`): Two-column grid for larger lists (optional)
- **Desktop** (`>= 1024px`): Centered max-width container (~1200px), multi-column layout

**Responsive Patterns**:
- **TodoForm**: Full-width on mobile, max-width 600px centered on desktop
- **TodoList**: Single column on mobile, grid layout on desktop if space permits
- **Modals**: Bottom sheet on mobile (slide up animation), centered modal on desktop
- **Navigation**: Hamburger menu on mobile (if header needed), horizontal nav on desktop

**Touch-Friendly UI** (mobile):
- Minimum touch target: 44x44px (WCAG guidelines)
- Larger buttons and checkboxes on mobile
- Swipe gestures NOT implemented (buttons only for clarity)

### Accessibility Plan

**Keyboard Navigation**:
- **Tab**: Navigate through all interactive elements (form inputs, buttons, checkboxes)
- **Enter**: Activate buttons, submit forms
- **Escape**: Close modals, cancel inline edits
- **Space**: Toggle checkboxes

**Focus Indicators**:
- 2px blue outline (`ring-2 ring-primary`) on all interactive elements
- High contrast (4.5:1 ratio for focus rings)

**ARIA Labels**:
- Buttons: `aria-label="Mark todo as complete"`, `aria-label="Delete todo titled Buy milk"`
- Form inputs: Proper `<label>` elements with `htmlFor` attribute
- Loading states: `aria-live="polite"` for status updates
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

**Color Contrast** (WCAG AA):
- Normal text (16px): 4.5:1 ratio
- Large text (24px+): 3:1 ratio
- UI components: 3:1 ratio
- Navy blue (#1E3A8A) on white (#FFFFFF): 8.59:1 ✅ PASS

**Semantic HTML**:
- `<h1>` for page title ("My Todos")
- `<h2>` for section titles (if applicable)
- `<button>` for all actions (not `<div>` with click handlers)
- `<form>` for todo creation/editing
- Proper `<label>` and `<input>` pairing

---

## API Integration Strategy

### Frontend Calls to FastAPI Endpoints

**Endpoint Mapping**:
| Frontend Action | HTTP Method | Endpoint | Auth | Optimistic Update |
|-----------------|-------------|----------|------|-------------------|
| Fetch all todos | GET | `/api/todos` | Required | No (initial load) |
| Create todo | POST | `/api/todos` | Required | Yes (add to list immediately) |
| Update todo | PATCH | `/api/todos/{id}` | Required | Yes (update in list immediately) |
| Delete todo | DELETE | `/api/todos/{id}` | Required | Yes (remove from list immediately) |
| Toggle complete | PATCH | `/api/todos/{id}` | Required | Yes (toggle in list immediately) |

**Request Flow**:
1. User action (e.g., click "Create")
2. React Query mutation triggered
3. `onMutate` callback: Optimistic UI update
4. `mutationFn`: Call `todoApi.create()` from `api-client.ts`
5. `api-client.ts`: Attach JWT, make fetch request
6. `onSuccess`: Confirm optimistic update with server response
7. `onError`: Rollback optimistic update, show toast
8. `onSettled`: Invalidate cache to refetch

### Error Handling and Retries

**Retry Strategy**:
- **Queries**: Retry 3 times with exponential backoff (1s, 2s, 4s)
- **Mutations**: Retry 3 times for network errors only (not for 4xx client errors)
- **Conditional Retry**: Don't retry 401 (session expired), 404 (not found), or 422 (validation error)

**Error Categorization**:
| Status Code | Category | Retry? | User Message | Action |
|-------------|----------|--------|--------------|--------|
| 200/201/204 | Success | N/A | Success toast | Confirm UI update |
| 401 | Auth Error | No | "Session expired. Sign in again." | Redirect to /signin |
| 404 | Not Found | No | "Todo not found. May have been deleted." | Remove from UI |
| 422 | Validation | No | Field-specific errors | Display inline |
| 500/503 | Server Error | Yes | "Something went wrong. Try again." | Show retry button |
| Network | Network Error | Yes | "You appear to be offline." | Show offline banner |

### Mapping Backend Errors to User-Friendly Messages

**getUserErrorMessage()** function (from `api-client.ts`):
```typescript
function getUserErrorMessage(error: unknown): string {
  if (!(error instanceof ApiClientError)) {
    return 'An unexpected error occurred. Please try again.'
  }

  switch (error.status) {
    case 401: return 'Your session has expired. Please sign in again.'
    case 404: return 'Todo not found. It may have been deleted.'
    case 422: return 'Invalid input. Please check your data and try again.'
    case 500:
    case 503: return 'Server error. Please try again later.'
    default:
      if (!navigator.onLine) {
        return 'You appear to be offline. Check your connection.'
      }
      return error.message || 'Something went wrong. Please try again.'
  }
}
```

**Validation Error Parsing** (422):
```typescript
// Backend response:
{
  "detail": [
    { "loc": ["body", "title"], "msg": "ensure this value has at least 1 characters", "type": "value_error.any_str.min_length" }
  ]
}

// Frontend parsing:
const fieldErrors = parseValidationErrors(error)
// Result: { title: "ensure this value has at least 1 characters" }

// Display:
<input {...register('title')} />
{errors.title && <p className="text-semantic-error text-sm mt-1">{errors.title.message}</p>}
```

---

## Implementation Phases

### Phase 0: Setup & Configuration ✅ COMPLETE

- ✅ Research Next.js 16, React Query, Better Auth, Tailwind CSS 4 (research.md)
- ✅ Define JWT expiration duration (15 min access, 7 days refresh)
- ✅ Choose state management library (React Query)
- ✅ Select color palette (Navy blue #1E3A8A with teal/green accents)

### Phase 1: Design & Contracts ✅ COMPLETE

- ✅ Document entities (User, Todo, TodoListState) in data-model.md
- ✅ Create API client (`contracts/api-client.ts`) with type-safe methods
- ✅ Create React Query hooks (`contracts/react-query-hooks.ts`) with optimistic updates
- ✅ Write quickstart guide (quickstart.md) with setup instructions
- ✅ Update agent context (CLAUDE.md) with technology stack

### Phase 2: Implementation (Next Steps - `/sp.tasks`)

**Red Phase** (TDD):
- Write E2E tests for user stories (Playwright)
- Write component tests (React Testing Library)
- Write API integration tests (mock backend responses)

**Green Phase** (Implementation):
- Set up Next.js 16 project with TypeScript + Tailwind
- Configure Better Auth (server + client)
- Set up React Query providers
- Implement UI components (Button, Input, Card, EmptyState, Spinner)
- Implement auth forms (SignInForm, SignUpForm)
- Implement todo components (TodoList, TodoItem, TodoForm, TodoEditForm)
- Implement dashboard page with todo management
- Implement landing page with CTAs
- Configure middleware for route protection

**Refactor Phase** (Polish):
- Extract reusable hooks (useAuth, useToast)
- Optimize bundle size (code splitting, lazy loading)
- Add loading skeletons
- Add animations and micro-interactions
- Accessibility audit (keyboard navigation, ARIA labels)
- Performance audit (Lighthouse score > 90)

---

## Success Metrics

**From Spec (Success Criteria)**:
- SC-001: Users complete signup + first todo in < 90 seconds ✅ Target
- SC-002: Dashboard loads with todos in < 2 seconds ✅ Target
- SC-003: Optimistic UI updates < 100ms perceived latency ✅ Target
- SC-004: 3G network: todos load within 3 seconds ✅ Target
- SC-005: 95% signin success rate on first attempt ✅ Target
- SC-006: Session expiry recovery < 30 seconds ✅ Target

**Additional Plan Metrics**:
- Initial JS bundle < 200KB (gzipped)
- Lighthouse Performance score > 90
- Lighthouse Accessibility score = 100
- Zero critical security vulnerabilities (npm audit)
- Test coverage > 80% for critical paths

---

## Next Steps

1. **Run `/sp.tasks`** to generate tasks.md with Red-Green-Refactor phases
2. **Review tasks.md** for implementation order and dependencies
3. **Run `/sp.implement`** to execute tasks with TDD workflow
4. **Create ADRs** for significant decisions (use `/sp.adr <title>`)

**Key Decisions Requiring ADRs**:
- None currently - all major architectural decisions documented in research.md with rationale
