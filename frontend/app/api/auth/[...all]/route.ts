/**
 * Better Auth API Route Handler
 *
 * Handles all Better Auth API requests:
 * - POST /api/auth/sign-up/email (signup)
 * - POST /api/auth/sign-in/email (signin)
 * - POST /api/auth/sign-out (signout)
 * - GET /api/auth/session (get session)
 * - And all other Better Auth endpoints
 *
 * This catch-all route delegates to Better Auth's built-in handler.
 */

import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
