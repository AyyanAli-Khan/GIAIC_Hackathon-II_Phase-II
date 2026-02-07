/**
 * Todo List Component
 *
 * Displays all todos for the authenticated user with:
 * - Loading skeleton while fetching
 * - Empty state when no todos exist
 * - Error state with retry button
 * - TodoItem components for each todo
 *
 * Implements T024 [P] [US1]
 */

'use client'

import { useTodos } from '@/lib/api/react-query-hooks'
import { TodoItem } from './TodoItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function TodoList() {
  const { data: todos = [], isLoading, isError, error, refetch } = useTodos()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-[var(--color-border)] rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Failed to Load Todos
        </h3>
        <p className="text-[var(--color-text-muted)] mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button variant="primary" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Empty state
  if (todos.length === 0) {
    return <EmptyState />
  }

  // Render todos
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {todos.length} {todos.length === 1 ? 'Task' : 'Tasks'}
        </h2>
      </div>

      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
