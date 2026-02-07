/**
 * Input Component
 *
 * Form input with label, error state, and variants (text, textarea).
 * Follows navy blue theme and accessibility standards.
 */

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'text' | 'textarea'
  rows?: number
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, helperText, variant = 'text', rows = 4, className = '', id, ...props }, ref) => {
    // Generate ID if not provided (for accessibility)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    // Base input styles
    const baseStyles =
      'w-full px-4 py-2 border rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50'

    // Error styles
    const errorStyles = error
      ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]'
      : 'border-[var(--color-border)]'

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`

    // Input element
    const InputElement = variant === 'textarea' ? (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        id={inputId}
        rows={rows}
        className={combinedClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    ) : (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        id={inputId}
        className={combinedClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
          >
            {label}
            {props.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
          </label>
        )}

        {InputElement}

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--color-text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
