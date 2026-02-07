# Feature Specification: Todo Frontend Web Application

**Feature Branch**: `002-todo-frontend`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Next.js frontend for multi-user Todo application with Better Auth and FastAPI integration"

## Product Scope & Responsibilities

### What the Frontend IS Responsible For

- **User Interface**: All visual components, layouts, and interactions for the Todo application
- **Authentication Flows**: Signup, signin, session management, and logout UIs via Better Auth
- **Client-Side State**: Managing auth state, todo list state, loading states, and error states
- **API Orchestration**: Making HTTP requests to the FastAPI backend with proper JWT authentication
- **JWT Handling**: Obtaining JWT from Better Auth, attaching to API requests, handling token expiration
- **User Experience**: Loading indicators, error messages, empty states, optimistic updates
- **Form Validation**: Client-side validation of todo creation/editing forms before API submission
- **Responsive Design**: Mobile-first UI that works across all device sizes
- **Accessibility**: Keyboard navigation, ARIA labels, semantic HTML, color contrast compliance

### Explicit Non-Goals

- **Backend Authentication Logic**: The frontend does NOT issue, verify, or validate JWTs (Better Auth issues, backend verifies)
- **Database Access**: No direct database connections or queries
- **Server-Side JWT Verification**: JWTs are verified by the FastAPI backend via JWKS, not by Next.js
- **Business Logic**: Todo ownership, validation rules, and data integrity enforced by backend
- **Data Persistence**: All data stored and retrieved via FastAPI REST API
- **User Management**: User creation, deletion, and profile management handled by Better Auth

---

## Clarifications

### Session 2026-02-07

- Q: What happens when a user refreshes the page while unauthenticated? → A: Public landing page at `/` with "Sign Up" and "Sign In" CTAs, then redirect to `/dashboard` after auth
- Q: After successful todo creation via optimistic update, what happens if the API call fails? → A: Show error toast, rollback UI (remove optimistic todo), preserve form input so user can manually retry
- Q: When the user clicks "Edit" on a todo, how should the edit interface appear? → A: Inline edit: Click edit button → todo card expands/transforms into editable form in place → Save/Cancel buttons appear
- Q: When a user receives a 401 error during an ongoing todo edit (form is open), what should happen? → A: Immediate redirect to signin, unsaved changes are lost (prioritize security and simplicity)
- Q: How should the app handle rapid todo list updates (e.g., user toggles 5 checkboxes in quick succession)? → A: Send all requests in parallel, each with independent optimistic update and rollback
- Q: What color palette should the app use? → A: Navy blue / dark blue primary theme with complementary accent colors for a modern, professional UX
- Q: How long should JWTs last before expiring? → A: 1 hour (3600 seconds) - balances security with user experience for productivity workflows
- Q: Which state management library should be used for todo state? → A: React Query / TanStack Query - provides automatic caching, optimistic updates, and minimal boilerplate for server-state management

---

## User Scenarios & Testing

### User Story 1 - Sign Up and Create First Todo (Priority: P1)

A new user discovers the Todo app, creates an account, and adds their first task to verify the system works.

**Why this priority**: Core user onboarding flow - without signup and task creation, the product has no value. This is the minimal viable product (MVP).

**Independent Test**: User can sign up with email/password, be redirected to authenticated dashboard, create a todo with title "Buy milk", and see it appear in their list. Logout and re-login shows the same todo persisted.

**Acceptance Scenarios**:

1. **Given** a visitor on the homepage, **When** they click "Sign Up" and submit valid credentials (email + password), **Then** they are redirected to the authenticated dashboard with an empty todo list
2. **Given** an authenticated user on the dashboard with no todos, **When** they enter "Buy milk" in the create form and submit, **Then** the todo appears in the list with is_completed=false
3. **Given** an authenticated user with one todo, **When** they logout and sign back in with the same credentials, **Then** they see their previously created todo in the list

---

### User Story 2 - Sign In and Manage Existing Todos (Priority: P1)

A returning user logs in with their credentials and views, edits, and completes their existing tasks.

**Why this priority**: Essential for user retention - users need to access their previously created todos and mark them complete to get value from the app.

**Independent Test**: User signs in with existing credentials, sees their todo list, toggles a todo's completion status, sees the visual change, refreshes the page, and the change persists.

