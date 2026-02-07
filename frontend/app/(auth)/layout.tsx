/**
 * Auth Layout
 *
 * Simple centered layout for authentication pages (signin/signup).
 * No navigation - auth pages are standalone.
 * Implements T017 [P] [US1]
 */

import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  )
}
