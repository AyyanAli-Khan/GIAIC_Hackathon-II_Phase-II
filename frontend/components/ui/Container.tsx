/**
 * Container Component
 *
 * Consistent layout wrapper with responsive padding and max-width options.
 * Professional spacing for modern SaaS layouts.
 */

import React from 'react'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    background?: 'white' | 'gray' | 'transparent'
}

export function Container({
    children,
    maxWidth = 'lg',
    background = 'transparent',
    className = '',
    ...props
}: ContainerProps) {
    const maxWidthStyles = {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        full: 'max-w-full',
    }

    const backgroundStyles = {
        white: 'bg-white',
        gray: 'bg-zinc-50',
        transparent: 'bg-transparent',
    }

    const combinedClassName = `${maxWidthStyles[maxWidth]} ${backgroundStyles[background]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`

    return (
        <div className={combinedClassName} {...props}>
            {children}
        </div>
    )
}
