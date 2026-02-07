/**
 * Auth Layout
 *
 * Split layout for authentication pages (signin/signup).
 * Left: branding panel, Right: form area.
 * Mobile: single column with branding above form.
 */

import React from 'react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      {/* Branding Panel - Left Side */}
      <div className="lg:w-1/2 bg-zinc-900 relative overflow-hidden flex flex-col justify-between p-8 lg:p-12">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[128px] translate-y-1/2 -translate-x-1/3"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-zinc-200 transition-colors">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">TaskMind</span>
          </Link>
        </div>

        <div className="hidden lg:block relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white leading-tight">
            Simplify your workflow.<br />
            <span className="text-blue-400">Amplify your impact.</span>
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed max-w-md">
            Join thousands of teams using TaskMind to cut through the noise, stay organized, and ship faster than ever before.
          </p>
        </div>

        <div className="hidden lg:block relative z-10 text-sm text-zinc-500">
          © 2026 TaskMind. All rights reserved.
        </div>
      </div>

      {/* Form Panel - Right Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
