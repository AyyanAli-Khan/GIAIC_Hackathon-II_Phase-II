# Research: Todo Frontend Web Application

**Feature Branch**: `002-todo-frontend` | **Date**: 2026-02-07

## Research Questions & Decisions

### 1. JWT Expiration Duration

**Question**: What is the optimal JWT access token expiration time for a todo/productivity web application?

**Decision**: **15 minutes** for access tokens, **7 days** for refresh tokens

**Rationale**:
- Industry best practice for web applications is 15-60 minutes for access tokens
- 15 minutes balances security (minimizes stolen token exploitation window) with user experience
- Productivity apps should prioritize security without requiring constant re-authentication
- Refresh token strategy (7 days) allows users to stay signed in for a week while maintaining short-lived access tokens

**Alternatives Considered**:
- **5 minutes**: Too aggressive for productivity apps, would interrupt user flow
- **1 hour**: Acceptable but larger attack surface for token theft
- **24 hours**: Too long, violates security best practices

**Configuration**:
```typescript
// Better Auth configuration
session: {
  expiresIn: 60 * 60 * 24 * 7,    // 7 days (refresh token)
  updateAge: 60 * 60 * 24,         // 1 day (session extension threshold)
}

// JWT tokens (if manually configured)
accessToken: 60 * 15,              // 15 minutes (900 seconds)
refreshToken: 60 * 60 * 24 * 7,    // 7 days
```

**Sources**: JWT Security Best Practices (Curity), Auth0 Token Best Practices, Zuplo Learning Center

---

### 2. State Management Library: React Query (TanStack Query)

**Question**: Which state management library should handle todo state and API data fetching?

**Decision**: **React Query (TanStack Query) v5**

**Rationale**:
- Industry standard for server state management in React applications
- Built-in support for optimistic updates with automatic rollback
- Automatic caching, refetching, and request deduplication
- Parallel mutations with independent state (perfect for rapid todo updates)
- Minimal boilerplate compared to Zustand or Context
- Excellent Next.js App Router integration with SSR support
- Active maintenance and comprehensive documentation

**Alternatives Considered**:
- **Zustand**: Good for global client state, but lacks built-in API orchestration features
- **React Context + useState**: Too much boilerplate, no caching or optimistic updates
- **SWR**: Similar to React Query but less feature-rich for mutations

**Next.js 16 App Router Integration Pattern**:

```typescript
// app/providers.tsx (Client Component)
'use client'

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds (prevents immediate refetch on hydration)
        retry: 3,
      },
      mutations: {
        retry: 3,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient() // Server: always new client
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient // Browser: singleton
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// app/layout.tsx (Server Component)
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Optimistic Updates with Rollback Pattern**:

```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: updateTodo,

  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id])
    queryClient.setQueryData(['todos', newTodo.id], newTodo)
    return { previousTodo, newTodo }
  },

  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos', context.newTodo.id], context.previousTodo)
  },

  onSettled: (newTodo) => {
    queryClient.invalidateQueries({ queryKey: ['todos', newTodo.id] })
  },
})
```

**Parallel Mutations** (for rapid updates):
- Each `useMutation` hook maintains independent state
- No artificial queuing needed
- Each request succeeds or fails independently with its own rollback

**Sources**: TanStack Query v5 Documentation, Next.js App Router + React Query Integration Guide

---

### 3. Better Auth Integration with Next.js 16

**Question**: How should Better Auth be integrated with Next.js 16 App Router for JWT-based authentication?

**Decision**: Better Auth with `nextCookies()` plugin, client-side session hooks, and middleware for route protection

**Configuration**:

```typescript
// lib/auth.ts (Server)
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: {
    // Database config
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // 1 day
  },
  plugins: [
    nextCookies() // MUST be last plugin
  ]
})

// lib/auth-client.ts (Client)
import { createAuthClient } from "better-auth/client"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    jwtClient() // Enables JWT token retrieval
  ]
})
```

**JWT Token Access for API Requests**:

```typescript
const { data, error } = await authClient.token()
if (data) {
  const jwtToken = data.token
  // Attach to API requests: Authorization: Bearer ${jwtToken}
}
```

**Client-Side Route Protection**:

```typescript
"use client"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { data, error, isPending } = authClient.useSession()

  if (isPending) return <div>Loading...</div>
  if (!data || error) redirect("/sign-in")

  return <div>Welcome {data.user.name}</div>
}
```

**Middleware Pattern** (Cookie-based):

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"]
}
```

