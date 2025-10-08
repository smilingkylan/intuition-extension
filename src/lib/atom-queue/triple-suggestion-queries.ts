import { graphQLQuery } from '~/util/api'

// Query to get triples containing a specific atom
const getTriplesContainingAtomQuery = `
  query GetTriplesContainingAtom($atomId: String!, $limit: Int = 50) {
    triples(
      order_by: { 
        term: {
          vaults_aggregate: {
            sum: {
              total_shares: desc
            }
          }
        }
      }
      limit: $limit
      where: {
        _or: [
          { subject_id: { _eq: $atomId } },
          { predicate_id: { _eq: $atomId } },
          { object_id: { _eq: $atomId } }
        ]
      }
    ) {
      term_id
      subject_id
      predicate_id
      object_id
      subject {
        term_id
        data
        label
      }
      predicate {
        term_id
        data
        label
      }
      object {
        term_id
        data
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          current_share_price
          total_shares
          position_count
        }
      }
    }
  }
`

// Query to get triples containing a specific atom with search filter
const getTriplesContainingAtomWithSearchQuery = `
  query GetTriplesContainingAtomWithSearch($atomId: String!, $searchTerm: String, $limit: Int = 50) {
    triples(
      order_by: { 
        term: {
          vaults_aggregate: {
            sum: {
              total_shares: desc
            }
          }
        }
      }
      limit: $limit
      where: {
        _and: [
          {
            _or: [
              { subject_id: { _eq: $atomId } },
              { predicate_id: { _eq: $atomId } },
              { object_id: { _eq: $atomId } }
            ]
          }
        ]
      }
    ) {
      term_id
      subject_id
      predicate_id
      object_id
      subject {
        term_id
        data
        label
      }
      predicate {
        term_id
        data
        label
      }
      object {
        term_id
        data
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          current_share_price
          total_shares
          position_count
        }
      }
    }
  }
`

// Query to get triples by atom type pattern
const getTriplesByTypePatternQuery = `
  query GetTriplesByTypePattern($pattern: String!, $limit: Int = 100) {
    triples(
      order_by: { 
        term: {
          vaults_aggregate: {
            sum: {
              total_shares: desc
            }
          }
        }
      }
      limit: $limit
      where: {
        _or: [
          {
            subject: { data: { _ilike: $pattern } }
          }
        ]
      }
    ) {
      term_id
      subject_id
      predicate_id
      object_id
      subject {
        term_id
        data
        label
      }
      predicate {
        term_id
        data
        label
      }
      object {
        term_id
        data
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          current_share_price
          total_shares
          position_count
        }
      }
    }
  }
`

// Query to get most frequently used atoms by position
const getMostFrequentAtomsByPositionQuery = `
  query GetMostFrequentAtomsByPosition($limit: Int = 1000) {
    triples(
      limit: $limit
      order_by: { created_at: desc }
    ) {
      subject_id
      predicate_id
      object_id
      subject {
        term_id
        data
        label
      }
      predicate {
        term_id
        data
        label
      }
      object {
        term_id
        data
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          current_share_price
          total_shares
          position_count
        }
      }
    }
  }
`

interface AtomType {
  type: 'social' | 'evm-address' | 'url' | 'other'
  pattern?: string
}

export function detectAtomType(atomData: string | undefined): AtomType {
  if (!atomData) return { type: 'other' }
  
  const data = atomData.toLowerCase()
  
  // Social atoms (X.com/Twitter)
  if (data.includes('x.com:') || data.includes('twitter.com:')) {
    return { type: 'social', pattern: '%x.com:%' }
  }
  
  // EVM addresses
  if (data.startsWith('0x') && data.length === 42) {
    return { type: 'evm-address', pattern: '0x%' }
  }
  
  // URLs
  if (data.startsWith('http://') || data.startsWith('https://') || data.includes('.com') || data.includes('.org')) {
    return { type: 'url', pattern: '%http%' }
  }
  
  return { type: 'other' }
}

export interface TripleSuggestion {
  atomId: string
  label: string
  data: string
  displayLabel?: string
  frequency: number // How many times this atom appears in this position
  totalStake: string // Total stake across all triples
}

/**
 * Get suggested atoms based on highest staked triples for a given atom and position
 * 
 * This function finds triples where the current atom appears in the specified position,
 * then extracts and ranks atoms from the target position by frequency and stake.
 * 
 * @param currentAtomId - The ID of the current atom being used to create a triple
 * @param currentAtomData - The data/label of the current atom (used for type detection)
 * @param currentPosition - The position the current atom will occupy (subject/predicate/object)
 * @param targetPosition - The position we're looking for suggestions for
 */
