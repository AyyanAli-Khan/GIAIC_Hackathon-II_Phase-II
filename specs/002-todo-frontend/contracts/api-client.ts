/**
 * API Client for Todo Frontend
 *
 * Provides type-safe API calls to the FastAPI backend with:
 * - Automatic JWT attachment
 * - Error handling and retry logic
 * - TypeScript type safety
 *
 * @module api-client
 */

import { authClient } from '@/lib/auth-client'

// ============================================================================
// Type Definitions
// ============================================================================

export interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface TodoCreateRequest {
  title: string
  description?: string | null
  is_completed?: boolean
}

export interface TodoUpdateRequest {
  title?: string
  description?: string | null
  is_completed?: boolean
}

export interface ValidationError {
  detail: Array<{
    loc: string[]
    msg: string
    type: string
  }>
}

export interface ApiError {
  detail: string
}

// ============================================================================
// API Client Configuration
// ============================================================================

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

// ============================================================================
// Authenticated Fetch Wrapper
// ============================================================================

async function authenticatedFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get JWT token from Better Auth
  const { data: tokenData, error: tokenError } = await authClient.token()

  if (tokenError || !tokenData?.token) {
    throw new ApiClientError('No active session', 401)
  }

  const url = `${BACKEND_API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.token}`,
      ...options.headers,
    },
  })

  // Handle 204 No Content (successful delete)
  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiClientError(
      data.detail || 'API request failed',
      response.status,
      data
    )
  }

  return data as T
}

// ============================================================================
// Todo API Methods
// ============================================================================

export const todoApi = {
  /**
   * Fetch all todos for the authenticated user
   *
   * @returns Array of todos
   * @throws ApiClientError on failure
   */
  async getAll(): Promise<Todo[]> {
    return authenticatedFetch<Todo[]>('/api/todos')
  },

  /**
   * Fetch a single todo by ID
   *
   * @param id - Todo UUID
   * @returns Todo object
   * @throws ApiClientError on failure (404 if not found)
   */
  async getById(id: string): Promise<Todo> {
    return authenticatedFetch<Todo>(`/api/todos/${id}`)
  },

  /**
   * Create a new todo
   *
   * @param todo - Todo creation data
   * @returns Created todo with server-generated ID and timestamps
   * @throws ApiClientError on failure (422 for validation errors)
   */
  async create(todo: TodoCreateRequest): Promise<Todo> {
    return authenticatedFetch<Todo>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    })
  },

  /**
   * Update an existing todo
   *
   * @param id - Todo UUID
   * @param updates - Partial todo updates
   * @returns Updated todo
   * @throws ApiClientError on failure (404 if not found, 422 for validation errors)
   */
  async update(id: string, updates: TodoUpdateRequest): Promise<Todo> {
    return authenticatedFetch<Todo>(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  /**
   * Delete a todo
   *
   * @param id - Todo UUID
   * @returns void (204 No Content)
   * @throws ApiClientError on failure (404 if not found)
   */
  async delete(id: string): Promise<void> {
    return authenticatedFetch<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Toggle todo completion status
   *
   * @param id - Todo UUID
   * @param isCompleted - New completion status
   * @returns Updated todo
   * @throws ApiClientError on failure
   */
  async toggleComplete(id: string, isCompleted: boolean): Promise<Todo> {
    return this.update(id, { is_completed: isCompleted })
  },
}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Parse validation errors from 422 responses
 *
 * @param error - ApiClientError with validation details
 * @returns Object mapping field names to error messages
 */
export function parseValidationErrors(error: ApiClientError): Record<string, string> {
  if (error.status !== 422 || !error.data?.detail) {
    return {}
  }

  const validationError = error.data as ValidationError

  return validationError.detail.reduce((acc, err) => {
    const field = err.loc[err.loc.length - 1]
    acc[field] = err.msg
    return acc
  }, {} as Record<string, string>)
}

/**
 * Check if error is a session expiry error
 *
 * @param error - Error object
 * @returns true if error is 401 Unauthorized
 */
export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401
}

/**
 * Check if error is a not found error
 *
 * @param error - Error object
 * @returns true if error is 404 Not Found
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 404
}

/**
 * Check if error is a validation error
 *
 * @param error - Error object
 * @returns true if error is 422 Unprocessable Entity
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 422
}

/**
 * Get user-friendly error message
 *
 * @param error - Error object
 * @returns Human-readable error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (!(error instanceof ApiClientError)) {
    return 'An unexpected error occurred. Please try again.'
  }

  switch (error.status) {
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 404:
      return 'Todo not found. It may have been deleted.'
    case 422:
      return 'Invalid input. Please check your data and try again.'
    case 500:
    case 503:
      return 'Server error. Please try again later.'
    default:
      if (!navigator.onLine) {
        return 'You appear to be offline. Check your connection.'
      }
      return error.message || 'Something went wrong. Please try again.'
  }
}

// ============================================================================
// Export
// ============================================================================

export { ApiClientError }
