# Quickstart Guide: Todo Frontend Web Application

**Branch**: `002-todo-frontend` | **Date**: 2026-02-07

## Prerequisites

- **Node.js**: 18.x or later (20.x recommended for Next.js 16)
- **npm** or **pnpm** or **yarn**
- **Git**
- **Backend API**: FastAPI backend running at `http://localhost:8000` (see `specs/001-todo-backend-api`)
- **Better Auth**: Configured with JWKS endpoint

## Initial Setup

### 1. Create Next.js 16 Project

```bash
# Navigate to project root
cd E:/GIAIC_Hackathon-II/Phase-II-claude

# Create Next.js 16 app with TypeScript + Tailwind
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --import-alias "@/*"

# Follow prompts:
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Turbo? No (optional - skip if issues with Tailwind)
# ✔ Would you like to use `src/` directory? No
```

### 2. Install Dependencies

```bash
cd frontend

# Core dependencies
npm install @tanstack/react-query better-auth sonner

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
```

### 3. Environment Variables

Create `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000

# Better Auth configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
```

**Security Notes**:
- Never commit `.env.local` to version control
- `BETTER_AUTH_SECRET` must be at least 32 characters
- Use different secrets for development and production
- Share `BETTER_AUTH_SECRET` between frontend and backend for JWT verification

### 4. Configure Better Auth

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // 1 day
  },
  plugins: [
    nextCookies() // MUST be last plugin
  ],
})
```

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/client"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    jwtClient() // Enables JWT token retrieval
  ],
})
```

### 5. Set Up React Query

Create `app/providers.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'
import * as React from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60 seconds
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
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Update `app/layout.tsx`:

```typescript
import { Providers } from './providers'
import { Toaster } from 'sonner'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
```

### 6. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
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
          100: '#F3F4F6',
          500: '#6B7280',
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

Update `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-neutral-50 text-neutral-900;
  }
}
```

### 7. Copy API Client and Hooks

Copy the contract files:

```bash
# Create lib directory structure
mkdir -p lib/api

# Copy from specs/002-todo-frontend/contracts/
cp specs/002-todo-frontend/contracts/api-client.ts lib/api/
cp specs/002-todo-frontend/contracts/react-query-hooks.ts lib/api/
```

### 8. Create Middleware for Route Protection

Create `middleware.ts` at project root:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Redirect authenticated users away from auth pages
  if (sessionCookie && ["/signin", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to signin
  if (!sessionCookie && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"]
}
```

## Running the Application

### Development Mode

```bash
# Start Next.js development server
npm run dev

# Or with specific port
npm run dev -- -p 3000
```

**Application URLs**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Better Auth JWKS: `http://localhost:3000/api/auth/jwks`

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   │   └── page.tsx          # Signin page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── dashboard/
│   │   └── page.tsx              # Authenticated dashboard
│   ├── layout.tsx                # Root layout with Providers
│   ├── page.tsx                  # Public landing page
│   ├── providers.tsx             # React Query provider
│   └── globals.css               # Global styles
├── components/
│   ├── todos/
│   │   ├── TodoList.tsx          # Todo list container
│   │   ├── TodoItem.tsx          # Individual todo card
│   │   ├── TodoForm.tsx          # Create todo form
│   │   └── TodoEditForm.tsx      # Inline edit form
│   ├── auth/
│   │   ├── SignInForm.tsx        # Signin form
│   │   └── SignUpForm.tsx        # Signup form
│   └── ui/
│       ├── Button.tsx            # Reusable button component
│       ├── Input.tsx             # Form input component
│       ├── Card.tsx              # Card component
│       └── EmptyState.tsx        # Empty state illustration
├── lib/
│   ├── api/
│   │   ├── api-client.ts         # Type-safe API client
│   │   └── react-query-hooks.ts  # React Query hooks
│   ├── auth.ts                   # Better Auth server config
│   └── auth-client.ts            # Better Auth client config
├── middleware.ts                 # Route protection middleware
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── .env.local                    # Environment variables (NOT committed)
└── package.json
```

## Development Workflow

### 1. Start Backend API

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Verify backend is running:
```bash
curl http://localhost:8000/api/health
# Expected: {"status":"healthy"}
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Auth Flow

1. Navigate to `http://localhost:3000`
2. Click "Sign Up"
3. Create account with email/password
4. Verify redirect to `/dashboard`
5. Create a test todo
6. Logout and sign back in
7. Verify todos persist

## Troubleshooting

### Issue: "No active session" error

**Cause**: Better Auth not configured or JWT token not available

**Solution**:
1. Check `BETTER_AUTH_SECRET` is set in `.env.local`
2. Verify Better Auth database is running
3. Clear cookies and try signin again

### Issue: CORS errors when calling backend

**Cause**: Backend CORS not configured for frontend origin

**Solution**: Add to backend `main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Tailwind styles not applying

**Cause**: Content paths in `tailwind.config.ts` don't match file structure

**Solution**: Verify content array includes all component paths:
```typescript
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
```

### Issue: Hydration mismatch errors

**Cause**: Server/client rendered different content

**Solution**:
1. Ensure `'use client'` directive on client components
2. Check for browser-only APIs in server components
3. Verify QueryClient singleton pattern in `providers.tsx`

## Next Steps

1. **Implement Authentication Pages**: Create signin/signup forms in `app/(auth)/`
2. **Build Dashboard**: Create todo list UI in `app/dashboard/page.tsx`
3. **Add Todo Components**: Implement TodoList, TodoItem, TodoForm in `components/todos/`
4. **Test Optimistic Updates**: Verify rollback behavior on API failures
5. **Add Loading States**: Implement skeleton loaders and spinners
6. **Accessibility Audit**: Test keyboard navigation and screen reader support

## Reference Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com)
