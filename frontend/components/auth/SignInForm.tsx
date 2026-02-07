/**
 * Sign In Form Component
 *
 * Authentication form using Better Auth with:
 * - React Hook Form for state management
 * - Zod validation
 * - Error handling with toast notifications
 * - Automatic redirect to /dashboard on success
 * - Structured error logging (T047)
 *
 * Implements T021 [P] [US1], T047
 */

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { signIn } from '@/lib/auth-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { logger } from '@/lib/logger'

// Validation schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get redirect URL from query params (set by middleware)
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true)

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        // Handle Better Auth errors
        const errorMessage =
          result.error.status === 401
            ? 'Invalid email or password'
            : result.error.message || 'Sign in failed. Please try again.'

        // T047 - Log auth failures
        logger.warn('Sign in failed', {
          email: data.email,
          status: result.error.status,
          message: result.error.message,
        })

        toast.error(errorMessage)
        return
      }

      // Success - redirect to dashboard or original destination
      logger.info('User signed in successfully', { email: data.email })
      toast.success('Signed in successfully!')
      router.push(redirectTo)
    } catch (error) {
      // Handle unexpected errors
      logger.error('Unexpected sign in error', { email: data.email }, error as Error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        autoComplete="current-password"
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
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}

export function SignInForm() {
  return (
    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
      <SignInFormContent />
    </Suspense>
  )
}
