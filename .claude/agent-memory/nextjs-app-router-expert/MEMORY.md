# Next.js App Router Expert - Memory

## Better Auth Integration (Updated: 2026-02-07)

### Critical: Use React Client for Hooks
**Issue**: Better Auth has two client packages:
- `better-auth/client` - Base client (vanilla JS)
- `better-auth/react` - React client with hooks

**Solution**: Always use `better-auth/react` for Next.js App Router projects that need hooks like `useSession()`.

```typescript
// ✅ Correct for React hooks
import { createAuthClient } from 'better-auth/react'

// ❌ Wrong - no hook support
import { createAuthClient } from 'better-auth/client'
```

**Verified via**: https://www.better-auth.com/docs/concepts/client (2026-02-07)

### useSession Hook Pattern
```typescript
const { data: session, isPending, error, refetch } = useSession()

// Always check isPending before accessing session
if (isPending) return <Loading />
if (!session) return <Redirect to="/signin" />
```

## Next.js 16 Compliance

### useSearchParams Requires Suspense Boundary
**Issue**: Next.js 16 throws error if `useSearchParams()` is not wrapped in `<Suspense>`

**Pattern**:
```typescript
'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function FormContent() {
  const searchParams = useSearchParams() // OK inside Suspense
  // ...
}

export function Form() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContent />
    </Suspense>
  )
}
```

## React Hook Form + Zod Type Issues

### Optional Fields with Default Values
**Issue**: When using `defaultValues` with optional Zod fields, TypeScript can infer incorrect types.

**Solution**: Cast `defaultValues` instead of using generic type parameter:
```typescript
// ❌ Type error with optional fields
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { optional_field: false }
})

// ✅ Works correctly
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { optional_field: false } as FormData
})
```

### Zod Schema for Optional Booleans
```typescript
const schema = z.object({
  is_completed: z.boolean().optional().default(false)
})
```

## Server/Client Component Decisions

### Auth Pages
- **Auth forms**: Client components (need hooks: `useForm`, `useState`, `useRouter`)
- **Auth layout**: Server component (no interactivity)
- **Auth pages**: Server component (render client form components)

### Dashboard
- **Dashboard page**: Client component (needs `useSession` hook for auth guard)
- **Alternative**: Could be server component with client-only auth guard component

### Todo Components
- **TodoForm**: Client component (form state, mutations)
- **TodoList**: Client component (data fetching with `useTodos` hook)
- **TodoItem**: Client component (will need interactivity in Phase 4)
- **EmptyState**: Could be server component (no interactivity) but kept client for consistency

## Optimistic Updates Pattern

All mutations use consistent pattern from `react-query-hooks.ts`:
1. `onMutate`: Cancel queries, snapshot previous state, apply optimistic update
2. `onError`: Rollback to snapshot, show toast (form input preserved)
3. `onSuccess`: Replace optimistic data with server data, show success toast
4. `onSettled`: Invalidate queries to ensure consistency

**Form doesn't clear on error** - user can retry without re-typing.

## Project Structure Patterns

### Route Groups
Use `(name)` syntax for layout-only grouping without affecting URL:
- `app/(auth)/layout.tsx` - Auth pages layout
- `app/(auth)/signin/page.tsx` - URL: `/signin` (not `/auth/signin`)

### Component Organization
```
components/
├── auth/         # Auth-specific components
├── todos/        # Feature components
└── ui/           # Reusable primitives (Button, Input, Card)
```

## Common Pitfalls Avoided

1. **Don't access window/localStorage during render** in client components - causes hydration mismatch
2. **Don't use `<Link>` as parent of `<Button>`** - renders nested buttons (invalid HTML)
3. **Always provide `alt` text** for images (or `alt=""` for decorative)
4. **Use semantic HTML** - `<main>`, `<nav>`, `<article>`, not just `<div>`
5. **Associate labels with inputs** - use `htmlFor` matching input `id`

## Build Optimizations

- Keep `'use client'` boundary as deep as possible in component tree
- Server components for static/data-heavy content
- Client components only for interactivity
- Use `next/dynamic` for heavy client components (future optimization)

## Environment Variables

- `NEXT_PUBLIC_*` prefix for client-side access
- Non-prefixed for server-side only
- Always validate at startup (throw error if missing critical vars)

## Inline Editing Pattern (Phase 4 - US2)

