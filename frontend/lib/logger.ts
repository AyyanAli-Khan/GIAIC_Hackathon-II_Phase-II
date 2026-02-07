/**
 * Structured Logger Utility
 *
 * Production-ready logging with:
 * - Log levels (debug, info, warn, error)
 * - Structured context
 * - Environment-aware (silent in test, verbose in dev)
 * - Ready for Sentry/LogRocket integration
 *
 * Implements T047
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // Silent in test environment
    if (this.isTest) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    // In development, use pretty console formatting
    if (this.isDevelopment) {
      const styles = {
        debug: 'color: #6B7280',
        info: 'color: #3B82F6',
        warn: 'color: #F59E0B',
        error: 'color: #EF4444; font-weight: bold',
      }

      console.log(
        `%c[${level.toUpperCase()}] ${message}`,
        styles[level],
        context || '',
        error || ''
      )
      return
    }

    // In production, use structured JSON logging
    // This can be easily parsed by log aggregation tools
    console.log(JSON.stringify(entry))

    // TODO: Send to Sentry/LogRocket in production
    // if (level === 'error' && typeof window !== 'undefined') {
    //   Sentry.captureException(error || new Error(message), {
    //     level: 'error',
    //     extra: context,
    //   })
    // }
  }

  /**
   * Debug level - for development only
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Warning level - recoverable errors
   */
  warn(message: string, context?: LogContext, error?: Error) {
    this.log('warn', message, context, error)
  }

  /**
   * Error level - critical errors that need attention
   */
  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error)
  }
}

// Export singleton instance
export const logger = new Logger()

// Setup global error handlers (client-side only)
if (typeof window !== 'undefined') {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
      promise: String(event.promise),
    })

    // Prevent default browser console error
    event.preventDefault()
  })

  // Unhandled errors
  window.addEventListener('error', (event) => {
    logger.error('Unhandled Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, event.error)

    // Let browser handle it too
    return false
  })
}
