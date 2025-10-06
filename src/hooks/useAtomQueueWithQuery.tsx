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
  currentTabId: number | null
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
 * Now with tab-specific queue support
 * 
 * Architecture:
 * - Queue Manager: Handles queue state (order, pinning, expansion) per tab
 * - React Query: Handles data fetching, caching, and invalidation
 * - This Provider: Bridges the two systems and syncs their state
 */
export function AtomQueueProvider({ 
  children,
  queueOptions 
}: { 
  children: React.ReactNode
  queueOptions?: Partial<typeof AtomQueueManager.prototype['options']>
}) {
  const queryClient = useQueryClient()
  const queueManagerRef = useRef<AtomQueueManager>()
  const [internalQueue, setInternalQueue] = useState<QueueItemInternal[]>([])
  const [stats, setStats] = useState(getEmptyStats())
  const [currentTabId, setCurrentTabId] = useState<number | null>(null)
  
  // Timer for batched updates
  const updateTimerRef = useRef<NodeJS.Timeout>()

  // Initialize queue manager
  if (!queueManagerRef.current) {
    queueManagerRef.current = new AtomQueueManager({
      ...queueOptions,
      persistQueues: true // Always enable persistence for tab-specific queues
    })
  }

  // Sync queue manager state to React state
  useEffect(() => {
    const manager = queueManagerRef.current!
    
    // Get initial tab and queue
    const initialTabId = manager.getCurrentTabId()
    setCurrentTabId(initialTabId)
    
    const updateQueueState = () => {
      const queue = manager.getQueue() as QueueItemInternal[]
      queue.forEach(item => {
        if (item.queryEnabled === undefined) {
          item.queryEnabled = true
        }
      })
      setInternalQueue(queue)
      setStats(manager.getStats())
    }
    
    // Initial update
    updateQueueState()
    
    // Subscribe to queue events
    const handleQueueChange = () => {
      // Batch updates to avoid too many re-renders
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
      
      updateTimerRef.current = setTimeout(() => {
        updateQueueState()
      }, 50)
    }
    
    const handleTabSwitch = ({ tabId }: { tabId: number }) => {
      console.log('[AtomQueueProvider] Tab switched to:', tabId)
      setCurrentTabId(tabId)
      updateQueueState()
    }

    manager.on('query:added', handleQueueChange)
    manager.on('query:removed', handleQueueChange)
    manager.on('query:updated', handleQueueChange)
    manager.on('queue:cleared', handleQueueChange)
    manager.on('tab:switched' as any, handleTabSwitch)

    return () => {
      manager.removeListener('query:added', handleQueueChange)
      manager.removeListener('query:removed', handleQueueChange)
      manager.removeListener('query:updated', handleQueueChange)
      manager.removeListener('queue:cleared', handleQueueChange)
      manager.removeListener('tab:switched' as any, handleTabSwitch)
      
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [])

  // Update query result in queue manager
  const handleResultUpdate = useCallback((id: string, result: QueryResult) => {
    queueManagerRef.current?.updateQueryResult(result.queryId, result)
  }, [])

  // Invalidate atom queries after atom creation
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'local' && changes.last_created_atom) {
        const createdAtom = changes.last_created_atom.newValue
        if (createdAtom?.label) {
          queryClient.invalidateQueries({
            queryKey: atomQueryKeys.search(createdAtom.label)
          })
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
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
    setStats(queueManagerRef.current?.getStats() || getEmptyStats())
  }, [])

  const clearAll = useCallback(() => {
    queueManagerRef.current?.clearAll()
    setInternalQueue([])
    setStats(getEmptyStats())
  }, [])

  const value: AtomQueueContextValue = {
    queue: internalQueue,
    currentTabId,
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
    <AtomQueueContext.Provider value={value}>
      {/* Render query handlers for each queue item */}
      {internalQueue.map(item => (
        <QueueItemQueryHandler
          key={item.id}
          item={item}
          onResultUpdate={handleResultUpdate}
          enabled={!document.hidden || item.isPinned}
        />
      ))}
      {children}
    </AtomQueueContext.Provider>
  )
}

/**
 * Hook to access the atom queue context
 */
export function useAtomQueue() {
  const context = useContext(AtomQueueContext)
  if (!context) {
    throw new Error('useAtomQueue must be used within AtomQueueProvider')
  }
  return context
}

// Helper to get empty stats
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