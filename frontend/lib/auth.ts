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
import { jwt } from 'better-auth/plugins'
import { Pool } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is not set')
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

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

  // Plugins: JWT for token endpoint, nextCookies for Next.js integration
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: 'RS256', // Use RS256 to match FastAPI backend expectations
        },
      },
    }), // Enables /api/auth/token endpoint for JWT retrieval
    nextCookies(), // MUST be last for Next.js App Router integration
  ],
})