export async function getSuggestedAtomsForPosition(
  currentAtomId: string,
  currentAtomData: string,
  currentPosition: 'subject' | 'predicate' | 'object',
  targetPosition: 'subject' | 'predicate' | 'object',
  searchTerm?: string
): Promise<TripleSuggestion[]> {
  try {
    console.log('[TripleSuggestions] Fetching suggestions for:', {
      currentAtomId,
      currentPosition,
      targetPosition,
      searchTerm
    })
    
    // First, get triples that contain the current atom
    // Use search-enabled query if search term is provided
    const query = searchTerm ? getTriplesContainingAtomWithSearchQuery : getTriplesContainingAtomQuery
    const variables: any = { atomId: currentAtomId, limit: 50 }
    
    if (searchTerm) {
      variables.searchTerm = `%${searchTerm}%`
    }
    
    const response = await graphQLQuery<{ triples: any[] }>(query, variables)
    
    if (!response.data?.triples || response.data.triples.length === 0) {
      console.log('[TripleSuggestions] No triples found for atom:', currentAtomId)
      
      // Fallback: Try to find triples by atom type
      const atomType = detectAtomType(currentAtomData)
      if (atomType.pattern && atomType.type !== 'other') {
        return await getSuggestedAtomsByType(atomType, currentPosition, targetPosition, searchTerm)
      }
      
      return []
    }
    
    console.log('[TripleSuggestions] Found', response.data.triples.length, 'triples')
    
    // Filter triples where the current atom is in the specified position
    const relevantTriples = response.data.triples.filter(triple => {
      switch (currentPosition) {
        case 'subject':
          return triple.subject_id === currentAtomId
        case 'predicate':
          return triple.predicate_id === currentAtomId
        case 'object':
          return triple.object_id === currentAtomId
        default:
          return false
      }
    })
    
    console.log('[TripleSuggestions] Filtered to', relevantTriples.length, 'relevant triples')
    
    // Extract atoms from the target position and count frequency
    const atomFrequency = new Map<string, {
      atom: any
      count: number
      totalStake: bigint
    }>()
    
    relevantTriples.forEach(triple => {
      let targetAtom
      switch (targetPosition) {
        case 'subject':
          targetAtom = triple.subject
          break
        case 'predicate':
          targetAtom = triple.predicate
          break
        case 'object':
          targetAtom = triple.object
          break
      }
      
      if (!targetAtom) return
      
      const atomId = targetAtom.term_id
      const stake = triple.term?.vaults?.[0]?.total_shares || '0'
      
      if (atomFrequency.has(atomId)) {
        const existing = atomFrequency.get(atomId)!
        existing.count++
        existing.totalStake += BigInt(stake)
      } else {
        atomFrequency.set(atomId, {
          atom: targetAtom,
          count: 1,
          totalStake: BigInt(stake)
        })
      }
    })
    
    // Convert to array and sort by frequency and stake
    let suggestions: TripleSuggestion[] = Array.from(atomFrequency.entries())
      .map(([atomId, data]) => ({
        atomId,
        label: data.atom.label || data.atom.data || '',
        data: data.atom.data || '',
        displayLabel: data.atom.label,
        frequency: data.count,
        totalStake: data.totalStake.toString()
      }))
    
    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      suggestions = suggestions.filter(s => 
        s.label.toLowerCase().includes(searchLower) ||
        s.data.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort and slice
    suggestions = suggestions
      .sort((a, b) => {
        // Sort by frequency first, then by stake
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency
        }
        return Number(BigInt(b.totalStake) - BigInt(a.totalStake))
      })
      .slice(0, 10) // Top 10 suggestions
    
    console.log('[TripleSuggestions] Returning', suggestions.length, 'suggestions')
    return suggestions
  } catch (error) {
    console.error('[TripleSuggestions] Error fetching suggestions:', error)
    return []
  }
}

/**
 * Get atoms from similar typed triples (e.g., all triples with EVM addresses as subjects)
 * 
 * This is a fallback when we don't have existing triples for the specific atom.
 */
