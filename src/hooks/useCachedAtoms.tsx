import { useEffect } from 'react'
import { useAtomQueue } from './useAtomQueueWithQuery'
import type { AtomQuery } from '../lib/atom-queue/types'
import type { TrackedAtom } from '../background/atom-tracking-service'

/**
 * Hook that requests cached atoms from the background service when the sidepanel opens.
 * This ensures users see already-detected atoms immediately.
 */
export function useCachedAtoms() {
  const { addQuery, queue } = useAtomQueue()
  
  useEffect(() => {
    // Get the current tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id
        
        // Request cached atoms from background
        chrome.runtime.sendMessage(
          { 
            type: 'GET_TAB_ATOMS',
            tabId 
          },
          (response) => {
            if (response?.atoms && Array.isArray(response.atoms)) {
              console.log(`[useCachedAtoms] Loading ${response.atoms.length} cached atoms`)
              
              // Convert TrackedAtoms to AtomQueries and add to queue
              response.atoms.forEach((trackedAtom: TrackedAtom) => {
                // Check if this atom is already in the queue
                const existingItem = queue.find(item => item.query.query === trackedAtom.query)
                if (existingItem) {
                  console.log(`[useCachedAtoms] Skipping duplicate atom: ${trackedAtom.query}`)
                  return
                }
                
                const atomQuery: AtomQuery = {
                  id: `cached-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  query: trackedAtom.query,
                  source: trackedAtom.type === 'url' ? 'url' : 
                          trackedAtom.type === 'address' ? 'hover' : 
                          'manual',
                  creationData: createCreationData(trackedAtom),
                  timestamp: trackedAtom.detectedAt
                }
                
                try {
                  addQuery(atomQuery)
                } catch (error) {
                  console.error('[useCachedAtoms] Error adding cached atom:', error)
                }
              })
            }
          }
        )
      }
    })
  }, []) // Only run once on mount
  
  return null
}

/**
 * Convert a TrackedAtom to creation data for the atom queue
 */
function createCreationData(trackedAtom: TrackedAtom) {
  switch (trackedAtom.type) {
    case 'url':
      return {
        type: 'url' as const,
        name: trackedAtom.query,
        description: `Website: ${trackedAtom.metadata?.hostname || trackedAtom.query}`,
        url: trackedAtom.query,
        metadata: trackedAtom.metadata || {}
      }
      
    case 'address':
      return {
        type: 'address' as const,
        name: `${trackedAtom.query.slice(0, 6)}...${trackedAtom.query.slice(-4)}`,
        description: `Ethereum address: ${trackedAtom.query}`,
        address: trackedAtom.query,
        metadata: trackedAtom.metadata || {}
      }
      
    case 'social':
      const username = trackedAtom.metadata?.username || trackedAtom.query.split(':')[1]
      const platform = trackedAtom.metadata?.platform || 'x.com'
      return {
        type: 'social' as const,
        name: `${platform}:${username}`,
        description: `Social account on ${platform}`,
        platform,
        username,
        metadata: trackedAtom.metadata || {}
      }
      
    default:
      return {
        type: 'generic' as const,
        name: trackedAtom.query,
        description: 'Detected atom',
        metadata: trackedAtom.metadata || {}
      }
  }
}
