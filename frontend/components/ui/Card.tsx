/**
 * Card Component
 *
 * Container component for todos and forms.
 * White background, subtle shadow, rounded corners.
 */

import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  hover?: boolean
}

export function Card({
  children,
  header,
  footer,
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles =
    'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm transition-all duration-150'

  const hoverStyles = hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''

  const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`

  return (
    <div className={combinedClassName} {...props}>
      {header && (
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          {header}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-[var(--color-border)]">
          {footer}
        </div>
      )}
    </div>
  )
}