**HttpOnly Cookie Security**:
- `httpOnly: true` - Prevents XSS attacks
- `secure: true` - HTTPS-only transmission
- `sameSite: 'lax'` - CSRF protection
- Managed automatically by Better Auth

**Sources**: Better Auth Official Documentation, Next.js 16 Authentication Patterns

---

### 4. Styling: Tailwind CSS 4

**Question**: Is Tailwind CSS 4 stable for production use with Next.js 16 in 2026?

**Decision**: **Yes, Tailwind CSS 4 is stable and recommended** for Next.js 16 projects

**Rationale**:
- Tailwind CSS v4 stable release available as of late 2024/early 2026
- Native Next.js 16 integration (included in official templates)
- No PostCSS dependency (Rust-based engine for faster builds)
- Significantly improved performance over v3

**Configuration**:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Navy blue
          light: '#3B48CC',
          dark: '#131D4F',
        },
        accent: {
          teal: '#14B8A6',
          green: '#10B981',
        },
        neutral: {
          50: '#F9FAFB',
          900: '#1F2937',
        },
        semantic: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

**Browser Support**:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

**Gotchas**:
- Main CSS file should be named `globals.css`
- Watch for Turbopack compatibility issues (use Webpack if needed: `next dev` without `--turbo`)

**Sources**: Next.js 16 Documentation, Tailwind CSS v4 Official Docs

---

### 5. Navy Blue (#1E3A8A) Design System

**Question**: What complementary colors work best with navy blue (#1E3A8A) for a modern productivity app?

**Decision**: Navy blue primary with **teal (#14B8A6) and green (#10B981) accents**

**Rationale**:
- Navy blue conveys professionalism, trust, and calmness (ideal for productivity)
- Teal provides complementary contrast for completed states (calming + positive)
- Green signals success and progress (universally recognized)
- Light gray backgrounds (#F9FAFB) prevent visual fatigue
- Red (#EF4444) for destructive actions follows universal conventions

**Complete Color Palette**:

```typescript
colors: {
  // Primary brand
  primary: {
    DEFAULT: '#1E3A8A',  // Navy blue - headers, primary buttons, focus states
    light: '#3B48CC',     // Hover states
    dark: '#131D4F',      // Active states
  },

  // Accent colors
  accent: {
    teal: '#14B8A6',      // Completed todos, success secondary
    green: '#10B981',     // Success toasts, positive feedback
  },

  // Neutrals
  neutral: {
    50: '#F9FAFB',        // Backgrounds, cards
    100: '#F3F4F6',       // Borders, dividers
    500: '#6B7280',       // Secondary text
    900: '#1F2937',       // Primary text
  },

  // Semantic
  semantic: {
    success: '#10B981',   // Success states
    error: '#EF4444',     // Delete, errors
    warning: '#F59E0B',   // Warnings, alerts
    info: '#3B82F6',      // Information
  },
}
```

**Usage Examples**:
- **Primary CTA**: `bg-primary hover:bg-primary-light text-white`
- **Completed Todo**: `line-through text-accent-teal`
- **Success Toast**: `bg-accent-green text-white`
- **Delete Button**: `bg-semantic-error hover:bg-red-600 text-white`

**Design Principles (2026)**:
- Use 1-2 main neutrals (white/gray)
- One primary accent (navy blue)
- Small set of state colors (success, error, warning)
- Avoid loud gradients - favor solid, purposeful colors

**Sources**: Figma Navy Blue Color Guide, UI Color Palette 2026 Best Practices, Modern App Colors 2026

---

## Summary of Decisions

| Area | Decision | Key Configuration |
|------|----------|------------------|
| JWT Expiration | 15 min access, 7 days refresh | `expiresIn: 60 * 60 * 24 * 7` |
| State Management | React Query (TanStack Query) v5 | `staleTime: 60 * 1000` |
| Auth Integration | Better Auth with nextCookies() | `plugins: [nextCookies()]` |
| Styling | Tailwind CSS 4 | Native Next.js 16 support |
| Color Palette | Navy (#1E3A8A) + Teal/Green | Primary + Accent colors |

All decisions verified against official documentation via Context7 MCP (February 2026).
