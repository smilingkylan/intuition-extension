import React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Header } from '@/src/components/Header'
import { Navigation } from '@/src/components/Navigation'

// Error component for the router
function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  )
}

// Not found component
function NotFoundComponent() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  )
}

function RootComponent() {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="pt-14 pb-16 flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="mt-8 mb-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Navigation />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
}) 