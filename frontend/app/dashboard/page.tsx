/**
 * Dashboard Page
 *
 * Modern professional dashboard with gradient accents,
 * refined filter controls, and enhanced todo management.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'
import { TodoForm } from '@/components/todos/TodoForm'
import { TodoList } from '@/components/todos/TodoList'
import { StatsOverview } from '@/components/dashboard/StatsOverview'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'alpha'>('date')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/signin')
    }
  }, [session, isPending, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (!isPending && !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30">
      {/* Header with Gradient Accent */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-zinc-500">Your productivity hub</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
                {session ? (
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                      {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-zinc-900">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-zinc-500">{session.user?.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-zinc-200 rounded-full animate-pulse"></div>
                    <div className="hidden md:block space-y-1">
                      <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse"></div>
                      <div className="h-3 w-28 bg-zinc-100 rounded animate-pulse"></div>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out of your account"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Todo Creation Form */}
        <div className="mb-8">
          <TodoForm />
        </div>

        {/* Filter/Sort Controls */}
        <div className="mb-6 bg-white rounded-xl p-5 shadow-md border border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Pills with Sliding Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-700">Show:</span>
              <div className="inline-flex rounded-lg bg-zinc-100 p-1" role="group" aria-label="Filter todos">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-zinc-700 hover:text-zinc-900'
                    }`}
                  aria-pressed={filter === 'all'}
                  aria-label="Show all todos"
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'active'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-zinc-700 hover:text-zinc-900'
                    }`}
                  aria-pressed={filter === 'active'}
                  aria-label="Show only active todos"
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'completed'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-zinc-700 hover:text-zinc-900'
                    }`}
                  aria-pressed={filter === 'completed'}
                  aria-label="Show only completed todos"
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-sm font-semibold text-zinc-700">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'alpha')}
                className="px-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-zinc-300 transition-all cursor-pointer"
                aria-label="Sort todos by date or alphabetically"
              >
                <option value="date">Newest first</option>
                <option value="alpha">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <TodoList filter={filter} sortBy={sortBy} />
      </main>
    </div>
  )
}
