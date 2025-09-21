import { useQuery } from '@tanstack/react-query'
import { graphQLQuery } from '~/util/api'
import { getAtomByName, getAtomByData } from '~/util/queries'

export interface Atom {
  term_id: string
  label: string
  wallet_id: string
  image?: string
  type: string
  created_at: string
  data: string
  emoji?: string
  creator?: {
    id: string
    label: string
    image?: string
  }
  term?: {
    vaults: Array<{
      term_id: string
      current_share_price: string
      total_shares: string
      position_count: number
      positions_aggregate?: {
        aggregate?: {
          count: number
          sum?: {
            shares: string
          }
        }
      }
    }>
  }
  value?: {
    person?: {
      name?: string
      image?: string
      description?: string
      url?: string
    }
    thing?: {
      name?: string
      image?: string
      description?: string
      url?: string
    }
    organization?: {
      name?: string
      image?: string
      description?: string
      url?: string
    }
    account?: {
      id?: string
      label?: string
      image?: string
    }
  }
}

interface UseAtomByNameOptions {
  name?: string | null
  enabled?: boolean
  searchByDataOnly?: boolean
}

export function useAtomByName({ name, enabled = true, searchByDataOnly = false }: UseAtomByNameOptions) {
  return useQuery({
    queryKey: ['atom-by-name', name, searchByDataOnly],
    queryFn: async () => {
      if (!name) return null
      
      const query = searchByDataOnly ? getAtomByData : getAtomByName
      const variableName = searchByDataOnly ? 'data' : 'name'
      
      const response = await graphQLQuery<{ atoms: Atom[] }>(
        query,
        { [variableName]: name }
      )
      
      // Return the first atom if found, otherwise null
      return response.data.atoms?.[0] || null
    },
    enabled: enabled && !!name,
    staleTime: 1, // 5 minutes
    gcTime: 1, // 10 minutes
  })
}

// Convenience hook for searching by a formatted label
export function useAtomByLabel(label?: string | null) {
  return useAtomByName({ 
    name: label, 
    enabled: !!label,
    searchByDataOnly: true 
  })
} 