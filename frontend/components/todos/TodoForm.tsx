/**
 * Todo Form Component
 *
 * Form for creating new todos with:
 * - React Hook Form + Zod validation
 * - Fields: title (required, 1-500 chars), description (optional, 0-2000 chars), is_completed checkbox
 * - Optimistic updates via useCreateTodo mutation
 * - Preserves form input on API error for retry
 *
 * Implements T023 [P] [US1]
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTodo } from '@/lib/api/react-query-hooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// Validation schema
const todoFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  is_completed: z.boolean().optional().default(false),
})

type TodoFormData = z.infer<typeof todoFormSchema>

export function TodoForm() {
  const createTodoMutation = useCreateTodo()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      is_completed: false,
    } as TodoFormData,
  })

  const onSubmit = async (data: TodoFormData) => {
    try {
      await createTodoMutation.mutateAsync({
        title: data.title,
        description: data.description || null,
        is_completed: data.is_completed ?? false,
      })

      // Only reset form on successful creation
      reset()
    } catch (error) {
      // Form input is preserved on error (no reset)
      // Error toast is shown by the mutation's onError handler
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Add New Todo
        </h2>

        <Input
          label="Title"
          type="text"
          placeholder="e.g., Buy milk"
          error={errors.title?.message}
          required
          {...register('title')}
        />

        <Input
          label="Description"
          variant="textarea"
          rows={3}
          placeholder="Add details about this task (optional)"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_completed"
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            {...register('is_completed')}
          />
          <label
            htmlFor="is_completed"
            className="text-sm text-[var(--color-text)]"
          >
            Mark as completed
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={createTodoMutation.isPending}
          className="w-full"
        >
          {createTodoMutation.isPending ? 'Adding...' : 'Add Todo'}
        </Button>
      </form>
    </Card>
  )
}
