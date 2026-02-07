/**
 * Todo Edit Form Component
 *
 * Professional inline editing form with gradient save button.
 * Modern spacing and refined interaction design.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
import { Todo } from '@/lib/api/api-client'
import { useUpdateTodo } from '@/lib/api/react-query-hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const todoEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or less'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .nullable(),
})

type TodoEditFormData = z.infer<typeof todoEditSchema>

interface TodoEditFormProps {
  todo: Todo
  onCancel: () => void
  onSaveSuccess?: () => void
}

export function TodoEditForm({ todo, onCancel, onSaveSuccess }: TodoEditFormProps) {
  const updateTodo = useUpdateTodo()

  const form = useForm({
    resolver: zodResolver(todoEditSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description || '',
    } as TodoEditFormData,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const onSubmit = async (data: TodoEditFormData) => {
    try {
      await updateTodo.mutateAsync({
        id: todo.id,
        updates: {
          title: data.title,
          description: data.description || null,
        },
      })

      onSaveSuccess?.()
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault()
    onCancel()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 bg-zinc-50 rounded-xl border border-zinc-200">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
        <h3 className="text-sm font-bold text-zinc-900">Edit task</h3>
      </div>

      <Input
        {...register('title')}
        label="Title"
        type="text"
        placeholder="Todo title"
        error={errors.title?.message}
        disabled={isSubmitting}
        autoFocus
        aria-label="Edit todo title"
      />

      <Input
        {...register('description')}
        label="Description"
        variant="textarea"
        placeholder="Add a description (optional)"
        error={errors.description?.message}
        disabled={isSubmitting}
        rows={3}
        aria-label="Edit todo description"
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={handleCancel}
          disabled={isSubmitting}
          aria-label="Cancel editing (or press Escape)"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gradient"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Save changes
        </Button>
      </div>
    </form>
  )
}
