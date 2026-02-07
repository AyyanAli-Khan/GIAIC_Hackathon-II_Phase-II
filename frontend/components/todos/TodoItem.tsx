/**
 * Todo Item Component
 *
 * Displays a single todo with:
 * - Checkbox (disabled in US1, will be enabled in US2)
 * - Title and description
 * - Edit/Delete buttons (hidden in US1, enabled in US2/US3)
 * - Visual styling for completed todos (strikethrough)
 *
 * Implements T025 [P] [US1]
 */

'use client'

import { Todo } from '@/lib/api/api-client'
import { Card } from '@/components/ui/Card'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const isCompleted = todo.is_completed

  return (
    <Card hover className="transition-all duration-150">
      <div className="flex items-start gap-4">
        {/* Checkbox (disabled in US1) */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={isCompleted}
            disabled
            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] cursor-not-allowed opacity-60"
            aria-label={`Mark "${todo.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-medium mb-1 ${
              isCompleted
                ? 'line-through text-[var(--color-text-muted)]'
                : 'text-[var(--color-text)]'
            }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p
              className={`text-sm ${
                isCompleted
                  ? 'line-through text-gray-400'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {todo.description}
            </p>
          )}

          <div className="mt-2 text-xs text-gray-400">
            Created {new Date(todo.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Action buttons - hidden in US1, will be enabled in US2/US3 */}
        {/* Uncomment in Phase 4 (US2) and Phase 5 (US3) */}
        {/* <div className="flex-shrink-0 flex gap-2">
          <Button variant="secondary" size="sm">
            Edit
          </Button>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div> */}
      </div>
    </Card>
  )
}
