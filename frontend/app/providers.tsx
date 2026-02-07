/**
 * React Query Providers
 *
 * Sets up QueryClient with singleton pattern for server vs client.
 * Provides React Query context to entire application.
 * Includes global 401 error handler for session expiry (T036 [US5]).
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { ApiClientError } from '@/lib/api/api-client'
import { toast } from 'sonner'

// Singleton pattern for server vs client
let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,

        // Cache garbage collection after 5 minutes
        gcTime: 5 * 60 * 1000,

        // Retry failed queries 3 times
        retry: 3,

        // Refetch when user returns to tab
        refetchOnWindowFocus: true,

        // Refetch after network reconnection
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations 3 times for network errors only
        retry: (failureCount, error: any) => {
          // Don't retry on client errors (4xx)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 3
        },

        // Global error handler for session expiry (T036 [US5])
        onError: (error: any) => {
          // Check if error is 401 Unauthorized
          if (error instanceof ApiClientError && error.status === 401) {
            handleSessionExpiry()
          }
        },
      },
    },
  })
}

// Global session expiry handler (T036 [US5])
async function handleSessionExpiry() {
  // Only run in browser
  if (typeof window === 'undefined') return

  // Clear Better Auth session
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        // Clear React Query cache
        if (browserQueryClient) {
          browserQueryClient.clear()
        }

        // Show toast notification (T037 [P] [US5])
        toast.warning('Your session has expired. Please sign in again.', {
          duration: 5000,
        })

        // Redirect to signin page
        window.location.href = '/signin'
      },
      onError: () => {
        // Even if signOut fails, clear local state and redirect
        if (browserQueryClient) {
          browserQueryClient.clear()
        }

        toast.warning('Your session has expired. Please sign in again.', {
          duration: 5000,
        })

        window.location.href = '/signin'
      },
    },
  })
}

function getQueryClient() {
  // Server: always create a new query client
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }

  // Browser: create query client if it doesn't exist
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }

  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  // Create query client once per request (server) or per app (browser)
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
