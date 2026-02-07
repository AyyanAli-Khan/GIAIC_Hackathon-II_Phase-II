/**
 * Sign In Page
 *
 * Renders the SignInForm component and link to signup.
 * Implements T019 [P] [US1]
 */

import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'
import { Card } from '@/components/ui/Card'

export default function SignInPage() {
  return (
    <Card className="bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Welcome Back
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Sign in to access your todos
        </p>
      </div>

      <SignInForm />

      <div className="mt-6 text-center text-sm">
        <span className="text-[var(--color-text-muted)]">
          Don't have an account?{' '}
        </span>
        <Link
          href="/signup"
          className="text-[var(--color-primary)] hover:underline font-medium"
        >
          Sign up
        </Link>
      </div>
    </Card>
  )
}
