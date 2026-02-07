/**
 * GradientBackground Component
 *
 * Animated gradient background with floating orbs for hero sections.
 * Professional, subtle animation for modern SaaS landing pages.
 */

import React from 'react'

export interface GradientBackgroundProps {
    variant?: 'default' | 'subtle'
    animated?: boolean
    className?: string
}

export function GradientBackground({
    variant = 'default',
    animated = true,
    className = '',
}: GradientBackgroundProps) {
    const animationClass = animated ? 'animate-float' : ''

    if (variant === 'subtle') {
        return (
            <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
            </div>
        )
    }

    return (
        <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />

            {/* Floating gradient orbs */}
            <div
                className={`absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl ${animationClass}`}
                style={{ animationDelay: '0s', animationDuration: '7s' }}
            />
            <div
                className={`absolute top-0 -right-4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl ${animationClass}`}
                style={{ animationDelay: '2s', animationDuration: '9s' }}
            />
            <div
                className={`absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl ${animationClass}`}
                style={{ animationDelay: '4s', animationDuration: '8s' }}
            />
        </div>
    )
}
