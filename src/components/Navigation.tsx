import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { HomeIcon, CompassIcon, ClockIcon, SettingsIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/explore', label: 'Explore', icon: CompassIcon },
  { path: '/history', label: 'History', icon: ClockIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg transition-all duration-200" />
                )}
                <Icon 
                  className={cn(
                    "h-5 w-5 relative z-10 transition-all duration-200",
                    isActive && "text-primary scale-110"
                  )} 
                />
              </div>
              <span 
                className={cn(
                  "text-xs transition-all duration-200",
                  isActive && "text-primary font-medium"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary transition-all duration-200" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 