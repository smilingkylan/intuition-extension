import React, { createContext, useContext } from 'react'
import { AtomQueueProvider as BaseQueueProvider, useAtomQueue } from '../hooks/useAtomQueueWithQuery'
import type { QueueItem } from '../lib/atom-queue/types'

interface QueueContextValue {
  currentTabId: number | null
  queue: QueueItem[]
  isTabSpecific: boolean
}

const QueueContext = createContext<QueueContextValue>({
  currentTabId: null,
  queue: [],
  isTabSpecific: true
})

/**
 * Provider component that wraps the AtomQueueProvider and provides
 * additional context about tab-specific queues
 */
export function QueueProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseQueueProvider>
      <QueueContextInner>{children}</QueueContextInner>
    </BaseQueueProvider>
  )
}

/**
 * Inner component that has access to the queue data
 */
function QueueContextInner({ children }: { children: React.ReactNode }) {
  const { queue, currentTabId } = useAtomQueue()
  
  const value: QueueContextValue = {
    currentTabId,
    queue,
    isTabSpecific: true
  }
  
  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  )
}

/**
 * Hook to access queue context
 */
export function useQueueContext() {
  return useContext(QueueContext)
}
