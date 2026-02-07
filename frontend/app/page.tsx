/**
 * Landing Page (Public)
 *
 * Modern professional SaaS landing page with gradient hero,
 * animated backgrounds, and refined feature showcase.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { GradientBackground } from '@/components/ui/GradientBackground'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Animated Gradient Background */}
      <GradientBackground variant="default" animated />

      {/* Navigation */}
      <nav className="border-b border-zinc-200 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskMind
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 mb-6 tracking-tight leading-[1.1]">
              Organize your work.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stay focused.
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Simple, powerful task management for modern teams.
              Join TaskMind and ship faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base">
                  Get Started Free
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto">
            {/* Feature 1 - Large Card */}
            <div className="md:col-span-2 group bg-zinc-50 border border-zinc-200 rounded-2xl p-8 hover:border-zinc-300 transition-all duration-300">
              <div className="flex flex-col h-full justify-between">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-3">Lightning Fast Performance</h3>
                  <p className="text-zinc-600 text-lg leading-relaxed max-w-md">
                    Built on Next.js 16 and FastAPI for instant updates and optimistic UI.
                    Experience zero-latency task management.
                  </p>
                </div>
                <div className="h-32 bg-white rounded-lg border border-zinc-100 shadow-sm relative overflow-hidden group-hover:shadow-md transition-shadow">
                  {/* Abstract UI representation */}
                  <div className="absolute top-4 left-4 right-4 h-2 bg-zinc-100 rounded-full w-3/4"></div>
                  <div className="absolute top-8 left-4 right-4 h-2 bg-zinc-100 rounded-full w-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50 rounded-tl-full opacity-50"></div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Tall Card */}
            <div className="md:col-span-1 group bg-white border border-zinc-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -z-10 opacity-50"></div>

              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Enterprise Security</h3>
              <p className="text-zinc-600 leading-relaxed">
                Bank-grade encryption and JWT authentication to keep your data safe.
              </p>
            </div>

            {/* Feature 3 - Standard Card */}
            <div className="md:col-span-1 group bg-white border border-zinc-200 rounded-2xl p-8 hover:border-zinc-300 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Real-time Sync</h3>
              <p className="text-zinc-600 leading-relaxed">
                Changes reflect instantly across all your devices.
              </p>
            </div>

            {/* Feature 4 - Wide Card */}
            <div className="md:col-span-2 group bg-zinc-900 text-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="max-w-md">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Works Everywhere</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    Fully responsive design that adapts perfectly to mobile, tablet, and desktop workflows.
                  </p>
                </div>
                {/* Visual element */}
                <div className="w-full sm:w-auto flex-1 flex justify-end">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl opacity-80 rotate-3 transform group-hover:rotate-6 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-gradient-to-b from-white to-zinc-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-zinc-900">TaskFlow</span>
            </div>
            <p className="text-sm text-zinc-500">
              Built with Next.js 16, FastAPI, and Better Auth
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
