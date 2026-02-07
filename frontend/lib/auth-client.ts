/**
 * Better Auth Client Configuration
 *
 * Configured with:
 * - React client for hook support (useSession)
 * - jwtClient plugin for JWT token access
 * - Export hooks for use in components (useSession, signIn, signUp, signOut)
 */

import { createAuthClient } from 'better-auth/react'
import { jwtClient } from 'better-auth/client/plugins'

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set')
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  // Enable JWT client plugin for token access
  plugins: [jwtClient()],
})

// Export hooks for convenience
export const {
  useSession,
  signIn,
  signUp,
  signOut,
  token,
} = authClient
