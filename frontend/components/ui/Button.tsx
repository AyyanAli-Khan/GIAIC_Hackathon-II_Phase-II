/**
 * Button Component
 *
 * Professional button with gradient variants and micro-animations.
 * Modern SaaS design with smooth hover effects and enhanced depth.
 */

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

  const variantStyles = {
    primary:
      'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:shadow-lg hover:scale-[1.02]',
    gradient:
      'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02]',
    secondary:
      'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm hover:shadow-md hover:scale-[1.01]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg hover:shadow-danger/20 hover:scale-[1.02]',
    ghost:
      'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
    outline:
      'bg-transparent border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300',
  }

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs min-h-[36px] gap-1.5',
    md: 'px-5 py-2.5 text-sm min-h-[42px] gap-2',
    lg: 'px-7 py-3 text-base min-h-[48px] gap-2.5',
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
