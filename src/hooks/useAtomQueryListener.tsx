import { useEffect } from 'react'
import { useAtomQueue } from './useAtomQueueWithQuery'
import { isAtomQueryMessage } from '../types/messages'
import type { AtomQuery } from '../lib/atom-queue/types'

/**
 * Hook that listens for atom queries from the background
 * and adds them to the atom queue
 */
export function useAtomQueryListener() {
  const { addQuery } = useAtomQueue()

  useEffect(() => {
    const handleMessage = (message: any) => {
      console.log('[useAtomQueryListener] Received message:', message)
      
      if (isAtomQueryMessage(message)) {
        console.log('[useAtomQueryListener] Processing atom query:', message.data)
        
        // Convert to AtomQuery format
        const atomQuery: AtomQuery = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          query: message.data.query,
          source: message.data.source,
          creationData: message.data.creationData,
          timestamp: Date.now()
        }
        
        // Add to queue
        try {
          addQuery(atomQuery)
        } catch (error) {
          console.error('[useAtomQueryListener] Error adding query to queue:', error)
        }
      }
    }

    // Listen for messages from background
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [addQuery])
} 