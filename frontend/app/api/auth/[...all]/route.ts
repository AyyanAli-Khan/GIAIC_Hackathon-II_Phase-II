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

const handler = toNextJsHandler(auth)

export const GET = async (request: Request) => {
  try {
    return await handler.GET(request)
  } catch (error) {
    console.error('[Auth API GET Error]', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const POST = async (request: Request) => {
  try {
    return await handler.POST(request)
  } catch (error) {
    console.error('[Auth API POST Error]', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
