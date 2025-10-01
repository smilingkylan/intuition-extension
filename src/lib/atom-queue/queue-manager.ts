import { EventEmitter } from 'events'
import type { 
  AtomQuery, 
  QueryResult, 
  QueueItem, 
  QueueEvents, 
  QueueOptions 
} from './types'

/**
 * Manages the atom query queue
 */
export class AtomQueueManager extends EventEmitter {
  private queue: QueueItem[] = []
  private options: Required<QueueOptions>
  
  constructor(options: QueueOptions = {}) {
    super()
    this.options = {
      maxItems: options.maxItems ?? 0, // 0 = no limit
      deduplicateQueries: options.deduplicateQueries ?? true,
      autoSearch: options.autoSearch ?? true
    }
  }

  /**
   * Add a new query to the queue
   */
  addQuery(query: AtomQuery): string {
    // Check for duplicates if enabled
    if (this.options.deduplicateQueries) {
      const existingIndex = this.queue.findIndex(
        item => item.query.query === query.query && !item.isPinned
      )
      
      if (existingIndex !== -1) {
        // Move existing item to top
        const [existing] = this.queue.splice(existingIndex, 1)
        existing.addedAt = Date.now()
        this.queue.unshift(existing)
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
    this.queue.unshift(queueItem)

    // Enforce max items if set
    if (this.options.maxItems > 0 && this.queue.length > this.options.maxItems) {
      // Remove oldest unpinned items
      const unpinnedItems = this.queue.filter(item => !item.isPinned)
      if (unpinnedItems.length > this.options.maxItems) {
        const toRemove = unpinnedItems.slice(this.options.maxItems)
        toRemove.forEach(item => {
          const index = this.queue.indexOf(item)
          if (index > -1) {
            this.queue.splice(index, 1)
            this.emit('query:removed', { queryId: item.query.id })
          }
        })
      }
    }

    this.emit('query:added', { query })
    return queueItem.id
  }

  /**
   * Update the result for a query
   */
  updateQueryResult(queryId: string, result: QueryResult): void {
    const item = this.queue.find(item => item.query.id === queryId)
    if (item) {
      item.result = result
      this.emit('query:updated', { queryId, result })
    }
  }

  /**
   * Remove a query from the queue
   */
  removeQuery(queueItemId: string): void {
    const index = this.queue.findIndex(item => item.id === queueItemId)
    if (index > -1) {
      const [removed] = this.queue.splice(index, 1)
      this.emit('query:removed', { queryId: removed.query.id })
    }
  }

  /**
   * Toggle expansion state of a queue item
   */
  toggleExpanded(queueItemId: string): void {
    const item = this.queue.find(item => item.id === queueItemId)
    if (item) {
      item.isExpanded = !item.isExpanded
    }
  }

  /**
   * Toggle pin state of a queue item
   */
  togglePinned(queueItemId: string): void {
    const item = this.queue.find(item => item.id === queueItemId)
    if (item) {
      item.isPinned = !item.isPinned
    }
  }

  /**
   * Clear all unpinned items
   */
  clearUnpinned(): void {
    this.queue = this.queue.filter(item => item.isPinned)
    this.emit('queue:cleared')
  }

  /**
   * Clear entire queue
   */
  clearAll(): void {
    this.queue = []
    this.emit('queue:cleared')
  }

  /**
   * Get the current queue
   */
  getQueue(): QueueItem[] {
    return [...this.queue]
  }

  /**
   * Get a specific queue item
   */
  getQueueItem(queueItemId: string): QueueItem | undefined {
    return this.queue.find(item => item.id === queueItemId)
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      total: this.queue.length,
      pinned: this.queue.filter(item => item.isPinned).length,
      expanded: this.queue.filter(item => item.isExpanded).length,
      searching: this.queue.filter(item => item.result.status === 'searching').length,
      found: this.queue.filter(item => item.result.status === 'found').length,
      notFound: this.queue.filter(item => item.result.status === 'not-found').length,
      errors: this.queue.filter(item => item.result.status === 'error').length
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