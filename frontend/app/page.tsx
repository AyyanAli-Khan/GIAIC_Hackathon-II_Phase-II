/**
 * Landing Page (Public)
 *
 * Hero section with app description and call-to-action buttons for signup/signin.
 * Implements T016 [P] [US1]
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Todo App
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            A modern, secure task management application built with Next.js and FastAPI.
            Organize your tasks, track your progress, and stay productive.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-white text-[var(--color-primary)] hover:bg-blue-50 shadow-xl"
            >
              Sign Up
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] border-white text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div className="p-6">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure</h3>
            <p className="text-blue-100">
              Protected with Better Auth and JWT tokens
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Fast</h3>
            <p className="text-blue-100">
              Optimistic updates for instant feedback
            </p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-lg font-semibold mb-2">Responsive</h3>
            <p className="text-blue-100">
              Works beautifully on all devices
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