### Component State Toggle for Edit Mode
**Pattern**: Use local state to toggle between display and edit views within same component.

```typescript
const [isEditing, setIsEditing] = useState(false)

if (isEditing) {
  return <EditForm onCancel={() => setIsEditing(false)} onSaveSuccess={() => setIsEditing(false)} />
}

return <DisplayView onEdit={() => setIsEditing(true)} />
```

**Benefits**:
- No modal needed for MVP
- Simpler UX - no context switch
- Inline editing feels lightweight
- Less code than modal approach

### Edit Form Error Handling
**Decision**: Keep form open on save failure, not close it.

**Rationale**:
- User doesn't lose their edits
- Can retry immediately without re-typing
- Clear feedback via toast
- Better UX than clearing form

**Implementation**:
```typescript
try {
  await mutation.mutateAsync(data)
  onSaveSuccess() // Close form on success
} catch (error) {
  // Error handled by mutation (rollback + toast)
  // Form stays open - user can retry
}
```

## Visual Feedback for State Changes

### Completion Indicators
Use **multiple visual cues** for accessibility:
1. Strikethrough text (`line-through`)
2. Muted color (`text-gray-400`)
3. Icon indicator (checkmark)
4. Text label ("Completed")
5. Smooth transitions (`transition-all duration-200`)

**Accessibility**: Multiple cues ensure users with different abilities can perceive state.

### Checkbox Interaction Feedback
- **Default**: Teal text color for checked state
- **Hover**: Teal border on hover
- **Loading**: `cursor-wait` + disabled state
- **Focus**: Teal focus ring
- **Transition**: Smooth 150ms transition

## React Query Mutation Patterns

### Toggle Mutation (No Success Toast)
For rapid interactions (checkbox toggle), **skip success toast** to avoid noise:

```typescript
onSuccess: (serverTodo) => {
  // Update cache
  // NO toast - too noisy for rapid clicks
}
```

**When to skip toast**: Toggles, drag-drop, rapid actions
**When to show toast**: Create, update, delete - one-time actions

## Delete Feature Pattern (Phase 5 - US3)

### Native Confirmation Dialog
**Decision**: Use `window.confirm()` for MVP instead of custom modal.

**Rationale**:
- Simpler implementation (no modal component needed)
- Keyboard accessible by default
- No bundle size increase
- Meets all MVP requirements
- Can upgrade to custom modal later if needed

**Pattern**:
```typescript
const handleDeleteClick = async () => {
  const confirmed = window.confirm('Are you sure you want to delete this task?')
  if (!confirmed) return // User cancelled

  await deleteTodo.mutateAsync(todo.id)
}
```

### Spinner Component
Reusable loading indicator with variants:
- Small (4x4), Medium (6x6), Large (8x8)
- Navy blue color (--color-primary)
- Accessible with aria-label and role="status"

## Global 401 Error Handling (Phase 6 - US5)

### Session Expiry Handler Location
**Location**: `app/providers.tsx` (QueryClient defaultOptions)

**Critical Pattern**:
```typescript
mutations: {
  onError: (error: any) => {
    if (error instanceof ApiClientError && error.status === 401) {
      handleSessionExpiry()
    }
  },
}
```

### Session Expiry Flow
1. Detect 401 in global mutation error handler
2. Clear Better Auth session: `authClient.signOut()`
3. Clear React Query cache: `browserQueryClient.clear()`
4. Show warning toast (5 second duration)
5. Redirect: `window.location.href = '/signin'`

### Why window.location.href (NOT Next.js router)?
**Decision**: Use `window.location.href` for session expiry redirects.

**Rationale**:
- Global handler runs outside React component context
- Guarantees full page reload → ensures clean state
- No risk of stale client state (cached components, hooks, etc.)
- Critical security redirects should be hard redirects

**When to use Next.js router**: Normal navigation within authenticated session
**When to use window.location.href**: Session expiry, logout, critical security redirects

### Why Warning Toast (Not Error)?
Session expiry is **expected behavior**, not an error:
- Less alarming to users
- Clear guidance: "Please sign in again"
- 5 second duration for adequate reading time

## Related Files
- See `phase5-phase6-implementation.md` for detailed US3 & US5 notes
- See `frontend/PHASE3_COMPLETE.md` for US1 implementation details
- See `frontend/PHASE4_COMPLETE.md` for US2 implementation details
- See `specs/002-todo-frontend/plan.md` for architecture decisions
