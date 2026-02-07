/**
 * Todo Form Component
 *
 * Professional form for creating new todos with gradient submit button.
 * Modern SaaS design with refined spacing and visuals.
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTodo } from '@/lib/api/react-query-hooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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

      reset()
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  return (
    <Card className="shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-zinc-900">
            Create new task
          </h2>
        </div>

        <Input
          label="Title"
          type="text"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          required
          aria-label="Todo title"
          {...register('title')}
        />

        <Input
          label="Description"
          variant="textarea"
          rows={3}
          placeholder="Add details (optional)"
          error={errors.description?.message}
          aria-label="Todo description (optional)"
          {...register('description')}
        />

        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <input
            type="checkbox"
            id="is_completed"
            className="w-5 h-5 rounded-md border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
            aria-label="Mark new todo as completed"
            {...register('is_completed')}
          />
          <label
            htmlFor="is_completed"
            className="text-sm font-medium text-zinc-700 cursor-pointer select-none"
          >
            Mark as completed
          </label>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          loading={createTodoMutation.isPending}
          className="w-full"
          aria-label="Add new todo"
        >
          {createTodoMutation.isPending ? 'Adding task...' : 'Add task'}
        </Button>
      </form>
    </Card>
  )
}