**Acceptance Scenarios**:

1. **Given** an existing user with saved todos, **When** they sign in with valid credentials, **Then** they see their dashboard with all their todos displayed
2. **Given** an authenticated user viewing their todo list, **When** they click the checkbox next to "Buy milk", **Then** the todo is marked complete with visual feedback (strikethrough text) and persists after page reload
3. **Given** an authenticated user viewing a todo, **When** they click "Edit" and change the title to "Buy organic milk", **Then** the updated title displays immediately and persists after page reload

---

### User Story 3 - Delete Unwanted Todos (Priority: P2)

A user removes completed or irrelevant tasks from their list to keep it clean and focused.

**Why this priority**: Important for ongoing usability but not required for initial MVP value delivery. Users can accumulate completed todos before needing deletion.

**Independent Test**: User selects a todo, clicks delete, sees a confirmation prompt, confirms deletion, and the todo disappears from the list permanently.

**Acceptance Scenarios**:

1. **Given** an authenticated user with multiple todos, **When** they click "Delete" on "Buy milk" and confirm the action, **Then** the todo is removed from the list and does not reappear after page reload
2. **Given** an authenticated user viewing a todo delete confirmation, **When** they click "Cancel", **Then** the todo remains in the list unchanged

---

### User Story 4 - Filter and Sort Todos (Priority: P3)

A user with many todos filters their list to show only active or completed tasks, and sorts by creation date or alphabetically.

**Why this priority**: Nice-to-have for power users with large todo lists. Not required for core functionality or small lists.

**Independent Test**: User with 10 todos (5 completed, 5 active) clicks "Show Active Only" filter and sees only 5 items. Clicks "Sort A-Z" and sees tasks alphabetically ordered.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 10 mixed todos (5 complete, 5 active), **When** they select "Show Active Only" filter, **Then** only 5 active todos display
2. **Given** an authenticated user viewing filtered todos, **When** they select "Sort by Date (Newest First)", **Then** todos are reordered with most recently created at the top

---

### User Story 5 - Session Timeout Recovery (Priority: P2)

A user's JWT expires while they're viewing the app, and the system gracefully prompts them to re-authenticate without data loss.

**Why this priority**: Critical for user experience but not required for initial MVP testing. Can be addressed after core flows work.

**Independent Test**: User creates 3 todos, waits for JWT expiration (or simulates expired token), attempts to create a 4th todo, sees "Session Expired" message, re-authenticates, and can continue working without losing the 3 existing todos.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an expired JWT, **When** they attempt to create a new todo, **Then** they see a "Session Expired - Please Sign In" message and are redirected to the signin page
2. **Given** a user who just re-authenticated after session expiry, **When** they return to the dashboard, **Then** all their previously created todos are still visible
3. **Given** an authenticated user idle for 1 hour (JWT expiration period), **When** they perform any API action, **Then** expired tokens trigger automatic re-authentication prompt without silent failures

---

### Edge Cases

- **What happens when a user tries to sign up with an email that already exists?** The system MUST display a user-friendly error message "Email already registered. Please sign in instead." with a link to the signin page.
- **What happens when the backend API is unreachable during todo creation?** The frontend MUST display a network error message "Unable to connect. Please check your internet connection and try again." and NOT show a generic error.
- **What happens when a user submits an empty todo title?** The frontend MUST validate client-side and show "Title is required" error without making an API call. The backend will also validate as a safety net.
- **What happens when two browser tabs have the same user signed in and one tab creates a todo?** The other tab WILL NOT automatically refresh (real-time sync is out of scope). Users must manually refresh to see changes from other sessions.
- **What happens when a user clicks "Create Todo" rapidly multiple times?** The frontend MUST disable the submit button during API calls to prevent duplicate submissions.
- **What happens when a JWT is structurally valid but expired?** The backend returns 401, and the frontend MUST detect this and redirect to signin with a "Session expired" message.
- **What happens when a user has no todos and views the dashboard?** The frontend MUST show an engaging empty state with illustration and text: "No tasks yet! Add your first todo above to get started."
- **What happens when network connectivity is lost mid-session?** All API requests will fail with network errors. The frontend MUST show a global banner "You appear to be offline. Changes will not be saved until connection is restored." and disable interactive actions.
- **What happens when a user's session expires while they have an edit form open with unsaved changes?** The system MUST immediately redirect to signin with a "Session expired" toast. Unsaved changes are lost (not preserved). This tradeoff prioritizes security and implementation simplicity.
- **What happens when a user rapidly toggles completion status on multiple todos (e.g., checking off 5 tasks quickly)?** The system MUST send parallel API requests for each toggle, with independent optimistic UI updates. No artificial queuing or delays. Each request succeeds or fails independently with its own rollback handling.

