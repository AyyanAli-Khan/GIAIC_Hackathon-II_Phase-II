# Data Model: Todo Frontend Web Application

**Branch**: `002-todo-frontend` | **Date**: 2026-02-07

## Client-Side Entities

### User (Auth State)

Represents an authenticated user derived from Better Auth session.

**TypeScript Interface**:

```typescript
interface User {
  id: string           // User ID from JWT sub claim
  email: string        // User email address
  name?: string        // Optional display name
}

interface AuthSession {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null  // JWT for API requests
}
```

**Source**: Better Auth session object via `authClient.useSession()`

**State Management**: Managed by Better Auth client library

**Persistence**: HttpOnly cookie (managed by Better Auth, not directly accessible via JavaScript)

---

### Todo (Task Item)

Represents a task in the user's todo list.

**TypeScript Interface**:

```typescript
interface Todo {
  id: string                    // UUID from backend
  title: string                 // Task title (1-500 chars)
  description: string | null    // Optional description (0-2000 chars)
  is_completed: boolean         // Completion status
  created_at: string            // ISO 8601 timestamp
  updated_at: string            // ISO 8601 timestamp
}

// Request schemas
interface TodoCreateRequest {
  title: string
  description?: string | null
  is_completed?: boolean        // Default: false
}

interface TodoUpdateRequest {
  title?: string
  description?: string | null
  is_completed?: boolean
}
```

**Validation Rules** (Client-Side):

| Field | Rule |
|-------|------|
| title | Required, 1-500 characters, trimmed |
| description | Optional, 0-2000 characters, nullable |
| is_completed | Boolean, default false |

**Source**: Fetched from FastAPI backend `GET /api/todos`

**State Management**: React Query (TanStack Query)

**Cache Key Structure**:

```typescript
// List of todos
['todos'] -> Todo[]

// Individual todo (for updates/deletes)
['todos', todoId] -> Todo

// Filtered todos (P3 feature)
['todos', { filter: 'active' | 'completed' | 'all' }] -> Todo[]
```

---

### TodoListState (UI State)

Represents the UI state for the todo list view.

**TypeScript Interface**:

```typescript
interface TodoListState {
  todos: Todo[]                 // Array of todo objects
  isLoading: boolean            // True during initial fetch
  error: string | null          // Error message if fetch fails
  filter: 'all' | 'active' | 'completed'  // Current filter (P3)
  sortBy: 'date' | 'alpha'      // Current sort order (P3)
}

// Mutation states (independent per operation)
interface TodoMutationState {
  isPending: boolean            // Mutation in progress
  isError: boolean              // Mutation failed
  isSuccess: boolean            // Mutation succeeded
  error: Error | null           // Error object
}
```

**State Management**: React Query handles todos, mutations, loading, and error states automatically

**Local UI State** (not persisted):
- Form input values (managed by React Hook Form or useState)
- Modal open/closed states
- Filter/sort preferences (could be stored in localStorage for persistence)

---

## State Transitions

### Todo Lifecycle

```
[User Action]           [Optimistic UI]        [API Call]           [Final State]
────────────────────────────────────────────────────────────────────────────────
Create Todo        →    Add to list (temp ID) → POST /api/todos  → Replace with server todo
                                                ↓ (on error)
                                                Remove from list, preserve input

Update Todo        →    Update in list        → PATCH /api/todos/{id} → Confirm update
                                                ↓ (on error)
                                                Revert to previous state

Delete Todo        →    Remove from list      → DELETE /api/todos/{id} → Confirm deletion
                                                ↓ (on error)
                                                Restore to list

Toggle Complete    →    Update is_completed   → PATCH /api/todos/{id} → Confirm toggle
                                                ↓ (on error)
                                                Revert toggle
```

### Auth State Transitions

```
[Initial State]    →    [User Action]         →    [Resulting State]
─────────────────────────────────────────────────────────────────────
Unauthenticated    →    Sign Up (valid)       →    Authenticated (redirect to /dashboard)
Unauthenticated    →    Sign In (valid)       →    Authenticated (redirect to /dashboard)
Authenticated      →    Logout                →    Unauthenticated (redirect to /)
Authenticated      →    Token Expires         →    Unauthenticated (redirect to /signin, show toast)
Authenticated      →    401 Response          →    Unauthenticated (clear session, redirect to /signin)
```

---

## API Response Mapping

### Success Responses

**GET /api/todos** → `Todo[]`

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy milk",
    "description": "Organic whole milk",
    "is_completed": false,
    "created_at": "2026-02-07T14:30:00Z",
    "updated_at": "2026-02-07T14:30:00Z"
  }
]
```

**POST /api/todos** → `Todo`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy milk",
  "description": null,
  "is_completed": false,
  "created_at": "2026-02-07T14:30:00Z",
  "updated_at": "2026-02-07T14:30:00Z"
}
```

**PATCH /api/todos/{id}** → `Todo`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy organic milk",
  "description": "From Trader Joe's",
  "is_completed": true,
  "created_at": "2026-02-07T14:30:00Z",
  "updated_at": "2026-02-07T15:45:00Z"
}
```

**DELETE /api/todos/{id}** → `204 No Content` (empty response)

### Error Responses

**422 Validation Error** → Field-specific errors

```typescript
interface ValidationError {
  detail: Array<{
    loc: string[]       // ["body", "title"]
    msg: string         // "ensure this value has at least 1 characters"
    type: string        // "value_error.any_str.min_length"
  }>
}

