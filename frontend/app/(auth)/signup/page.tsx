/**
 * Sign Up Page
 *
 * Clean sign up page with minimal branding.
 */

import Link from 'next/link'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Join TaskMind
        </h1>
        <p className="text-sm text-zinc-600">
          Get started with TaskFlow today
        </p>
      </div>

      <SignUpForm />

      <div className="text-center text-sm border-t border-zinc-200 pt-4">
        <span className="text-zinc-600">
          Already have an account?{' '}
        </span>
        <Link
          href="/signin"
          className="text-zinc-900 font-medium hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
