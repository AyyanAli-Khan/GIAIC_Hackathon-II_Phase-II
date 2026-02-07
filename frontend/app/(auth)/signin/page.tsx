/**
 * Sign In Page
 *
 * Clean sign in page with minimal branding.
 */

import Link from 'next/link'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-600">
          Sign in to your account to continue
        </p>
      </div>

      <SignInForm />

      <div className="text-center text-sm border-t border-zinc-200 pt-4">
        <span className="text-zinc-600">
          Don't have an account?{' '}
        </span>
        <Link
          href="/signup"
          className="text-zinc-900 font-medium hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  )
}
