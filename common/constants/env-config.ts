/**
 * Environment-specific configuration
 * This file provides configuration based on the build environment
 */

// Determine current environment
// In production builds, this will be replaced by Plasmo
const isDevelopment = process.env.NODE_ENV === 'development'
const isBeta = process.env.NODE_ENV === 'staging'
const isProduction = process.env.NODE_ENV === 'production'

interface EnvConfig {
  REVEL8_API_ORIGIN: string
  REVEL8_EXPLORER_DOMAIN: string
  I8N_EXPLORER_DOMAIN: string
  ENABLE_LOGGING: boolean
  ENABLE_DEV_FEATURES: boolean
}

const configs: Record<string, EnvConfig> = {
  development: {
    REVEL8_API_ORIGIN: 'http://localhost:3333',
    REVEL8_EXPLORER_DOMAIN: 'http://localhost:3000',
    I8N_EXPLORER_DOMAIN: 'https://dev.portal.intuition.systems/app',
    ENABLE_LOGGING: true,
    ENABLE_DEV_FEATURES: true
  },
  staging: {
    REVEL8_API_ORIGIN: 'https://api.base-sepolia.revel8.io',
    REVEL8_EXPLORER_DOMAIN: 'https://beta.explorer.intuition.systems',
    I8N_EXPLORER_DOMAIN: 'https://dev.portal.intuition.systems/app',
    ENABLE_LOGGING: true,
    ENABLE_DEV_FEATURES: false
  },
  production: {
    REVEL8_API_ORIGIN: 'https://api.intuition.systems',
    REVEL8_EXPLORER_DOMAIN: 'https://explorer.intuition.systems',
    I8N_EXPLORER_DOMAIN: 'https://portal.intuition.systems/app',
    ENABLE_LOGGING: false,
    ENABLE_DEV_FEATURES: false
  }
}

// Get current environment
const currentEnv = isProduction ? 'production' : isBeta ? 'staging' : 'development'

// Export configuration for current environment
export const ENV_CONFIG = configs[currentEnv]

// Helper to get specific config values with fallbacks
export const getEnvConfig = <K extends keyof EnvConfig>(
  key: K,
  fallback?: EnvConfig[K]
): EnvConfig[K] => {
  return ENV_CONFIG[key] ?? fallback ?? configs.development[key]
}
