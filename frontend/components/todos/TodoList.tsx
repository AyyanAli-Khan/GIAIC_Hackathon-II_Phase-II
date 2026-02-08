/**
 * Todo List Component
 *
 * Professional todo display with gradient-enhanced states.
 * Modern loading skeletons, empty states, and error handling.
 */

'use client'

import dynamic from 'next/dynamic'
import { useTodos, useFilteredTodos } from '@/lib/api/react-query-hooks'
import { TodoItem } from './TodoItem'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const EmptyState = dynamic(() => import('@/components/ui/EmptyState').then(mod => ({ default: mod.EmptyState })), {
  loading: () => (
    <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto"></div>
        <div className="h-5 bg-zinc-100 rounded w-32 mx-auto"></div>
        <div className="h-4 bg-zinc-50 rounded w-48 mx-auto"></div>
      </div>
    </div>
  ),
})

interface TodoListProps {
  filter?: 'all' | 'active' | 'completed'
  sortBy?: 'date' | 'alpha'
}

export function TodoList({ filter = 'all', sortBy = 'date' }: TodoListProps = {}) {
  const filteredResult = useFilteredTodos(filter, sortBy)
  const { data: todos = [], isLoading, isError, error, refetch } = filteredResult

  const { data: allTodos = [] } = useTodos()

  // Loading skeleton with gradient accents
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-zinc-100 rounded-lg w-2/3"></div>
                <div className="h-4 bg-zinc-50 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state with gradient icon
  if (isError) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-2">
          Failed to load todos
        </h3>
        <p className="text-sm text-zinc-600 mb-5 max-w-md mx-auto">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button variant="gradient" size="md" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  // Empty state - filtered with gradient icon
  if (todos.length === 0 && filter !== 'all' && allTodos.length > 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-2">
          No {filter} tasks
        </h3>
        <p className="text-sm text-zinc-600">
          {filter === 'active'
            ? '🎉 All tasks are completed!'
            : 'No completed tasks yet.'}
        </p>
      </div>
    )
  }

  // Empty state - no todos at all
  if (todos.length === 0) {
    return <EmptyState />
  }

  // Render todos with refined header
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-zinc-900">
            {filter !== 'all' ? `${filter.charAt(0).toUpperCase() + filter.slice(1)} tasks` : 'All tasks'}
          </h2>
          <Badge variant={filter === 'completed' ? 'success' : 'secondary'} className="font-semibold">
            {todos.length}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  )
}
