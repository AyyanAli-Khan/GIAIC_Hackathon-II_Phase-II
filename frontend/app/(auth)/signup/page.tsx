/**
 * Sign Up Page
 *
 * Renders the SignUpForm component and link to signin.
 * Implements T018 [P] [US1]
 */

import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Card } from '@/components/ui/Card'

export default function SignUpPage() {
  return (
    <Card className="bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Create Account
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Sign up to start organizing your tasks
        </p>
      </div>

      <SignUpForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-[var(--color-text-muted)]">
          Already have an account?{' '}
        </span>
        <Link
          href="/signin"
          className="text-[var(--color-primary)] hover:underline font-medium"
        >
          Sign in
        </Link>
      </div>
    </Card>
  )
}
