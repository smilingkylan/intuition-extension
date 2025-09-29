import { createHashHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const hashHistory = createHashHistory()

// Create a new router instance
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  // Since we're in an extension, we use hash history
  basepath: '/',
  history: hashHistory,
})

// Register the router instance for maximum type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
} 