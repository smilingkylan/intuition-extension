import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { AtomQueueManager } from '../lib/atom-queue/queue-manager'
import { searchAtomsByLabel, getAtomSearchQueryOptions } from '../lib/atom-queue/atom-search-queries'
import { atomQueryKeys } from '../lib/atom-queue/query-keys'
import type { AtomQuery, QueryResult, QueueItem } from '../lib/atom-queue/types'

// Internal type that tracks query state
interface QueueItemInternal extends QueueItem {
  queryEnabled: boolean
  lastFetchTime?: number
}

interface AtomQueueContextValue {
  queue: QueueItem[]
  addQuery: (query: AtomQuery) => string
  removeQuery: (queueItemId: string) => void
  refreshQuery: (queueItemId: string) => Promise<void>
  toggleExpanded: (queueItemId: string) => void
  togglePinned: (queueItemId: string) => void
  clearUnpinned: () => void
  clearAll: () => void
  stats: ReturnType<AtomQueueManager['getStats']>
}

const AtomQueueContext = createContext<AtomQueueContextValue | null>(null)

/**
 * Component that handles React Query lifecycle for a queue item
 * This creates a React Query subscription for each queue item
 */
function QueueItemQueryHandler({ 
  item, 
  onResultUpdate,
  enabled = true 
}: { 
  item: QueueItemInternal
  onResultUpdate: (id: string, result: QueryResult) => void
  enabled?: boolean
}) {
  const queryResult = useQuery({
    ...getAtomSearchQueryOptions(item.query.query),
    enabled: enabled && item.queryEnabled,
    meta: {
      queueItemId: item.id,
      source: item.query.source
    }
  })

  // Sync React Query state back to queue manager
  useEffect(() => {
    let result: QueryResult
    
    if (queryResult.isLoading && !queryResult.data) {
      result = {
        queryId: item.query.id,
        query: item.query.query,
        matches: [],
        status: 'searching'
      }
    } else if (queryResult.isError) {
      result = {
        queryId: item.query.id,
        query: item.query.query,
        matches: [],
        status: 'error',
        error: queryResult.error?.message || 'Failed to search'
      }
    } else if (queryResult.isSuccess && queryResult.data) {
      result = {
        queryId: item.query.id,
        query: item.query.query,
        matches: queryResult.data.matches,
        summary: queryResult.data.summary,
        status: queryResult.data.matches.length > 0 ? 'found' : 'not-found'
      }
    } else {
      // Idle or other states
      return
    }

    onResultUpdate(item.id, result)
  }, [
    queryResult.status,
    queryResult.data,
    queryResult.error,
    item.id,
    item.query.id,
    item.query.query,
    onResultUpdate
  ])

  return null
}

/**
 * Provider component that combines React Query with queue management
 * 
 * Architecture:
 * - Queue Manager: Handles queue state (order, pinning, expansion)
 * - React Query: Handles data fetching and caching
 * - This hook: Bridges the two systems
 */
