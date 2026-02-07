/**
 * Card Component
 *
 * Professional container with hover lift effects and refined shadows.
 * Modern SaaS design with gradient border option.
 */

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  hover?: boolean
  variant?: 'default' | 'elevated' | 'ghost'
  gradientBorder?: boolean
}

export function Card({
  children,
  header,
  footer,
  hover = false,
  variant = 'default',
  gradientBorder = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl transition-all duration-300'

  const variantStyles = {
    default: 'bg-white border border-zinc-200 shadow-sm',
    elevated: 'bg-white border border-zinc-200 shadow-md',
    ghost: 'bg-transparent'
  }

  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-zinc-300'
    : ''

  const gradientStyles = gradientBorder
    ? 'relative bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px]'
    : ''

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${gradientStyles} ${className}`

  const content = (
    <>
      {header && (
        <div className="px-6 py-4 border-b border-zinc-100">
          {header}
        </div>
      )}

      <div className={`px-6 py-4 ${gradientBorder ? 'bg-white rounded-[11px]' : ''}`}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-zinc-100">
          {footer}
        </div>
      )}
    </>
  )

  if (gradientBorder) {
    return (
      <div className={combinedClassName} {...props}>
        <div className="bg-white rounded-[11px] h-full">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={combinedClassName} {...props}>
      {content}
    </div>
  )
}
