/**
 * Next.js Middleware for Route Protection
 *
 * Handles:
 * - Redirect unauthenticated users attempting /dashboard to /signin
 * - Redirect authenticated users accessing /signin or /signup to /dashboard
 * - Protect all routes under /dashboard/*
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedPaths = ['/dashboard']

// Auth routes that authenticated users should not access
const authPaths = ['/signin', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Better Auth session cookie
  // In production (HTTPS), Better Auth uses __Secure- prefix
  // In development (HTTP), it uses the unprefixed version
  const sessionCookie =
    request.cookies.get('__Secure-better-auth.session_token') ||
    request.cookies.get('better-auth.session_token')
  const isAuthenticated = !!sessionCookie

  // Check if accessing a protected route
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  // Check if accessing an auth route
  const isAuthRoute = authPaths.some((path) => pathname.startsWith(path))

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
