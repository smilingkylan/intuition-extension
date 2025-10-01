import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { AtomQueueManager } from '../lib/atom-queue/queue-manager'
import { AtomSearchService } from '../lib/atom-queue/atom-search-service'
import type { AtomQuery, QueryResult, QueueItem } from '../lib/atom-queue/types'

interface AtomQueueContextValue {
  queue: QueueItem[]
  addQuery: (query: AtomQuery) => Promise<string>
  removeQuery: (queueItemId: string) => void
  toggleExpanded: (queueItemId: string) => void
  togglePinned: (queueItemId: string) => void
  clearUnpinned: () => void
  clearAll: () => void
  stats: ReturnType<AtomQueueManager['getStats']>
}

const AtomQueueContext = createContext<AtomQueueContextValue | null>(null)

export function AtomQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [stats, setStats] = useState(getEmptyStats())
  
  const queueManagerRef = useRef<AtomQueueManager>()
  const searchServiceRef = useRef<AtomSearchService>()

  // Initialize services
  useEffect(() => {
    queueManagerRef.current = new AtomQueueManager({
      deduplicateQueries: true,
      autoSearch: true
    })
    searchServiceRef.current = new AtomSearchService()

    // Subscribe to queue events
    const manager = queueManagerRef.current

    const updateQueueState = () => {
      setQueue(manager.getQueue())
      setStats(manager.getStats())
    }

    manager.on('query:added', updateQueueState)
    manager.on('query:removed', updateQueueState)
    manager.on('query:updated', updateQueueState)
    manager.on('queue:cleared', updateQueueState)

    return () => {
      manager.removeAllListeners()
    }
  }, [])

  const addQuery = useCallback(async (query: AtomQuery) => {
    if (!queueManagerRef.current || !searchServiceRef.current) {
      throw new Error('Queue services not initialized')
    }

    // Add query to queue
    const queueItemId = queueManagerRef.current.addQuery(query)

    // Start searching for atoms
    try {
      const searchResult = await searchServiceRef.current.search(query.query)
      
      // Update with results
      const result: QueryResult = {
        queryId: query.id,
        query: query.query,
        matches: searchResult.matches,
        summary: searchResult.summary,
        status: searchResult.matches.length > 0 ? 'found' : 'not-found'
      }
      
      queueManagerRef.current.updateQueryResult(query.id, result)
    } catch (error) {
      // Update with error
      const result: QueryResult = {
        queryId: query.id,
        query: query.query,
        matches: [],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      queueManagerRef.current.updateQueryResult(query.id, result)
    }

    return queueItemId
  }, [])

  const removeQuery = useCallback((queueItemId: string) => {
    queueManagerRef.current?.removeQuery(queueItemId)
  }, [])

  const toggleExpanded = useCallback((queueItemId: string) => {
    queueManagerRef.current?.toggleExpanded(queueItemId)
    setQueue(queueManagerRef.current?.getQueue() || [])
  }, [])

  const togglePinned = useCallback((queueItemId: string) => {
    queueManagerRef.current?.togglePinned(queueItemId)
    setQueue(queueManagerRef.current?.getQueue() || [])
  }, [])

  const clearUnpinned = useCallback(() => {
    queueManagerRef.current?.clearUnpinned()
  }, [])

  const clearAll = useCallback(() => {
    queueManagerRef.current?.clearAll()
  }, [])

  return (
    <AtomQueueContext.Provider value={{
      queue,
      addQuery,
      removeQuery,
      toggleExpanded,
      togglePinned,
      clearUnpinned,
      clearAll,
      stats
    }}>
      {children}
    </AtomQueueContext.Provider>
  )
}

export function useAtomQueue() {
  const context = useContext(AtomQueueContext)
  if (!context) {
    throw new Error('useAtomQueue must be used within AtomQueueProvider')
  }
  return context
}

function getEmptyStats() {
  return {
    total: 0,
    pinned: 0,
    expanded: 0,
    searching: 0,
    found: 0,
    notFound: 0,
    errors: 0
  }
} 