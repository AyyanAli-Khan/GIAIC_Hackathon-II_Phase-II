/**
 * React Query Hooks for Todo Management
 *
 * Provides type-safe React Query hooks with:
 * - Optimistic updates
 * - Automatic rollback on failure
 * - Independent parallel mutations
 * - Comprehensive error handling
 *
 * @module react-query-hooks
 */

import { useMutation, useQuery, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { todoApi, Todo, TodoCreateRequest, TodoUpdateRequest, ApiClientError, getUserErrorMessage } from './api-client'
import { toast } from 'sonner' // or your preferred toast library

// ============================================================================
// Query Keys
// ============================================================================

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: { filter?: string; sortBy?: string }) =>
    [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all todos for the authenticated user
 *
 * @returns Query result with todos array
 */
export function useTodos(): UseQueryResult<Todo[], ApiClientError> {
  return useQuery({
    queryKey: todoKeys.all,
    queryFn: () => todoApi.getAll(),
    staleTime: 60 * 1000, // 60 seconds
  })
}

/**
 * Fetch a single todo by ID
 *
 * @param id - Todo UUID
 * @param enabled - Whether to run the query (default: true)
 * @returns Query result with todo object
 */
export function useTodo(
  id: string,
  enabled = true
): UseQueryResult<Todo, ApiClientError> {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoApi.getById(id),
    enabled,
    staleTime: 60 * 1000,
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new todo with optimistic updates
 *
 * @returns Mutation result
 */
export function useCreateTodo(): UseMutationResult<
  Todo,
  ApiClientError,
  TodoCreateRequest,
  { previousTodos: Todo[] | undefined; optimisticTodo: Todo }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newTodo: TodoCreateRequest) => todoApi.create(newTodo),

    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.all })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.all)

      // Optimistically update UI
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        title: newTodo.title,
        description: newTodo.description || null,
        is_completed: newTodo.is_completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) => [
        optimisticTodo,
        ...(old || []),
      ])

      return { previousTodos, optimisticTodo }
    },

    onError: (err, newTodo, context) => {
      // Rollback to previous state
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.all, context.previousTodos)
      }

      // Show error toast
      toast.error(getUserErrorMessage(err))

      // Note: Form input is NOT cleared in component - user can retry
    },

    onSuccess: (serverTodo, variables, context) => {
      // Replace optimistic todo with server todo
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === context.optimisticTodo.id ? serverTodo : t)) || []
      )

      toast.success('Todo created')
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * Update an existing todo with optimistic updates
 *
 * @returns Mutation result
 */
export function useUpdateTodo(): UseMutationResult<
  Todo,
  ApiClientError,
  { id: string; updates: TodoUpdateRequest },
  { previousTodo: Todo | undefined }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TodoUpdateRequest }) =>
      todoApi.update(id, updates),

    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: todoKeys.all })

      // Snapshot previous value
      const previousTodo = queryClient.getQueryData<Todo>(todoKeys.detail(id))

      // Optimistically update individual todo
      if (previousTodo) {
        const optimisticTodo: Todo = {
          ...previousTodo,
          ...updates,
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData(todoKeys.detail(id), optimisticTodo)

        // Also update in todos list
        queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
          old?.map((t) => (t.id === id ? optimisticTodo : t)) || []
        )
      }

      return { previousTodo }
    },

    onError: (err, { id }, context) => {
      // Rollback to previous state
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(id), context.previousTodo)
        queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
          old?.map((t) => (t.id === id ? context.previousTodo! : t)) || []
        )
      }

      toast.error(getUserErrorMessage(err))
    },

    onSuccess: (serverTodo) => {
      // Update with server data
      queryClient.setQueryData(todoKeys.detail(serverTodo.id), serverTodo)
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === serverTodo.id ? serverTodo : t)) || []
      )

      toast.success('Todo updated')
    },

    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: todoKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: todoKeys.all })
      }
    },
  })
}

/**
 * Delete a todo with optimistic updates
 *
 * @returns Mutation result
 */
export function useDeleteTodo(): UseMutationResult<
  void,
  ApiClientError,
  string,
  { previousTodos: Todo[] | undefined; deletedTodo: Todo | undefined }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoApi.delete(id),

    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.all })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.all)
      const deletedTodo = previousTodos?.find((t) => t.id === id)

      // Optimistically remove from list
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
        old?.filter((t) => t.id !== id) || []
      )

      return { previousTodos, deletedTodo }
    },

    onError: (err, id, context) => {
      // Rollback: restore deleted todo
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.all, context.previousTodos)
      }

      toast.error(getUserErrorMessage(err))
    },

    onSuccess: (_, id, context) => {
      // Remove from individual cache as well
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) })

      toast.success('Todo deleted')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * Toggle todo completion status with optimistic updates
 *
 * @returns Mutation result
 */
export function useToggleTodo(): UseMutationResult<
  Todo,
  ApiClientError,
  { id: string; isCompleted: boolean },
  { previousTodo: Todo | undefined }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      todoApi.toggleComplete(id, isCompleted),

    onMutate: async ({ id, isCompleted }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: todoKeys.all })

      // Snapshot previous value
      const previousTodo = queryClient.getQueryData<Todo>(todoKeys.detail(id))

      // Optimistically update
      if (previousTodo) {
        const optimisticTodo: Todo = {
          ...previousTodo,
          is_completed: isCompleted,
          updated_at: new Date().toISOString(),
        }

        queryClient.setQueryData(todoKeys.detail(id), optimisticTodo)
        queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
          old?.map((t) => (t.id === id ? optimisticTodo : t)) || []
        )
      }

      return { previousTodo }
    },

    onError: (err, { id }, context) => {
      // Rollback toggle
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(id), context.previousTodo)
        queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
          old?.map((t) => (t.id === id ? context.previousTodo! : t)) || []
        )
      }

      toast.error(getUserErrorMessage(err))
    },

    onSuccess: (serverTodo) => {
      queryClient.setQueryData(todoKeys.detail(serverTodo.id), serverTodo)
      queryClient.setQueryData<Todo[]>(todoKeys.all, (old) =>
        old?.map((t) => (t.id === serverTodo.id ? serverTodo : t)) || []
      )

      // No success toast for toggle (too noisy for rapid clicks)
    },

    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: todoKeys.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: todoKeys.all })
      }
    },
  })
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Get filtered and sorted todos
 *
 * @param filter - 'all' | 'active' | 'completed'
 * @param sortBy - 'date' | 'alpha'
 * @returns Filtered and sorted todos
 */
export function useFilteredTodos(
  filter: 'all' | 'active' | 'completed' = 'all',
  sortBy: 'date' | 'alpha' = 'date'
) {
  const { data: todos = [], ...queryResult } = useTodos()

  // Filter
  const filtered = todos.filter((todo) => {
    if (filter === 'active') return !todo.is_completed
    if (filter === 'completed') return todo.is_completed
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return a.title.localeCompare(b.title)
  })

  return {
    ...queryResult,
    data: sorted,
  }
}
