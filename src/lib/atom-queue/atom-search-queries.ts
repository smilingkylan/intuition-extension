import { graphQLQuery } from '~/common/util/api'
import { atomQueryKeys } from './query-keys'
import type { AtomMatch, MatchSummary } from './types'
import { getAtomLabelService } from './atom-label-service'

// GraphQL query for exact match (case-insensitive) - used by Atom Queue
const searchAtomsExactQuery = `
  query SearchAtomsExact($label: String!) {
    atoms(
      where: { 
        _or: [
          { data: { _ilike: $label } },
          { label: { _ilike: $label } }
        ]
      }
    ) {
      term_id
      data
      label
      created_at
      block_number
      transaction_hash
      creator_id
      creator {
        id
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          term_id
          total_shares
          position_count
          current_share_price
        }
      }
    }
  }
`

// GraphQL query for partial match with broader search - used by CreateTripleFlow
const searchAtomsPartialQuery = `
  query SearchAtomsPartial($searchTerm: String!) {
    atoms(
      where: {
        _or: [
          { label: { _ilike: $searchTerm } },
          { data: { _ilike: $searchTerm } },
          { value: { thing: { name: { _ilike: $searchTerm } } } },
          { value: { thing: { description: { _ilike: $searchTerm } } } },
          { value: { person: { name: { _ilike: $searchTerm } } } },
          { value: { person: { description: { _ilike: $searchTerm } } } },
          { value: { organization: { name: { _ilike: $searchTerm } } } },
          { value: { organization: { description: { _ilike: $searchTerm } } } }
        ]
      }
    ) {
      term_id
      data
      label
      created_at
      block_number
      transaction_hash
      creator_id
      creator {
        id
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          term_id
          total_shares
          position_count
          current_share_price
        }
      }
    }
  }
`

export interface SearchResult {
  matches: AtomMatch[]
  summary: MatchSummary
}

/**
 * Pure async function for searching atoms by exact label match (case-insensitive)
 * This function is designed to work with React Query and is used by the Atom Queue
 * 
 * @param label - The exact label to search for
 * @returns Search results with matches and summary
 */
export async function searchAtomsByLabel(label: string): Promise<SearchResult> {
  const response = await graphQLQuery<{ atoms: any[] }>(
    searchAtomsExactQuery,
    { label }  // No wildcards for exact match
  )
  
  if (!response.data?.atoms || response.data.atoms.length === 0) {
    return {
      matches: [],
      summary: {
        totalMatches: 0,
        totalStaked: '0',
        totalPositions: 0,
        topMatches: []
      }
    }
  }

  // Process atom data
  const processedMatches: AtomMatch[] = response.data.atoms.map(atom => {
    // Calculate total staked from vaults
    const vaults = atom.term?.vaults || []
    const totalStaked = vaults.reduce((sum: number, vault: any) => {
      const sharePrice = parseFloat(vault.current_share_price || '0')
      const totalShares = parseFloat(vault.total_shares || '0')
      return sum + (sharePrice * totalShares)
    }, 0).toString()
    
    const totalPositions = vaults.reduce((sum: number, vault: any) => {
      return sum + (vault.position_count || 0)
    }, 0)

    return {
      termId: atom.term_id,
      label: atom.label || atom.data || '',
      data: atom.data,
      createdAt: atom.created_at,
      blockNumber: atom.block_number,
      transactionHash: atom.transaction_hash,
      creator: {
        id: atom.creator_id,
        label: atom.creator?.label || atom.creator_id
      },
      vaults,
      totalStaked,
      totalPositions
    }
  })

  // Sort by stake (highest first)
  const sortedMatches = processedMatches.sort((a, b) => 
    Number(b.totalStaked) - Number(a.totalStaked)
  )

  // Transform labels for display - for all matches
  const labelService = getAtomLabelService()
  const allMatches = sortedMatches
  
  // Transform labels in parallel
  const labelTransformations = await labelService.transformLabels(
    allMatches.map(match => match.label)
  )
  
  // Apply transformations to matches
  const transformedMatches = allMatches.map(match => {
    const displayInfo = labelTransformations.get(match.label)
    if (displayInfo) {
      return {
        ...match,
        displayLabel: displayInfo.displayLabel,
        displayInfo: {
          platform: displayInfo.platform,
          username: displayInfo.username,
          avatarUrl: displayInfo.avatarUrl
        }
      }
    }
    return match
  })

  // Calculate summary
  const summary: MatchSummary = {
    totalMatches: processedMatches.length,
    totalStaked: processedMatches.reduce((sum, match) => 
      (Number(sum) + Number(match.totalStaked)).toString(), '0'
    ),
    totalPositions: processedMatches.reduce((sum, match) => 
      sum + match.totalPositions, 0
    ),
    topMatches: transformedMatches.slice(0, 3)
  }

  return {
    matches: transformedMatches,
    summary
  }
}

/**
 * Search atoms with partial matching (contains search term)
 * This function is designed for broader searches like in the triple creation flow
 * 
 * @param searchTerm - The term to search for (partial matches)
 * @returns Search results with matches and summary
 */
