import { EventEmitter } from 'events'
import type { 
  AtomQuery, 
  QueryResult, 
  QueueItem, 
  QueueEvents, 
  QueueOptions 
} from './types'

// Storage interface for persisted queue data
interface PersistedQueueData {
  items: QueueItem[]
  url?: string
  lastUpdated: number
}

/**
 * Manages tab-specific atom query queues with persistence
 */
export class AtomQueueManager extends EventEmitter {
  private queues: Map<number, QueueItem[]> = new Map()
  private currentTabId: number | null = null
  private options: Required<QueueOptions>
  private persistenceEnabled: boolean = false
  
  constructor(options: QueueOptions = {}) {
    super()
    this.options = {
      maxItems: options.maxItems ?? 50,
      deduplicateQueries: options.deduplicateQueries ?? true,
      autoSearch: options.autoSearch ?? true,
      persistQueues: options.persistQueues ?? true
    }
    
    this.persistenceEnabled = this.options.persistQueues
    
    // Initialize tab tracking and load persisted data
    this.initializeTabTracking()
    
    if (this.persistenceEnabled) {
      this.loadPersistedQueues()
    }
  }
  
  /**
   * Initialize tab tracking and listeners
   */
  private async initializeTabTracking() {
    try {
      // Get current active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (activeTab?.id) {
        this.currentTabId = activeTab.id
        console.log('[QueueManager] Initialized with tab:', this.currentTabId)
      }
      
      // Listen for tab activation changes
      chrome.tabs.onActivated.addListener((activeInfo) => {
        console.log('[QueueManager] Tab activated:', activeInfo.tabId)
        this.switchToTab(activeInfo.tabId)
      })
      
      // Clean up when tabs are closed
      chrome.tabs.onRemoved.addListener((tabId) => {
        console.log('[QueueManager] Tab removed:', tabId)
        this.queues.delete(tabId)
        if (this.persistenceEnabled) {
          this.removePersistedQueue(tabId)
        }
      })
      
      // Also listen for window focus changes
      chrome.windows.onFocusChanged.addListener(async (windowId) => {
        if (windowId !== chrome.windows.WINDOW_ID_NONE) {
          const [activeTab] = await chrome.tabs.query({ active: true, windowId })
          if (activeTab?.id && activeTab.id !== this.currentTabId) {
            this.switchToTab(activeTab.id)
          }
        }
      })
    } catch (error) {
      console.error('[QueueManager] Failed to initialize tab tracking:', error)
    }
  }
  
  /**
   * Switch to a different tab's queue
   */
  public switchToTab(tabId: number) {
    if (this.currentTabId !== tabId) {
      console.log('[QueueManager] Switching from tab', this.currentTabId, 'to', tabId)
      this.currentTabId = tabId
      
      // Initialize queue for new tab if needed
      if (!this.queues.has(tabId)) {
        this.queues.set(tabId, [])
      }
      
      // Emit event to notify listeners about tab switch
      this.emit('tab:switched', { tabId, queue: this.getCurrentQueue() })
    }
  }
  
  /**
   * Get the current tab's queue
   */
  private getCurrentQueue(): QueueItem[] {
    if (!this.currentTabId) {
      console.warn('[QueueManager] No current tab ID set')
      return []
    }
    
    if (!this.queues.has(this.currentTabId)) {
      this.queues.set(this.currentTabId, [])
    }
    
    return this.queues.get(this.currentTabId)!
  }

  /**
   * Add a new query to the current tab's queue
   */
  addQuery(query: AtomQuery): string {
    const queue = this.getCurrentQueue()
    
    // Check for duplicates if enabled
    if (this.options.deduplicateQueries) {
      const existingIndex = queue.findIndex(
        item => item.query.query === query.query && !item.isPinned
      )
      
      if (existingIndex !== -1) {
        // Move existing item to top
        const [existing] = queue.splice(existingIndex, 1)
        existing.addedAt = Date.now()
        queue.unshift(existing)
        return existing.id
      }
    }

    // Create new queue item
    const queueItem: QueueItem = {
      id: `${query.id}-${Date.now()}`,
      query,
      result: {
        queryId: query.id,
        query: query.query,
        matches: [],
        status: 'searching'
      },
      isExpanded: false,
      isPinned: false,
      addedAt: Date.now()
    }

    // Add to beginning of queue
    queue.unshift(queueItem)

    // Enforce max items if set
    if (this.options.maxItems > 0 && queue.length > this.options.maxItems) {
      // Remove oldest unpinned items
      const unpinnedItems = queue.filter(item => !item.isPinned)
      if (unpinnedItems.length > this.options.maxItems) {
        const toRemove = unpinnedItems.slice(this.options.maxItems)
        toRemove.forEach(item => {
          const index = queue.indexOf(item)
          if (index > -1) {
            queue.splice(index, 1)
            this.emit('query:removed', { queryId: item.query.id })
          }
        })
      }
    }

    this.emit('query:added', { query })
    
    // Persist queue after adding
    if (this.persistenceEnabled && this.currentTabId) {
      this.persistQueue(this.currentTabId)
    }
    
    return queueItem.id
  }

  /**
   * Update the result for a query
   */
  updateQueryResult(queryId: string, result: QueryResult): void {
    const queue = this.getCurrentQueue()
    const item = queue.find(item => item.query.id === queryId)
    if (item) {
      item.result = result
      this.emit('query:updated', { queryId, result })
      
      // Persist after update
      if (this.persistenceEnabled && this.currentTabId) {
        this.persistQueue(this.currentTabId)
      }
    }
  }

  /**
   * Remove a query from the queue
   */
  removeQuery(queueItemId: string): void {
    const queue = this.getCurrentQueue()
    const index = queue.findIndex(item => item.id === queueItemId)
    if (index > -1) {
      const [removed] = queue.splice(index, 1)
      this.emit('query:removed', { queryId: removed.query.id })
      
      // Persist after removal
      if (this.persistenceEnabled && this.currentTabId) {
        this.persistQueue(this.currentTabId)
      }
    }
  }

  /**
   * Toggle expansion state of a queue item
   */
  toggleExpanded(queueItemId: string): void {
    const queue = this.getCurrentQueue()
    const item = queue.find(item => item.id === queueItemId)
    if (item) {
      item.isExpanded = !item.isExpanded
    }
  }

  /**
   * Toggle pin state of a queue item
   */
  togglePinned(queueItemId: string): void {
    const queue = this.getCurrentQueue()
    const item = queue.find(item => item.id === queueItemId)
    if (item) {
      item.isPinned = !item.isPinned
      
      // Persist after pin state change
      if (this.persistenceEnabled && this.currentTabId) {
        this.persistQueue(this.currentTabId)
      }
    }
  }

  /**
   * Clear all unpinned items in current tab
   */
  clearUnpinned(): void {
    if (!this.currentTabId) return
    
    const queue = this.getCurrentQueue()
    const pinnedItems = queue.filter(item => item.isPinned)
    this.queues.set(this.currentTabId, pinnedItems)
    
    this.emit('queue:cleared')
    
    // Persist after clearing
    if (this.persistenceEnabled) {
      this.persistQueue(this.currentTabId)
    }
  }

  /**
   * Clear entire queue for current tab
   */
  clearAll(): void {
    if (!this.currentTabId) return
    
    this.queues.set(this.currentTabId, [])
    this.emit('queue:cleared')
    
    // Persist empty queue
    if (this.persistenceEnabled) {
      this.persistQueue(this.currentTabId)
    }
  }

  /**
   * Get the current tab's queue
   */
  getQueue(): QueueItem[] {
    return [...this.getCurrentQueue()]
  }
  
  /**
   * Get queue for a specific tab
   */
  getQueueForTab(tabId: number): QueueItem[] {
    return [...(this.queues.get(tabId) || [])]
  }

  /**
   * Get a specific queue item
   */
  getQueueItem(queueItemId: string): QueueItem | undefined {
    const queue = this.getCurrentQueue()
    return queue.find(item => item.id === queueItemId)
  }

  /**
   * Get queue statistics for current tab
   */
  getStats() {
    const queue = this.getCurrentQueue()
    return {
      total: queue.length,
      pinned: queue.filter(item => item.isPinned).length,
      expanded: queue.filter(item => item.isExpanded).length,
      searching: queue.filter(item => item.result.status === 'searching').length,
      found: queue.filter(item => item.result.status === 'found').length,
      notFound: queue.filter(item => item.result.status === 'not-found').length,
      errors: queue.filter(item => item.result.status === 'error').length
    }
  }
  
  /**
   * Get current tab ID
   */
  getCurrentTabId(): number | null {
    return this.currentTabId
  }
  
  /**
   * Persist a tab's queue to chrome.storage
   */
  private async persistQueue(tabId: number) {
    if (!this.persistenceEnabled) return
    
    try {
      const queue = this.queues.get(tabId)
      if (!queue) return
      
      // Get tab URL for context
      let url: string | undefined
      try {
        const tab = await chrome.tabs.get(tabId)
        url = tab.url
      } catch {
        // Tab might not exist anymore
      }
      
      const data: PersistedQueueData = {
        items: queue,
        url,
        lastUpdated: Date.now()
      }
      
      await chrome.storage.local.set({
        [`queue_tab_${tabId}`]: data
      })
      
      console.log(`[QueueManager] Persisted queue for tab ${tabId}, ${queue.length} items`)
    } catch (error) {
      console.error('[QueueManager] Failed to persist queue:', error)
    }
  }
  
  /**
   * Load all persisted queues from storage
   */
  private async loadPersistedQueues() {
    try {
      const data = await chrome.storage.local.get()
      let loadedCount = 0
      
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('queue_tab_')) {
          const tabIdMatch = key.match(/queue_tab_(\d+)/)
          if (!tabIdMatch) continue
          
          const tabId = parseInt(tabIdMatch[1])
          const persistedData = value as PersistedQueueData
          
          // Check if tab still exists
          try {
            await chrome.tabs.get(tabId)
            this.queues.set(tabId, persistedData.items)
            loadedCount++
            console.log(`[QueueManager] Loaded queue for tab ${tabId}, ${persistedData.items.length} items`)
          } catch {
            // Tab doesn't exist anymore, clean up
            await chrome.storage.local.remove([key])
          }
        }
      }
      
      console.log(`[QueueManager] Loaded ${loadedCount} persisted queues`)
    } catch (error) {
      console.error('[QueueManager] Failed to load persisted queues:', error)
    }
  }
  
  /**
   * Remove persisted queue for a tab
   */
  private async removePersistedQueue(tabId: number) {
    if (!this.persistenceEnabled) return
    
    try {
      await chrome.storage.local.remove([`queue_tab_${tabId}`])
      console.log(`[QueueManager] Removed persisted queue for tab ${tabId}`)
    } catch (error) {
      console.error('[QueueManager] Failed to remove persisted queue:', error)
    }
  }

  /**
   * Listen to typed events
   */
  on<K extends keyof QueueEvents>(
    event: K,
    listener: (data: QueueEvents[K]) => void
  ): this {
    return super.on(event, listener)
  }

  emit<K extends keyof QueueEvents>(
    event: K,
    data: QueueEvents[K]
  ): boolean {
    return super.emit(event, data)
  }
}