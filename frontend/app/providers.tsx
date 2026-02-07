/**
 * React Query Providers
 *
 * Sets up QueryClient with singleton pattern for server vs client.
 * Provides React Query context to entire application.
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

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
