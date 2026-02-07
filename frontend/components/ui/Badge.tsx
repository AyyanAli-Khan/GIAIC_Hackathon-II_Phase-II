/**
 * Badge Component
 *
 * Professional status indicator with gradient option and modern styling.
 */

import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger' | 'secondary'
  children: React.ReactNode
}

export function Badge({
  variant = 'default',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200'

  const variantStyles = {
    default: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    secondary: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