export async function searchAtomsPartial(searchTerm: string): Promise<SearchResult> {
  const response = await graphQLQuery<{ atoms: any[] }>(
    searchAtomsPartialQuery,
    { searchTerm: `%${searchTerm}%` }  // Add wildcards for partial matching
  )
  
  if (!response.data?.atoms || response.data.atoms.length === 0) {
    return {
      matches: [],
      summary: {
        totalMatches: 0,
        totalStaked: '0',
        totalPositions: 0,
        topMatches: []
      }
    }
  }

  // Process atom data (same logic as searchAtomsByLabel)
  const processedMatches: AtomMatch[] = response.data.atoms.map(atom => {
    const vaults = atom.term?.vaults || []
    const totalStaked = vaults.reduce((sum: number, vault: any) => {
      const sharePrice = parseFloat(vault.current_share_price || '0')
      const totalShares = parseFloat(vault.total_shares || '0')
      return sum + (sharePrice * totalShares)
    }, 0).toString()
    
    const totalPositions = vaults.reduce((sum: number, vault: any) => {
      return sum + (vault.position_count || 0)
    }, 0)

    return {
      termId: atom.term_id,
      label: atom.label || atom.data || '',
      data: atom.data,
      createdAt: atom.created_at,
      blockNumber: atom.block_number,
      transactionHash: atom.transaction_hash,
      creator: {
        id: atom.creator_id,
        label: atom.creator?.label || atom.creator_id
      },
      vaults,
      totalStaked,
      totalPositions
    }
  })

  // Sort by stake (highest first)
  const sortedMatches = processedMatches.sort((a, b) => 
    Number(b.totalStaked) - Number(a.totalStaked)
  )

  // Transform labels for display - for all matches
  const labelService = getAtomLabelService()
  const allMatches = sortedMatches
  
  // Transform labels in parallel
  const labelTransformations = await labelService.transformLabels(
    allMatches.map(match => match.label)
  )
  
  // Apply transformations to matches
  const transformedMatches = allMatches.map(match => {
    const displayInfo = labelTransformations.get(match.label)
    if (displayInfo) {
      return {
        ...match,
        displayLabel: displayInfo.displayLabel,
        displayInfo: {
          platform: displayInfo.platform,
          username: displayInfo.username,
          avatarUrl: displayInfo.avatarUrl
        }
      }
    }
    return match
  })

  // Calculate summary
  const summary: MatchSummary = {
    totalMatches: processedMatches.length,
    totalStaked: processedMatches.reduce((sum, match) => 
      (Number(sum) + Number(match.totalStaked)).toString(), '0'
    ),
    totalPositions: processedMatches.reduce((sum, match) => 
      sum + match.totalPositions, 0
    ),
    topMatches: transformedMatches.slice(0, 3)
  }

  return {
    matches: transformedMatches,
    summary
  }
}

/**
 * Get React Query options for atom search
 * This provides consistent configuration for all atom search queries
 */
export function getAtomSearchQueryOptions(label: string) {
  return {
    queryKey: atomQueryKeys.search(label),
    queryFn: () => searchAtomsByLabel(label),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes (formerly cacheTime)
    retry: (failureCount: number, error: any) => {
      // Don't retry on 404s or validation errors
      if (error?.response?.status === 404) return false
      if (error?.response?.status === 400) return false
      return failureCount < 2
    },
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: true,        // Refetch if stale when component mounts
  }
}

// Cache entry type for non-React contexts
interface CacheEntry {
  data: SearchResult
  timestamp: number
  hits: number
}

/**
 * AtomSearchClient for non-React contexts (background scripts, workers)
 * Provides caching and deduplication for atom searches outside React components
 */
export class AtomSearchClient {
  private cache = new Map<string, CacheEntry>()
  private pendingRequests = new Map<string, Promise<SearchResult>>()
  
  constructor(private options: {
    cacheTimeout?: number
    maxCacheSize?: number
    onCacheHit?: (label: string) => void
    onCacheMiss?: (label: string) => void
  } = {}) {
    this.options.cacheTimeout ??= 5 * 60 * 1000 // 5 minutes default
    this.options.maxCacheSize ??= 100
  }

  /**
   * Search for atoms with caching and deduplication
   */
  async search(label: string): Promise<SearchResult> {
    // Check cache first
    const cached = this.cache.get(label)
    if (cached && !this.isExpired(cached)) {
      cached.hits++
      this.options.onCacheHit?.(label)
      return cached.data
    }

    // Check if already fetching (deduplication)
    const pending = this.pendingRequests.get(label)
    if (pending) {
      return pending
    }

    // Fetch fresh data
    this.options.onCacheMiss?.(label)
    const promise = this.fetchAndCache(label)
    this.pendingRequests.set(label, promise)
    
    try {
      const result = await promise
      return result
    } finally {
      this.pendingRequests.delete(label)
    }
  }

  private async fetchAndCache(label: string): Promise<SearchResult> {
    const data = await searchAtomsByLabel(label)
    
    // Manage cache size with LRU eviction
    if (this.cache.size >= this.options.maxCacheSize!) {
      const oldestKey = this.findOldestCacheEntry()
      if (oldestKey) this.cache.delete(oldestKey)
    }
    
    this.cache.set(label, { 
      data, 
      timestamp: Date.now(),
      hits: 0 
    })
    
    return data
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.options.cacheTimeout!
  }

  private findOldestCacheEntry(): string | undefined {
    let oldestKey: string | undefined
    let oldestTime = Infinity
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    
    return oldestKey
  }

  /**
   * Prefetch multiple labels for optimization
   */
  async prefetch(labels: string[]): Promise<void> {
    await Promise.allSettled(
      labels.map(label => this.search(label))
    )
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(label: string) {
    this.cache.delete(label)
  }

  /**
   * Clear all cache entries
   */
  invalidateAll() {
    this.cache.clear()
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    const now = Date.now()
    return {
      size: this.cache.size,
      maxSize: this.options.maxCacheSize,
      timeout: this.options.cacheTimeout,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: now - entry.timestamp,
        hits: entry.hits,
        expired: this.isExpired(entry)
      }))
    }
  }
}
