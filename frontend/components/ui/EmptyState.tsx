/**
 * Empty State Component
 *
 * Professional empty state with gradient accents.
 * Encourages users to add their first task.
 */

import React from 'react'

export function EmptyState() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        {/* Gradient Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg
            className="w-10 h-10 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>

        {/* Heading with gradient accent */}
        <h2 className="text-2xl font-bold text-zinc-900 mb-3">
          No tasks yet!
        </h2>

        {/* Description */}
        <p className="text-base text-zinc-600 leading-relaxed">
          Add your first todo above to get started.
          Keep track of your tasks and stay organized. ✨
        </p>
      </div>
    </div>
  )
}
