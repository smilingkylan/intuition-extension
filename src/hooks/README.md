# React Hooks Directory

This directory contains custom React hooks used throughout the Intuition extension.

## Atom Queue Hooks

### `useAtomQueueWithQuery.tsx` (Primary)

The main hook that integrates React Query with the atom queue system. This replaces the old `useAtomQueue` hook.

**Key Features:**
- Combines React Query's caching with queue state management
- Automatic request deduplication
- Smart cache invalidation
- Background query pausing

**Usage:**
```typescript
import { useAtomQueue } from './hooks/useAtomQueueWithQuery'

function MyComponent() {
  const { 
    queue,
    addQuery,
    refreshQuery,
    removeQuery,
    togglePinned
  } = useAtomQueue()
  
  // Add a new search
  const id = await addQuery({
    id: 'search-1',
    query: 'x.com:username',
    source: 'hover',
    creationData: { /* ... */ }
  })
  
  // Force refresh a specific query
  await refreshQuery(id)
}
```

### `useAtomQueue.tsx` (Deprecated)

The original queue hook without React Query integration. Still present for reference but should not be used in new code.

## Other Hooks

### `useAtomQueryListener.tsx`

Listens for atom query messages from content scripts and adds them to the queue.

```typescript
// Automatically listens for messages and adds to queue
useAtomQueryListener()
```

### `useUrlAndAddressListener.tsx`

Listens for URL and Ethereum address detection from global content scripts and converts them into atom queries.

**Features:**
- Detects URLs and creates queries for all domain variants (subdomain, main domain)
- Detects Ethereum addresses on hover and creates queries
- Automatically checksums addresses using EIP-55 standard

```typescript
// Automatically listens and processes URL/address detection
useUrlAndAddressListener()
```

**How it works:**
1. Global content scripts detect URLs (on page load) and addresses (on hover)
2. Content scripts send `URL_DATA` or `ADDRESS_DETECTED` messages
3. This hook converts raw data into properly formatted `AtomQuery` objects
4. Queries are added to the atom queue for search and display

### `useAtomCreation.ts`

Handles the creation of atoms and triples on the blockchain.

```typescript
const { createAtoms, createTriples, isCreating, error } = useAtomCreation()

// Create multiple atoms
const atomIds = await createAtoms([
  { label: 'x.com:123', data: { /* ... */ } },
  { label: 'x.com:123:image', data: { /* ... */ } }
])

// Create triples (relationships)
await createTriples([
  { subjectId: atomIds[0], predicateId: 'owns', objectId: atomIds[1] }
])
```

### `useChainConfig.ts`

Provides access to blockchain configuration like deposit amounts and fees.

### `useModeContext.tsx`

Manages the current mode of the extension (explore, create, etc).

### `useNickname.ts`

Handles nickname management for atoms.

### `useToast.tsx`

Toast notification system.

### `useTransaction.tsx`

Manages blockchain transaction state and history.

## Best Practices

1. **Always use `useAtomQueueWithQuery`** for new code involving atom searches
2. **Invalidate queries after mutations**:
   ```typescript
   await queryClient.invalidateQueries({
     queryKey: atomQueryKeys.search(label)
   })
   ```
3. **Handle loading and error states** from React Query
4. **Use the refresh functionality** instead of removing and re-adding queries

## Migration from Old System

If you're updating code that uses the old `useAtomQueue`:

1. Change the import path
2. Add handling for the new `refreshQuery` method
3. Remove any manual caching logic (React Query handles it)
4. Update error handling to use React Query patterns
