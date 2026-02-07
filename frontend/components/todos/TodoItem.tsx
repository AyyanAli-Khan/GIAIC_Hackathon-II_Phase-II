/**
 * Todo Item Component *
 * Professional todo card with gradient accents and refined interactions.
 * Modern SaaS design with smooth checkbox animations and hover effects.
 */

'use client'

import { useState } from 'react'
import { Todo } from '@/lib/api/api-client'
import { useToggleTodo, useDeleteTodo } from '@/lib/api/react-query-hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TodoEditForm } from './TodoEditForm'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()

  const isCompleted = todo.is_completed
  const isTogglingCompletion = toggleTodo.isPending
  const isDeletingTodo = deleteTodo.isPending

  const handleCheckboxChange = async () => {
    try {
      await toggleTodo.mutateAsync({
        id: todo.id,
        isCompleted: !isCompleted,
      })
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveSuccess = () => {
    setIsEditing(false)
  }

  const handleDeleteClick = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteTodo.mutateAsync(todo.id)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  if (isEditing) {
    return (
      <Card className="transition-all duration-200 animate-scale-in">
        <TodoEditForm
          todo={todo}
          onCancel={handleCancelEdit}
          onSaveSuccess={handleSaveSuccess}
        />
      </Card>
    )
  }

  return (
    <div className="group bg-white border border-zinc-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {/* Gradient Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxChange}
          disabled={isTogglingCompletion}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${isCompleted
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-transparent shadow-md scale-105'
              : 'border-zinc-300 hover:border-blue-400 hover:scale-105'
            } ${isTogglingCompletion
              ? 'opacity-50 cursor-wait'
              : 'cursor-pointer'
            }`}
          aria-label={`Mark "${todo.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        >
          {isCompleted && (
            <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold mb-1.5 transition-all duration-200 ${isCompleted
                ? 'line-through text-zinc-400'
                : 'text-zinc-900'
              }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p
              className={`text-sm leading-relaxed transition-all duration-200 mb-3 ${isCompleted
                  ? 'line-through text-zinc-400'
                  : 'text-zinc-600'
                }`}
            >
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(todo.created_at).toLocaleDateString()}
            </span>
            {isCompleted && (
              <Badge variant="success" className="text-xs">
                ✓ Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleEditClick}
            disabled={isTogglingCompletion || isDeletingTodo}
            className="p-2 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
            aria-label={`Edit todo titled "${todo.title}"`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isTogglingCompletion || isDeletingTodo}
            className="p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
            aria-label={`Delete todo titled "${todo.title}"`}
          >
            {isDeletingTodo ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
