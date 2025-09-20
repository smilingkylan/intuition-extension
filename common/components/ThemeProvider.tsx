// todo: maybe this should be removed

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Storage helper functions for extension compatibility
const storageHelper = {
  async getItem(key: string): Promise<string | null> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        const result = await chrome.storage.sync.get([key])
        return result[key] || null
      } catch (error) {
        console.warn('Chrome storage get failed, falling back to localStorage:', error)
      }
    }
    return localStorage.getItem(key)
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        await chrome.storage.sync.set({ [key]: value })
      } catch (error) {
        console.warn('Chrome storage set failed, falling back to localStorage:', error)
        localStorage.setItem(key, value)
      }
    } else {
      localStorage.setItem(key, value)
    }
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'intuition-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await storageHelper.getItem(storageKey)
      if (storedTheme && ['dark', 'light', 'system'].includes(storedTheme)) {
        setTheme(storedTheme as Theme)
      }
      setIsLoaded(true)
    }
    loadTheme()
  }, [storageKey])

  // Apply theme to DOM
  useEffect(() => {
    if (!isLoaded) return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme, isLoaded])

  // Listen for chrome storage changes (for cross-extension synchronization)
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes[storageKey]) {
          const newTheme = changes[storageKey].newValue
          if (newTheme && ['dark', 'light', 'system'].includes(newTheme)) {
            setTheme(newTheme as Theme)
          }
        }
      }

      chrome.storage.onChanged.addListener(handleStorageChange)
      return () => chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [storageKey])

  const value = {
    theme,
    setTheme: async (newTheme: Theme) => {
      await storageHelper.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
