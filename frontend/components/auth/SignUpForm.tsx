/**
 * Sign Up Form Component
 *
 * Registration form using Better Auth with:
 * - React Hook Form for state management
 * - Zod validation (email format, password min 8 chars)
 * - Error handling with toast notifications
 * - Automatic redirect to /dashboard on success
 *
 * Implements T020 [P] [US1]
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { signUp } from '@/lib/auth-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Validation schema
const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true)

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (result.error) {
        // Handle Better Auth errors
        const errorMessage =
          result.error.message === 'User already exists'
            ? 'Email already registered. Please sign in instead.'
            : result.error.message || 'Sign up failed. Please try again.'
        toast.error(errorMessage)
        return
      }

      // Success - redirect to dashboard
      toast.success('Account created successfully!')

      // Use window.location for hard navigation to ensure session cookie is picked up
      // This is necessary because router.push() doesn't force a full page reload
      window.location.href = '/dashboard'
    } catch (error) {
      // Handle unexpected errors
      console.error('Sign up error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Name"
        type="text"
        autoComplete="name"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        helperText="At least 8 characters"
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
