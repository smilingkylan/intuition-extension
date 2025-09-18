import React from 'react'
import { Button } from '~/components/ui/button'

interface NavigationProps {
  activeRoute: string
  onRouteChange: (route: string) => void
}

export function Navigation({ activeRoute, onRouteChange }: NavigationProps) {
  const routes = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  ]

  return (
    <nav className="flex items-center justify-center space-x-1 p-2 bg-muted/30 border-b">
      {routes.map(route => (
        <Button
          key={route.id}
          variant={activeRoute === route.id ? 'default' : 'ghost'}
          size="sm"
          className="flex items-center gap-2"
          onClick={() => onRouteChange(route.id)}
        >
          <span className="text-sm">{route.icon}</span>
          <span className="hidden sm:inline">{route.label}</span>
        </Button>
      ))}
    </nav>
  )
}