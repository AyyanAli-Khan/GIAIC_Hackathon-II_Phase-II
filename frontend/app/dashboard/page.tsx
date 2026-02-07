/**
 * Dashboard Page
 *
 * Main authenticated page showing user's todos with:
 * - Auth guard using Better Auth useSession hook
 * - TodoForm for creating new todos
 * - TodoList for displaying all todos
 * - Logout button
 *
 * Implements T022 [US1]
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { TodoForm } from '@/components/todos/TodoForm'
import { TodoList } from '@/components/todos/TodoList'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, isPending, router])

  // Handle logout
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            My Todos
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-muted)]">
              {session.user?.name || session.user?.email}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Todo Creation Form */}
        <div className="mb-8">
          <TodoForm />
        </div>

        {/* Todo List */}
        <TodoList />
      </main>
    </div>
  )
}
