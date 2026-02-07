/**
 * Input Component
 *
 * Form input with label, error state, and variants (text, textarea).
 * shadcn/ui-inspired styling with clean focus rings.
 */

import React, { useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'text' | 'textarea'
  rows?: number
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, helperText, variant = 'text', rows = 4, className = '', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const baseStyles =
      'flex w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-50'

    const errorStyles = error
      ? 'border-red-500 focus-visible:ring-red-500'
      : 'border-zinc-200 hover:border-zinc-300'

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`

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
            className="block text-sm font-medium text-zinc-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        {InputElement}

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-xs text-zinc-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