export async function getSuggestedAtomsByType(
  atomType: AtomType,
  position: 'subject' | 'predicate' | 'object',
  targetPosition: 'subject' | 'predicate' | 'object',
  searchTerm?: string
): Promise<TripleSuggestion[]> {
  try {
    if (!atomType.pattern) return []
    
    console.log('[TripleSuggestions] Fetching by type pattern:', atomType.pattern)
    
    const response = await graphQLQuery<{ triples: any[] }>(
      getTriplesByTypePatternQuery,
      { 
        pattern: atomType.pattern,
        limit: 100
      }
    )
    
    if (!response.data?.triples || response.data.triples.length === 0) {
      return []
    }
    
    // Filter triples where the subject matches the pattern (for now, focusing on subject position)
    const relevantTriples = response.data.triples.filter(triple => {
      const subjectData = triple.subject?.data?.toLowerCase() || ''
      const patternLower = atomType.pattern!.toLowerCase().replace(/%/g, '')
      return subjectData.includes(patternLower)
    })
    
    // Extract atoms from the target position and count frequency
    const atomFrequency = new Map<string, {
      atom: any
      count: number
      totalStake: bigint
    }>()
    
    relevantTriples.forEach(triple => {
      let targetAtom
      switch (targetPosition) {
        case 'subject':
          targetAtom = triple.subject
          break
        case 'predicate':
          targetAtom = triple.predicate
          break
        case 'object':
          targetAtom = triple.object
          break
      }
      
      if (!targetAtom) return
      
      const atomId = targetAtom.term_id
      const stake = triple.term?.vaults?.[0]?.total_shares || '0'
      
      if (atomFrequency.has(atomId)) {
        const existing = atomFrequency.get(atomId)!
        existing.count++
        existing.totalStake += BigInt(stake)
      } else {
        atomFrequency.set(atomId, {
          atom: targetAtom,
          count: 1,
          totalStake: BigInt(stake)
        })
      }
    })
    
    let suggestions: TripleSuggestion[] = Array.from(atomFrequency.entries())
      .map(([atomId, data]) => ({
        atomId,
        label: data.atom.label || data.atom.data || '',
        data: data.atom.data || '',
        displayLabel: data.atom.label,
        frequency: data.count,
        totalStake: data.totalStake.toString()
      }))
    
    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      suggestions = suggestions.filter(s => 
        s.label.toLowerCase().includes(searchLower) ||
        s.data.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort and slice
    suggestions = suggestions
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency
        }
        return Number(BigInt(b.totalStake) - BigInt(a.totalStake))
      })
      .slice(0, 10)
    
    console.log('[TripleSuggestions] Returning', suggestions.length, 'type-based suggestions')
    return suggestions
  } catch (error) {
    console.error('[TripleSuggestions] Error fetching by type:', error)
    return []
  }
}

/**
 * Get most frequently used atoms for a specific position
 * This is useful for showing default suggestions before the user searches
 * 
 * @param position - The position to get frequent atoms for (subject/predicate/object)
 * @param limit - Maximum number of atoms to return
 */
export async function getMostFrequentAtomsForPosition(
  position: 'subject' | 'predicate' | 'object',
  limit: number = 10
): Promise<TripleSuggestion[]> {
  try {
    console.log('[TripleSuggestions] Fetching most frequent atoms for position:', position)
    
    // Fetch a large sample of recent triples
    const response = await graphQLQuery<{ triples: any[] }>(
      getMostFrequentAtomsByPositionQuery,
      { limit: 1000 }
    )
    
    if (!response.data?.triples || response.data.triples.length === 0) {
      console.log('[TripleSuggestions] No triples found')
      return []
    }
    
    console.log('[TripleSuggestions] Analyzing', response.data.triples.length, 'triples')
    
    // Count frequency of atoms in the specified position
    const atomFrequency = new Map<string, {
      atom: any
      count: number
      totalStake: bigint
    }>()
    
    response.data.triples.forEach(triple => {
      const atom = triple[position]
      if (!atom) return
      
      const atomId = atom.term_id
      const stake = triple.term?.vaults?.[0]?.total_shares || '0'
      
      if (atomFrequency.has(atomId)) {
        const existing = atomFrequency.get(atomId)!
        existing.count++
        existing.totalStake += BigInt(stake)
      } else {
        atomFrequency.set(atomId, {
          atom,
          count: 1,
          totalStake: BigInt(stake)
        })
      }
    })
    
    // Convert to array and sort by frequency
    const suggestions: TripleSuggestion[] = Array.from(atomFrequency.entries())
      .map(([atomId, data]) => ({
        atomId,
        label: data.atom.label || data.atom.data || '',
        data: data.atom.data || '',
        displayLabel: data.atom.label,
        frequency: data.count,
        totalStake: data.totalStake.toString()
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
    
    console.log('[TripleSuggestions] Returning', suggestions.length, 'most frequent atoms')
    return suggestions
  } catch (error) {
    console.error('[TripleSuggestions] Error fetching frequent atoms:', error)
    return []
  }
}