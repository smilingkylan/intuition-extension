import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'

const ROUTE_STORAGE_KEY = 'intuition-last-route'

export function useRouteState() {
  const navigate = useNavigate()
  const location = useLocation()

  // Save current route to storage whenever it changes
  useEffect(() => {
    if (location.pathname !== '/') {
      localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname)
    }
  }, [location.pathname])

  // Restore last route on mount
  useEffect(() => {
    const savedRoute = localStorage.getItem(ROUTE_STORAGE_KEY)
    if (savedRoute && savedRoute !== '/' && location.pathname === '/') {
      navigate({ to: savedRoute, replace: true })
    }
  }, [])

  return {
    clearRouteState: () => localStorage.removeItem(ROUTE_STORAGE_KEY),
    lastRoute: localStorage.getItem(ROUTE_STORAGE_KEY) || '/'
  }
} 