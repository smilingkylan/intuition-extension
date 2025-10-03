# Atom Queue System with React Query Integration

This directory contains the refactored atom queue system that integrates React Query for efficient data fetching and caching.

## Architecture Overview

The system separates concerns into three main layers:

1. **Data Fetching Layer** (React Query) - Handles API calls, caching, and invalidation
2. **Queue Management Layer** - Manages UI state like order, pinning, and expansion
3. **Integration Layer** - Bridges React Query with the queue system

## Key Components

### 1. Query Keys (`query-keys.ts`)

Provides a type-safe, hierarchical query key factory:

```typescript
// Search for a specific atom
atomQueryKeys.search('x.com:123')
// Result: ['atoms', 'search', 'x.com:123']

// Invalidate all atom queries
queryClient.invalidateQueries({ queryKey: atomQueryKeys.all })

// Invalidate all search queries
queryClient.invalidateQueries({ queryKey: atomQueryKeys.searches() })
```

### 2. Atom Search Queries (`atom-search-queries.ts`)

Contains the pure async functions for data fetching:

- `searchAtomsByLabel()` - Main search function for React Query
- `getAtomSearchQueryOptions()` - Pre-configured query options
- `AtomSearchClient` - Client for non-React contexts (background scripts)

### 3. Hybrid Queue Hook (`useAtomQueueWithQuery.tsx`)

Combines React Query with queue management:

```typescript
const { 
  queue,           // Current queue items
  addQuery,        // Add new search
  refreshQuery,    // Force refresh a specific query
  removeQuery,     // Remove from queue
  togglePinned,    // Pin/unpin items
  clearAll         // Clear queue
} = useAtomQueue()
```

## Features

### Automatic Cache Management

- **Shared Cache**: Multiple queue items searching for the same label share one cache entry
- **Smart Invalidation**: Cache is automatically cleared after atom creation
- **Background Pause**: Non-pinned queries pause when tab is hidden to save resources

### Refresh Functionality

Queue items show a refresh button for "not found" or "error" states:

```typescript
// In component
await refreshQuery(queueItemId)

// This invalidates the React Query cache and triggers a refetch
```

### Performance Optimizations

1. **Batched Updates**: Queue updates are batched to prevent excessive re-renders
2. **Query Limiting**: Maximum 20 concurrent queries to prevent overload
3. **Stale-While-Revalidate**: Shows cached data while fetching fresh data
4. **Deduplication**: Prevents duplicate searches in both queue and network layers

## Usage Examples

### In React Components

```typescript
import { useQuery } from '@tanstack/react-query'
import { getAtomSearchQueryOptions } from './atom-search-queries'

function MyComponent({ label }: { label: string }) {
  const { data, isLoading, refetch } = useQuery(
    getAtomSearchQueryOptions(label)
  )
  
  // Data is cached and shared across all components
}
```

### In Background Scripts

```typescript
import { AtomSearchClient } from './atom-search-queries'

const searchClient = new AtomSearchClient({
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  onCacheHit: (label) => console.log(`Cache hit: ${label}`)
})

// Search with automatic caching
const result = await searchClient.search('x.com:123')

// Invalidate after creation
searchClient.invalidate('x.com:123')
```

### After Creating Atoms

```typescript
// In CreateSocialAtomFlow
const queryClient = useQueryClient()

// After successful creation
await queryClient.invalidateQueries({
  queryKey: atomQueryKeys.search(createdAtomLabel)
})
```

## Migration Guide

To use the new system:

1. Replace imports:
   ```typescript
   // Old
   import { useAtomQueue } from './hooks/useAtomQueue'
   
   // New
   import { useAtomQueue } from './hooks/useAtomQueueWithQuery'
   ```

2. The API remains the same, but now includes `refreshQuery()`:
   ```typescript
   const { refreshQuery } = useAtomQueue()
   await refreshQuery(queueItemId)
   ```

3. Atom searches are now cached and deduplicated automatically

## Benefits

1. **Better Performance**: Shared cache, request deduplication, smart refetching
2. **Improved UX**: Instant results from cache, background updates, refresh on demand
3. **Developer Experience**: Type-safe query keys, consistent patterns, easy debugging
4. **Maintainability**: Clear separation of concerns, standard React patterns

## Future Enhancements

- Add optimistic updates when creating atoms
- Implement infinite scroll for large result sets
- Add WebSocket support for real-time updates
- Support for batch atom creation