---

## Requirements

### Functional Requirements

**Authentication (Better Auth Integration)**

- **FR-001**: System MUST provide a signup form accepting email and password with client-side validation (email format, password min 8 chars)
- **FR-002**: System MUST provide a signin form accepting email and password
- **FR-003**: System MUST store the JWT provided by Better Auth securely (HttpOnly cookie or secure storage mechanism provided by Better Auth client)
- **FR-004**: System MUST include the JWT in the `Authorization: Bearer <token>` header for all FastAPI backend requests
- **FR-005**: System MUST handle Better Auth session lifecycle (login, logout, session refresh)
- **FR-006**: System MUST display a public landing page at `/` (root) for unauthenticated users with "Sign Up" and "Sign In" call-to-action buttons
- **FR-007**: System MUST redirect unauthenticated users attempting to access `/dashboard` to the signin page
- **FR-008**: System MUST redirect authenticated users accessing signin/signup pages to `/dashboard`

**Todo Management UI**

- **FR-009**: System MUST display a form to create new todos with title (required, 1-500 chars) and optional description (0-2000 chars) and optional is_completed checkbox
- **FR-010**: System MUST display all todos belonging to the authenticated user in a list view
- **FR-011**: System MUST allow users to toggle todo completion status with a single click (checkbox)
- **FR-012**: System MUST allow users to edit todo title, description, and completion status via inline editing (todo card transforms into editable form in place with Save/Cancel buttons)
- **FR-013**: System MUST allow users to delete todos with a confirmation prompt ("Are you sure you want to delete this task?")
- **FR-014**: System MUST display todos with visual distinction between completed (strikethrough text, muted color) and active tasks

**API Integration**

- **FR-015**: System MUST call `POST /api/todos` with JWT auth to create todos
- **FR-016**: System MUST call `GET /api/todos` with JWT auth to fetch user's todos on dashboard load
- **FR-017**: System MUST call `PATCH /api/todos/{id}` with JWT auth to update todos
- **FR-018**: System MUST call `DELETE /api/todos/{id}` with JWT auth to delete todos
- **FR-019**: System MUST handle 401 (Unauthorized) responses from the backend by prompting re-authentication
- **FR-020**: System MUST handle 404 (Not Found) responses from the backend by showing "Todo not found or already deleted" message
- **FR-021**: System MUST handle 422 (Validation Error) responses by displaying field-specific error messages from the backend
- **FR-022**: System MUST handle network errors (fetch failures) with user-friendly "Connection lost" messaging

**Loading & Error States**

- **FR-023**: System MUST show skeleton loaders or spinners during API calls (creating, fetching, updating, deleting todos)
- **FR-024**: System MUST show an empty state illustration when a user has zero todos
- **FR-025**: System MUST display inline error messages for form validation failures (e.g., "Title must be between 1-500 characters")
- **FR-026**: System MUST display toast notifications for successful actions ("Todo created", "Todo deleted", "Session expired")
- **FR-026a**: System MUST preserve form input when optimistic create operations fail, allowing users to retry without re-entering data

**Responsive Design**

- **FR-027**: System MUST render a mobile-optimized layout on screens < 768px wide (single column, touch-friendly buttons)
- **FR-028**: System MUST render a desktop-optimized layout on screens >= 768px wide (multi-column if applicable, hover states)

**Accessibility**

- **FR-029**: System MUST support full keyboard navigation (Tab, Enter, Escape for modals/forms)
- **FR-030**: System MUST include ARIA labels for interactive elements (buttons, form inputs, checkboxes)
- **FR-031**: System MUST maintain WCAG AA color contrast ratios (4.5:1 for normal text)

### Key Entities

