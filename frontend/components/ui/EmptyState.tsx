/**
 * Empty State Component
 *
 * Friendly message shown when user has no todos yet.
 * Encourages users to add their first task.
 *
 * Implements T026 [P] [US1]
 */

import React from 'react'
import { Card } from './Card'

export function EmptyState() {
  return (
    <Card className="text-center py-12">
      <div className="flex flex-col items-center justify-center">
        {/* Illustration */}
        <div className="text-6xl mb-6">
          <svg
            className="w-24 h-24 mx-auto text-[var(--color-primary)] opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-3">
          No tasks yet!
        </h2>

        {/* Description */}
        <p className="text-[var(--color-text-muted)] max-w-md">
          Add your first todo above to get started.
          Keep track of your tasks and stay organized.
        </p>
      </div>
    </Card>
  )
}