export function AtomQueueProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [internalQueue, setInternalQueue] = useState<QueueItemInternal[]>([])
  const [stats, setStats] = useState({ 
    total: 0, 
    pinned: 0, 
    searching: 0, 
    found: 0, 
    notFound: 0, 
    error: 0 
  })
  
  const queueManagerRef = useRef<AtomQueueManager>()
  
  // Performance optimization: batch updates
  const pendingUpdates = useRef<Map<string, QueryResult>>(new Map())
  const updateTimerRef = useRef<NodeJS.Timeout>()

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.size === 0) return
    
    const manager = queueManagerRef.current
    if (!manager) return

    // Apply all pending updates
    pendingUpdates.current.forEach((result, id) => {
      const item = manager.getQueue().find(item => item.query.id === id)
      if (item) {
        manager.updateQueryResult(id, result)
      }
    })
    
    pendingUpdates.current.clear()
    
    // Update state
    const updatedQueue = manager.getQueue() as QueueItemInternal[]
    setInternalQueue(updatedQueue)
    setStats(manager.getStats())
  }, [])

  const handleResultUpdate = useCallback((id: string, result: QueryResult) => {
    // Batch updates to prevent excessive re-renders
    pendingUpdates.current.set(result.queryId, result)
    
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }
    
    updateTimerRef.current = setTimeout(flushUpdates, 50)
  }, [flushUpdates])

  // Initialize queue manager
  useEffect(() => {
    const manager = new AtomQueueManager({
      deduplicateQueries: true,
      autoSearch: false, // We handle search via React Query
      maxItems: 20       // Limit to prevent too many queries
    })
    
    queueManagerRef.current = manager

    const updateUI = () => {
      const queue = manager.getQueue() as QueueItemInternal[]
      // Enable queries by default
      queue.forEach(item => {
        if (item.queryEnabled === undefined) {
          item.queryEnabled = true
        }
      })
      setInternalQueue(queue)
      setStats(manager.getStats())
    }

    manager.on('query:added', updateUI)
    manager.on('query:removed', ({ queryId }) => {
      updateUI()
      
      // Find if any other items use this query
      const otherItems = manager.getQueue().filter(
        item => item.query.query === queryId && item.id !== queryId
      )
      
      // If no other items use this query, remove it from cache
      if (otherItems.length === 0) {
        queryClient.removeQueries({
          queryKey: atomQueryKeys.search(queryId),
          exact: true
        })
      }
    })
    manager.on('query:updated', updateUI)
    manager.on('queue:cleared', updateUI)

    return () => {
      manager.removeAllListeners()
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [queryClient])

  // Handle document visibility to pause background queries
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause non-pinned queries when tab is hidden
        setInternalQueue(prev => prev.map(item => ({
          ...item,
          queryEnabled: item.isPinned
        })))
      } else {
        // Resume all queries when tab is visible
        setInternalQueue(prev => prev.map(item => ({
          ...item,
          queryEnabled: true
        })))
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const addQuery = useCallback((query: AtomQuery) => {
    const manager = queueManagerRef.current!
    const id = manager.addQuery(query)
    
    // Check if we have cached data
    const cachedData = queryClient.getQueryData(
      atomQueryKeys.search(query.query)
    )
    
    if (cachedData) {
      // Immediately update with cached data
      const result: QueryResult = {
        queryId: query.id,
        query: query.query,
        matches: (cachedData as any).matches || [],
        summary: (cachedData as any).summary,
        status: (cachedData as any).matches?.length > 0 ? 'found' : 'not-found'
      }
      
      manager.updateQueryResult(query.id, result)
    }
    
    // Update state
    const updatedQueue = manager.getQueue() as QueueItemInternal[]
    updatedQueue.forEach(item => {
      if (item.queryEnabled === undefined) {
        item.queryEnabled = true
      }
    })
    setInternalQueue(updatedQueue)
    setStats(manager.getStats())
    
    return id
  }, [queryClient])

  const refreshQuery = useCallback(async (queueItemId: string) => {
    const item = internalQueue.find(i => i.id === queueItemId)
    if (!item) return

    // Invalidate the atom search query
    await queryClient.invalidateQueries({
      queryKey: atomQueryKeys.search(item.query.query),
      exact: true
    })
    
    // Also invalidate image queries for all matches in this item
    if (item.result.status === 'found' && item.result.matches) {
      await Promise.all(
        item.result.matches.map(match => 
          queryClient.invalidateQueries({
            queryKey: ['atom-image', match.termId],
            exact: true
          })
        )
      )
    }
  }, [internalQueue, queryClient])

  const removeQuery = useCallback((queueItemId: string) => {
    queueManagerRef.current?.removeQuery(queueItemId)
  }, [])

  const toggleExpanded = useCallback((queueItemId: string) => {
    queueManagerRef.current?.toggleExpanded(queueItemId)
    const updatedQueue = queueManagerRef.current?.getQueue() as QueueItemInternal[]
    setInternalQueue(updatedQueue || [])
  }, [])

  const togglePinned = useCallback((queueItemId: string) => {
    queueManagerRef.current?.togglePinned(queueItemId)
    const updatedQueue = queueManagerRef.current?.getQueue() as QueueItemInternal[]
    setInternalQueue(updatedQueue || [])
  }, [])

  const clearUnpinned = useCallback(() => {
    queueManagerRef.current?.clearUnpinned()
    const updatedQueue = queueManagerRef.current?.getQueue() as QueueItemInternal[]
    setInternalQueue(updatedQueue || [])
    setStats(queueManagerRef.current?.getStats() || stats)
  }, [stats])

  const clearAll = useCallback(() => {
    queueManagerRef.current?.clearAll()
    setInternalQueue([])
    setStats({ 
      total: 0, 
      pinned: 0, 
      searching: 0, 
      found: 0, 
      notFound: 0, 
      error: 0 
    })
  }, [])

  const contextValue: AtomQueueContextValue = {
    queue: internalQueue,
    addQuery,
    removeQuery,
    refreshQuery,
    toggleExpanded,
    togglePinned,
    clearUnpinned,
    clearAll,
    stats
  }

  return (
    <>
      {/* Render query handlers outside the main tree for better performance */}
      <div style={{ display: 'none' }}>
        {internalQueue.map(item => (
          <QueueItemQueryHandler
            key={item.id}
            item={item}
            onResultUpdate={handleResultUpdate}
            enabled={!document.hidden || item.isPinned}
          />
        ))}
      </div>
      
      <AtomQueueContext.Provider value={contextValue}>
        {children}
      </AtomQueueContext.Provider>
    </>
  )
}

/**
 * Hook to use the atom queue context
 */
export function useAtomQueue() {
  const context = useContext(AtomQueueContext)
  if (!context) {
    throw new Error('useAtomQueue must be used within AtomQueueProvider')
  }
  return context
}