- **User**: Represents an authenticated user derived from Better Auth session. Key attributes: user ID (from JWT sub claim), email, session token (JWT).
- **Todo**: Represents a task item. Key attributes: id (UUID), title (string), description (string or null), is_completed (boolean), created_at (ISO timestamp), updated_at (ISO timestamp). Each todo belongs to exactly one user (enforced by backend).
- **Session**: Represents the authenticated session state. Key attributes: JWT token, expiration time, user ID. Managed by Better Auth client library.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete signup and create their first todo in under 90 seconds from landing page
- **SC-002**: Authenticated users can view their todo list with todos loaded and rendered in under 2 seconds
- **SC-003**: Users can toggle todo completion status with immediate visual feedback (< 100ms perceived latency via optimistic update)
- **SC-004**: The application maintains responsive interactions on mobile devices with 3G network speeds (todos load within 3 seconds)
- **SC-005**: 95% of users successfully complete signin flow on first attempt without errors
- **SC-006**: Users encountering expired sessions can re-authenticate and resume work within 30 seconds without losing context (previously created todos remain visible)

---

## UX & Visual Design Goals

### Design Principles

- **Modern & Engaging**: Use contemporary design patterns (cards, smooth animations, thoughtful color palette, friendly micro-interactions)
- **Minimalist Focus**: Clean interface with ample whitespace, focusing user attention on the todo list without distractions
- **Delight in Details**: Micro-interactions for todo completion (checkmark animation), success toasts with icons, smooth transitions

### Visual Style

