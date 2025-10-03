/**
 * Query key factory for atom-related queries
 * 
 * This provides a consistent, type-safe way to generate query keys for React Query.
 * The hierarchical structure allows for flexible cache invalidation patterns.
 * 
 * @example
 * // Use in a component
 * const { data } = useQuery(atomQueryKeys.search('x.com:123'))
 * 
 * @example
 * // Invalidate all atom queries
 * queryClient.invalidateQueries({ queryKey: atomQueryKeys.all })
 * 
 * @example
 * // Invalidate all search queries
 * queryClient.invalidateQueries({ queryKey: atomQueryKeys.searches() })
 * 
 * @example
 * // Invalidate specific search
 * queryClient.invalidateQueries({ queryKey: atomQueryKeys.search('x.com:123') })
 */

export interface SearchFilters {
  type?: 'social' | 'url' | 'address' | 'identity' | 'generic'
  createdAfter?: string
  createdBefore?: string
  minStake?: string
}

export const atomQueryKeys = {
  // Base key for all atom-related queries
  all: ['atoms'] as const,
  
  // All search queries
  searches: () => [...atomQueryKeys.all, 'search'] as const,
  
  // Specific search by label
  search: (label: string) => [...atomQueryKeys.searches(), label] as const,
  
  // Search with filters (for future extensibility)
  searchWithFilters: (label: string, filters: SearchFilters) => 
    [...atomQueryKeys.search(label), filters] as const,
  
  // Get atom by ID
  byId: (atomId: string) => [...atomQueryKeys.all, 'byId', atomId] as const,
  
  // Get atom by term ID (blockchain ID)
  byTermId: (termId: string) => [...atomQueryKeys.all, 'byTermId', termId] as const,
  
  // User's positions in atoms
  userPositions: (userId: string) => 
    [...atomQueryKeys.all, 'positions', userId] as const,
  
  // Atoms created by a user
  byCreator: (creatorId: string) => 
    [...atomQueryKeys.all, 'creator', creatorId] as const,
  
  // Recent atoms (for activity feeds)
  recent: (limit: number = 10) => 
    [...atomQueryKeys.all, 'recent', limit] as const,
} as const

// Type exports for strict typing
export type AtomQueryKey = typeof atomQueryKeys
export type AtomSearchKey = ReturnType<typeof atomQueryKeys.search>
export type AtomByIdKey = ReturnType<typeof atomQueryKeys.byId>