// Frontend mapping
const fieldErrors = response.detail.reduce((acc, err) => {
  const field = err.loc[err.loc.length - 1]  // "title"
  acc[field] = err.msg
  return acc
}, {})

// Display: { title: "ensure this value has at least 1 characters" }
```

**401 Unauthorized** → Session expired

```typescript
interface UnauthorizedError {
  detail: string  // "Could not validate credentials" or "Token has expired"
}

// Frontend action: Clear session, redirect to /signin, show toast
```

**404 Not Found** → Todo deleted

```typescript
interface NotFoundError {
  detail: string  // "Todo not found"
}

// Frontend action: Show inline error "Todo not found. It may have been deleted."
```

**500/503 Server Error** → Generic error

```typescript
interface ServerError {
  detail: string  // "Internal server error"
}

// Frontend action: Show retry option "Something went wrong. Please try again."
```

---

## Data Flow Patterns

### Optimistic Update Flow (Create Todo)

```typescript
const createTodoMutation = useMutation({
  mutationFn: (newTodo: TodoCreateRequest) =>
    fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    }).then(res => res.json()),

  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

    // Optimistic update: add temp todo
    const optimisticTodo: Todo = {
      id: `temp-${Date.now()}`,
      title: newTodo.title,
      description: newTodo.description || null,
      is_completed: newTodo.is_completed || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      [optimisticTodo, ...(old || [])]
    )

    return { previousTodos, optimisticTodo }
  },

  onError: (err, newTodo, context) => {
    // Rollback: restore previous state
    queryClient.setQueryData(['todos'], context.previousTodos)
    // Preserve form input in component state (not cleared)
    toast.error('Failed to create todo. Please try again.')
  },

  onSuccess: (serverTodo, variables, context) => {
    // Replace optimistic todo with server todo
    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      old?.map(t => t.id === context.optimisticTodo.id ? serverTodo : t) || []
    )
    toast.success('Todo created')
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### Parallel Mutations (Rapid Updates)

```typescript
// Each useMutation hook has independent state
const toggleMutation1 = useMutation({ mutationFn: updateTodo })
const toggleMutation2 = useMutation({ mutationFn: updateTodo })
const toggleMutation3 = useMutation({ mutationFn: updateTodo })

// User rapidly clicks 3 checkboxes
toggleMutation1.mutate({ id: 'todo-1', is_completed: true })  // Parallel request 1
toggleMutation2.mutate({ id: 'todo-2', is_completed: true })  // Parallel request 2
toggleMutation3.mutate({ id: 'todo-3', is_completed: true })  // Parallel request 3

// Each mutation:
// - Has its own isPending state
// - Updates UI optimistically
// - Rolls back independently on failure
// - No queuing or artificial delays
```

---

## Validation Strategy

### Client-Side Validation (Pre-Submit)

```typescript
// Using React Hook Form + Zod
import { z } from 'zod'

const todoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .optional(),
  is_completed: z.boolean().default(false),
})

type TodoFormData = z.infer<typeof todoSchema>

const { register, handleSubmit, formState: { errors } } = useForm<TodoFormData>({
  resolver: zodResolver(todoSchema),
})
```

**Inline Error Display**:

```tsx
<input {...register('title')} />
{errors.title && (
  <p className="text-semantic-error text-sm mt-1">{errors.title.message}</p>
)}
```

### Server-Side Validation (Backend Authority)

Backend validates all requests and returns 422 errors for invalid data. Frontend displays these errors inline:

```typescript
const onError = (error: any) => {
  if (error.status === 422) {
    const fieldErrors = parseValidationErrors(error.detail)
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field, { message })
    })
  }
}
```

**Principle**: Client-side validation improves UX (immediate feedback), but server-side validation is the source of truth.

---

## Caching Strategy

### React Query Cache Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 60 seconds - data considered fresh
      gcTime: 5 * 60 * 1000,          // 5 minutes - cache garbage collection
      retry: 3,                        // Retry failed queries 3 times
      refetchOnWindowFocus: true,     // Refetch when user returns to tab
      refetchOnReconnect: true,       // Refetch after network reconnection
    },
    mutations: {
      retry: 3,                        // Retry failed mutations 3 times
    },
  },
})
```

### Cache Invalidation Triggers

| Event | Invalidation Strategy |
|-------|----------------------|
| Todo Created | Invalidate `['todos']` to refetch full list |
| Todo Updated | Invalidate `['todos', todoId]` and `['todos']` |
| Todo Deleted | Invalidate `['todos']` to refetch full list |
| User Signs Out | Clear all queries: `queryClient.clear()` |
| 401 Response | Clear all queries and redirect |

### Cache Persistence (Optional Enhancement)

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})
```

**Not implemented in MVP** - requires careful consideration of stale data vs offline UX.

---

## Summary

**Frontend entities mirror backend models** with TypeScript type safety:
- User (auth session)
- Todo (task item)
- TodoListState (UI state)

**State management**: React Query for server state, Better Auth for auth state, local useState for transient UI state.

**Optimistic updates**: All mutations update UI immediately, then sync with backend in background with automatic rollback on failure.

**Validation**: Client-side for UX, server-side as source of truth.

**Caching**: 60-second stale time, automatic background refetching, manual invalidation on mutations.
