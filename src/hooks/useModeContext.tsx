import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Mode } from '../components/ModeToggle'

interface ModeContextType {
  currentMode: Mode
  setMode: (mode: Mode) => void
  isMouseMode: boolean
  isExploreMode: boolean
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

interface ModeProviderProps {
  children: React.ReactNode
  defaultMode?: Mode
}

export const ModeProvider = ({ children, defaultMode = 'explore' }: ModeProviderProps) => {
  const [currentMode, setCurrentMode] = useState<Mode>(defaultMode)

  const setMode = useCallback((mode: Mode) => {
    setCurrentMode(mode)
    // Store in localStorage for persistence
    localStorage.setItem('intuition-mode', mode)
  }, [])

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem('intuition-mode')
    if (savedMode === 'mouse' || savedMode === 'explore') {
      setCurrentMode(savedMode)
    }
  }, [])

  const value: ModeContextType = {
    currentMode,
    setMode,
    isMouseMode: currentMode === 'mouse',
    isExploreMode: currentMode === 'explore',
  }

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
} 