- **Color Palette**: Modern professional theme with navy blue / dark blue as primary color
  - **Primary**: Navy blue (#1E3A8A or similar dark blue) for headers, primary buttons, focus states
  - **Accent**: Complementary color for success states (e.g., teal #14B8A6 for completed todos, green #10B981 for success toasts)
  - **Neutrals**: Light grays for backgrounds (#F9FAFB), dark gray for text (#1F2937)
  - **Semantic**: Red (#EF4444) for delete/danger actions, amber (#F59E0B) for warnings
  - **Overall feel**: Professional, modern, calming productivity theme with strong visual hierarchy

- **Typography**: Sans-serif font stack for readability (Inter, SF Pro, system fonts). Headings: bold 24-32px, body text: regular 16px, small text: 14px
- **Spacing**: 8px grid system for consistent spacing (8px, 16px, 24px, 32px, 48px)
- **Shadows**: Subtle elevation with soft shadows for cards and modals to create depth without heaviness

### Component Design

- **Todo Cards**: Each todo displayed as a card with checkbox, title, description preview, and action buttons (edit, delete). When edit button clicked, card transforms into inline editable form with input fields for title/description, Save (primary) and Cancel (secondary) buttons. Clicking Cancel or Save restores card view.
- **Forms**: Floating labels, clear focus states (blue outline), inline validation errors below fields
- **Buttons**: Primary action (solid color, white text), secondary action (outline style), danger action (red for delete)
- **Empty States**: Illustrated empty state (simple SVG icon + friendly text) when user has no todos
- **Loading States**: Skeleton screens matching todo card layout during data fetch, spinner for button actions

### Responsive Breakpoints

- **Mobile**: < 768px (single column, stacked layout, full-width cards, bottom-sheet modals)
- **Tablet**: 768px - 1024px (two-column if space permits, side-by-side forms)
- **Desktop**: >= 1024px (centered max-width container ~1200px, multi-column layout for large lists)

### Accessibility Standards

- **Keyboard Navigation**: All interactive elements accessible via Tab, Enter to activate, Escape to dismiss modals
- **Focus Indicators**: Clear focus rings (2px blue outline) on all interactive elements
- **ARIA Labels**: Descriptive labels for screen readers ("Mark todo as complete", "Edit todo titled X", "Delete todo titled X")
- **Color Contrast**: WCAG AA compliance (4.5:1 for normal text, 3:1 for large text/UI components)
- **Semantic HTML**: Proper heading hierarchy (h1 for page title, h2 for section titles), button elements for actions, form labels

---

## Non-Functional Requirements

### Performance

- **NFR-001**: Initial page load (unauthenticated homepage) MUST complete in under 2 seconds on 4G connection
- **NFR-002**: Authenticated dashboard with todo list MUST load and render within 3 seconds on 3G connection
- **NFR-003**: Todo creation, update, and deletion actions MUST provide immediate optimistic UI updates (perceived < 100ms) with background API sync
- **NFR-004**: Bundle size MUST be optimized with code splitting (< 200KB initial JS bundle, lazy-load non-critical components)
- **NFR-005**: Images and icons MUST use next/image for automatic optimization and lazy loading

### Error Handling UX

- **NFR-006**: Network failures MUST display user-friendly messages without technical jargon (avoid exposing stack traces or API errors)
- **NFR-007**: Form validation errors MUST appear inline below the relevant field with clear instructions ("Title must be at least 1 character")
- **NFR-008**: Global errors (auth failures, backend down) MUST show toast notifications with actionable guidance ("Unable to connect. Check your internet connection.")
- **NFR-009**: API 401 errors MUST trigger automatic redirect to signin page with session expiry message
- **NFR-010**: API 5xx errors MUST display generic "Something went wrong. Please try again." with retry button

### Security (Client-Side)

- **NFR-011**: JWT tokens MUST be stored securely (HttpOnly cookies via Better Auth or secure storage, NOT localStorage)
- **NFR-012**: Sensitive data (user email, tokens) MUST NOT be logged to browser console in production builds
- **NFR-013**: API requests MUST use HTTPS in production (enforced at deployment level)
- **NFR-014**: CORS configuration MUST be properly configured on backend to prevent unauthorized origins
- **NFR-015**: No sensitive business logic (validation rules, pricing) MUST be implemented solely on frontend (backend is authority)

---

## Integration Contract

### JWT Acquisition from Better Auth

- **Better Auth Client Library**: Use `better-auth` npm package to handle authentication flows
- **JWT Issuance**: After successful signin/signup, Better Auth automatically issues a JWT and manages it via cookies or session storage
- **JWT Access**: Use Better Auth's `useSession()` hook (or equivalent) to access the current JWT for API requests
- **Token Format**: JWT contains `sub` claim (user ID), `exp` claim (expiration timestamp), and is signed with RS256 by Better Auth
- **Token Expiration**: JWTs expire after 1 hour (3600 seconds). Users idle beyond this period must re-authenticate when attempting API operations.

### Attaching JWT to API Requests

- **Header Format**: `Authorization: Bearer <jwt_token>`
- **Automatic Injection**: Create a custom fetch wrapper or axios interceptor that:
  1. Retrieves JWT from Better Auth session
  2. Adds `Authorization` header to all requests to `BACKEND_API_URL`
  3. Handles missing token by redirecting to signin

```typescript
// Example pseudo-code
async function authenticatedFetch(url, options) {
  const session = await getSession(); // Better Auth function
  if (!session?.accessToken) {
    redirectToSignin();
    throw new Error("No active session");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });
}
```

### API Error Handling Patterns

| Status Code | Frontend Action | User-Facing Message |
| ----------- | --------------- | ------------------- |
| 200/201/204 | Success - update UI with response data | Toast: "Todo created" / "Todo updated" / "Todo deleted" |
| 401         | Session expired - redirect to signin | "Your session has expired. Please sign in again." |
| 404         | Resource not found - show inline error | "Todo not found. It may have been deleted." |
| 422         | Validation error - show field errors | "Title must be between 1-500 characters" (from backend response) |
| 500/503     | Server error - show retry option | "Something went wrong. Please try again." + Retry button |
| Network err | Connection lost - show offline state | "You appear to be offline. Check your connection." |

### Expected Backend Response Formats

**Success - Todo Object**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy milk",
  "description": "Organic whole milk from Trader Joe's",
  "is_completed": false,
  "created_at": "2026-02-07T14:30:00Z",
  "updated_at": "2026-02-07T14:30:00Z"
}
```

**Success - Todo List**:
```json
[
  { "id": "...", "title": "...", "description": "...", "is_completed": false, "created_at": "...", "updated_at": "..." },
  { "id": "...", "title": "...", "description": null, "is_completed": true, "created_at": "...", "updated_at": "..." }
]
```

**Error - Validation (422)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

**Error - Generic (401/404/500)**:
```json
{
  "detail": "Could not validate credentials"
}
```

---

## State Management Strategy

### Auth State

- **Library**: Better Auth's built-in session management via `better-auth` client
- **Storage**: JWTs stored in HttpOnly cookies managed by Better Auth (frontend doesn't manually handle token storage)
- **Access Pattern**: Use Better Auth's `useSession()` hook to access current user state (user ID, email, token)
- **State Shape**:
  ```typescript
  {
    user: { id: string, email: string } | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    accessToken: string | null // JWT for API requests
  }
  ```
- **Updates**: Better Auth handles automatic token refresh and session expiration

### Task State

- **Library**: React Query / TanStack Query (`@tanstack/react-query`)
  - **Rationale**: Automatic caching, refetching, optimistic updates, minimal boilerplate, industry standard for data fetching and server-state management
  - **Features Used**: `useQuery` for fetching todos, `useMutation` for create/update/delete with automatic cache invalidation and optimistic updates
  - **Provider Setup**: Wrap app with `<QueryClientProvider>` at root layout level

- **State Shape** (regardless of library):
  ```typescript
  {
    todos: Todo[], // Array of todo objects
    isLoading: boolean, // True during API fetch
    error: string | null, // Error message if fetch fails
    filter: 'all' | 'active' | 'completed', // Current filter (P3 feature)
    sortBy: 'date' | 'alpha' // Current sort order (P3 feature)
  }
  ```

- **CRUD Operations**:
  - **Fetch Todos**: On dashboard mount, call `GET /api/todos`, store in state
  - **Create Todo**: Optimistically add to local state, call `POST /api/todos`, rollback on failure (remove optimistic todo from list, preserve form input, show error toast)
  - **Update Todo**: Optimistically update local state, call `PATCH /api/todos/{id}`, rollback on failure (revert to previous state, show error toast)
  - **Delete Todo**: Optimistically remove from local state, call `DELETE /api/todos/{id}`, rollback on failure (restore deleted todo, show error toast)

### Optimistic Updates

- **Pattern**: Update UI immediately on user action, then sync with backend in background
- **Parallel Requests**: Multiple rapid updates (e.g., checking off 5 todos in quick succession) send parallel API requests, each with independent optimistic UI update and rollback handling. No artificial queuing or debouncing.
- **Rollback on Failure**:
  - If API call fails, revert UI change and show error toast
  - For create operations: Remove optimistic todo from list, preserve form input so user can retry without re-typing
  - For update/delete operations: Restore previous state
- **Example**: User clicks checkbox to mark todo complete → UI shows strikethrough immediately → API call in background → if 401, rollback to unchecked state + show "Session expired" toast

---

## Failure Modes & Edge Cases

### Expired JWT

- **Detection**: Backend returns 401 with `{"detail": "Token has expired"}`
- **Frontend Action**:
  1. Detect 401 response
  2. Clear Better Auth session
  3. Show toast: "Your session has expired. Redirecting to signin..."
  4. Redirect to `/signin` after 2-second delay (any unsaved edits in progress are lost)
  5. After re-signin, redirect user back to dashboard
- **Note**: Unsaved changes in open edit forms are NOT preserved during session expiration. This prioritizes security and simplicity over draft recovery.

### Unauthorized Responses (401/403)

- **401 (Unauthenticated)**: JWT missing, invalid, or expired → Clear session, redirect to signin
- **403 (Forbidden)**: User lacks permission → Show error "You don't have access to this resource" (unlikely in single-user todo app, but handle gracefully)

### Backend Downtime

- **Detection**: Network error (fetch failure) or 500/503 response
- **Frontend Action**:
  1. Show global error banner: "Unable to connect to server. Your changes may not be saved."
  2. Disable all mutating actions (create, update, delete buttons)
  3. Allow read-only viewing of locally cached todos (if any)
  4. Show "Retry" button that attempts to reconnect
  5. After 3 failed retries, show "Server is down. Please try again later."

### Partial Data Loads

- **Scenario**: User has 100 todos, but API returns 500 error halfway through fetch
- **Frontend Action**:
  1. Show error toast: "Could not load all todos. Some tasks may be missing."
  2. Display whatever todos were successfully loaded (if any)
  3. Show "Retry" button to attempt full fetch again
  4. Do NOT show empty state if partial data exists

### Concurrent Edits (Multiple Browser Tabs)

- **Scenario**: User has app open in 2 tabs, edits same todo in both tabs
- **Expected Behavior**: Last write wins (backend enforces). Frontend does NOT sync across tabs automatically.
- **User Impact**: User may see stale data in one tab until they manually refresh
- **Mitigation** (Future Enhancement): Use BroadcastChannel API or WebSockets for real-time sync (out of scope for MVP)

### Rapid Button Clicks (Duplicate Submissions)

- **Mitigation**: Disable submit buttons during API calls (add `disabled` attribute + loading spinner)
- **Implementation**: Track `isSubmitting` state, set to `true` on click, reset to `false` on API response/error

---

## Assumptions & Constraints

### Assumptions

1. **Backend API is stable and deployed**: The FastAPI backend at `BACKEND_API_URL` is accessible and implements the documented contract
2. **Better Auth is configured**: Better Auth is set up with JWKS endpoint, issues RS256 JWTs with `sub` claim containing user ID
3. **Single-tenant application**: Each user sees only their own todos; no shared lists or collaboration features
4. **No offline mode**: Application requires internet connectivity; no local-first sync or offline editing
5. **Modern browser support**: Target browsers support ES2020+ (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
6. **HTTPS in production**: Production deployment uses HTTPS for all traffic (JWTs transmitted securely)
7. **No real-time updates**: Todos do not sync automatically across tabs/devices; users must refresh to see changes from other sessions

### Constraints

1. **Backend API contract is frozen**: Frontend must adapt to existing endpoints; cannot change backend request/response shapes
2. **Better Auth for authentication**: Cannot use custom auth solution; must use Better Auth's client library and flows
3. **No server-side rendering of authenticated content**: App Router pages use client-side data fetching for todos (authenticated API calls cannot happen in RSC)
4. **JWT in cookies**: JWTs managed by Better Auth via HttpOnly cookies; frontend cannot access token directly via JavaScript (security constraint)
5. **No direct database access**: All data operations go through FastAPI REST API
6. **Responsive design required**: Must work on mobile, tablet, and desktop without separate codebases
7. **Accessibility compliance**: Must meet WCAG 2.1 AA standards for color contrast and keyboard navigation

---

## Dependencies

### External Systems

- **FastAPI Backend**: `BACKEND_API_URL` (e.g., `http://localhost:8000` or production URL)
  - Endpoints: POST/GET/PATCH/DELETE `/api/todos`, GET `/api/health`
  - Authentication: JWT Bearer tokens verified via JWKS
  - Owned by: Backend team (already implemented per `specs/001-todo-backend-api/`)

- **Better Auth**: Authentication provider (self-hosted or cloud)
  - JWKS endpoint: `BETTER_AUTH_URL/api/auth/jwks`
  - Signin/Signup/Session management
  - JWT issuance with RS256 signing
  - Owned by: Better Auth service (configured by frontend team)

### Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: [To be determined during planning - options: Tailwind CSS, CSS Modules, styled-components]
- **Auth Library**: `better-auth` npm package
- **HTTP Client**: Native `fetch` or `axios`
- **State Management**: `@tanstack/react-query` for server-state (todos), React hooks for UI state
- **Form Handling**: [To be determined during planning - options: React Hook Form, Formik, or native]

---

## Clarifications Needed

**All critical clarifications resolved!** ✅

**Resolved via /sp.clarify sessions (2026-02-07)**:
- ✅ **JWT Expiration Duration**: 1 hour (3600 seconds) - balances security with UX
- ✅ **State Management Library**: React Query / TanStack Query - automatic caching and optimistic updates
- ✅ **Color Palette**: Navy blue / dark blue theme with complementary accents
- ✅ **Homepage behavior**: Public landing page at `/` with Sign Up/Sign In CTAs
- ✅ **Optimistic update rollback**: Show error toast, rollback UI, preserve form input for retry
- ✅ **Edit UI pattern**: Inline edit (card transforms into editable form with Save/Cancel)
- ✅ **Session expiry handling**: Immediate redirect to signin, unsaved changes lost
- ✅ **Parallel requests**: Send all requests in parallel with independent optimistic updates

**Specification is now ready for `/sp.plan`** to generate the technical implementation plan.
