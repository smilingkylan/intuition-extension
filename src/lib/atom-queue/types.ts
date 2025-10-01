/**
 * Types for the query-based atom display queue system
 */

/**
 * Source of the query - helps determine behavior
 */
export type QuerySource = 'hover' | 'url' | 'highlight' | 'manual' | 'click'

/**
 * Type of entity being queried
 */
export type EntityType = 'social' | 'url' | 'address' | 'generic' | 'identity'

/**
 * Data needed to create an atom if it doesn't exist
 */
export interface AtomCreationData {
  type: EntityType
  name: string
  description?: string
  platform?: string
  username?: string
  userId?: string
  url?: string
  address?: string
  metadata: Record<string, any>
}

/**
 * Represents a single atom that was found
 */
export interface AtomMatch {
  id: string
  label: string
  name: string
  stake: string // Total staked amount in wei
  positionCount: number
  creator: {
    id: string
    label?: string
  }
  createdAt: string
  vaultId?: string
  termId: string
}

/**
 * Summary statistics for multiple matches
 */
export interface MatchSummary {
  totalMatches: number
  totalStaked: string // Sum of all stakes in wei
  totalPositions: number
  topMatches: AtomMatch[] // Top 3 by stake
}

/**
 * A query sent by a plugin
 */
export interface AtomQuery {
  id: string
  query: string // The search term (e.g., "x.com:123456")
  source: QuerySource
  creationData: AtomCreationData
  timestamp: number
}

/**
 * The result of searching for atoms
 */
export interface QueryResult {
  queryId: string
  query: string
  matches: AtomMatch[]
  summary?: MatchSummary
  status: 'searching' | 'found' | 'not-found' | 'error'
  error?: string
}

/**
 * An item in the display queue
 */
export interface QueueItem {
  id: string
  query: AtomQuery
  result: QueryResult
  isExpanded: boolean
  isPinned: boolean
  addedAt: number
}

/**
 * Events emitted by the queue system
 */
export interface QueueEvents {
  'query:added': { query: AtomQuery }
  'query:removed': { queryId: string }
  'query:updated': { queryId: string; result: QueryResult }
  'queue:cleared': void
}

/**
 * Options for the queue manager
 */
export interface QueueOptions {
  maxItems?: number // Maximum items in queue (default: no limit)
  deduplicateQueries?: boolean // Whether to dedupe identical queries
  autoSearch?: boolean // Whether to automatically search on add
} 