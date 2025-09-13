import React from 'react'
import { Button } from '~/common/components/ui/button'
import { Switch } from '~/common/components/ui/switch'
import { useTheme } from '~/common/components/ThemeProvider'

interface HeaderProps {
  onWeb3Login?: () => void
  isWeb3Connected?: boolean
}

export function Header({ onWeb3Login, isWeb3Connected = false }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      {/* Logo section */}
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <span className="font-semibold text-lg">Intuition</span>
        </div>
      </div>

      {/* Right section with theme toggle and web3 login */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>

        {/* Web3 Login Button */}
        <Button
          variant={isWeb3Connected ? 'secondary' : 'default'}
          size="sm"
          onClick={onWeb3Login}
        >
          {isWeb3Connected ? 'Connected' : 'Connect Wallet'}
        </Button>
      </div>
    </header>
  )
}