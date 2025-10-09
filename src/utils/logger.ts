/**
 * Logger utility for conditional logging based on environment
 * In production, all logs are disabled by default to prevent console pollution
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
}

// Check if we're in development mode
// Plasmo sets NODE_ENV during builds
const isDevelopment = process.env.NODE_ENV === 'development'

// Default configuration
const config: LoggerConfig = {
  enabled: isDevelopment,
  level: isDevelopment ? 'debug' : 'error'
}

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!config.enabled) return false
    return logLevels[level] >= logLevels[config.level]
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  }

  // Group logging for better organization
  group(label: string, fn: () => void): void {
    if (config.enabled) {
      console.group(label)
      fn()
      console.groupEnd()
    } else {
      fn()
    }
  }

  // Time logging for performance monitoring
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing or manual configuration
export const configureLogger = (newConfig: Partial<LoggerConfig>) => {
  Object.assign(config, newConfig)
}
