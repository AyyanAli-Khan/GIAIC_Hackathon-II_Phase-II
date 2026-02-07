/**
 * Better Auth Server Configuration
 *
 * Configured with:
 * - Session expiration: 7 days
 * - Update age: 1 day (refresh token every 24 hours)
 * - nextCookies plugin for Next.js App Router integration
 */

import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is not set')
}

export const auth = betterAuth({
  database: {
    provider: 'postgres',
    url: process.env.DATABASE_URL,
  },

  secret: process.env.BETTER_AUTH_SECRET,

  session: {
    // Session expires after 7 days of inactivity
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds

    // Refresh session every 24 hours (if user is active)
    updateAge: 60 * 60 * 24, // 1 day in seconds
  },

  // JWT configuration (per spec clarification: 1 hour expiry)
  jwt: {
    expiresIn: 60 * 60, // 1 hour in seconds
  },

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Next.js App Router integration - MUST be last in plugins array
  plugins: [nextCookies()],
})
