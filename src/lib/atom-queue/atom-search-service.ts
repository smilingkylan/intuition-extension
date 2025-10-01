import { graphQLQuery } from '~/common/util/api'
import type { AtomMatch, MatchSummary } from './types'

// GraphQL query to search atoms by label with vault info
const searchAtomsQuery = `
  query SearchAtomsByLabel($label: String!) {
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
      creator_id
      creator {
        id
        label
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          vault_id
          total_shares
          position_count
          current_share_price
        }
      }
    }
  }
`

/**
 * Service for searching atoms by label
 */
export class AtomSearchService {
  /**
   * Search for atoms by label
   * @param label The label to search for
   * @returns Array of matches sorted by stake (highest first), limited to top 3
   */
  async searchByLabel(label: string): Promise<{
    matches: AtomMatch[]
    summary: MatchSummary
  }> {
    try {
      const response = await graphQLQuery<{ atoms: any[] }>(
        searchAtomsQuery,
        { label }
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

      // Transform and calculate stakes
      const allMatches = response.data.atoms.map(atom => {
        const vault = atom.term?.vaults?.[0]
        const stake = vault?.total_shares || '0'
        const positionCount = vault?.position_count || 0

        return {
          id: atom.term_id,
          label: atom.label || atom.data,
          name: atom.data,
          stake,
          positionCount,
          creator: {
            id: atom.creator_id,
            label: atom.creator?.label
          },
          createdAt: atom.created_at,
          vaultId: vault?.vault_id,
          termId: atom.term_id
        } as AtomMatch
      })

      // Sort by stake (descending)
      const sortedMatches = allMatches.sort((a, b) => {
        const stakeA = BigInt(a.stake)
        const stakeB = BigInt(b.stake)
        if (stakeA > stakeB) return -1
        if (stakeA < stakeB) return 1
        return 0
      })

      // Get top 3 matches
      const topMatches = sortedMatches.slice(0, 3)

      // Calculate summary
      const totalStaked = allMatches.reduce(
        (sum, match) => sum + BigInt(match.stake),
        BigInt(0)
      ).toString()

      const totalPositions = allMatches.reduce(
        (sum, match) => sum + match.positionCount,
        0
      )

      return {
        matches: topMatches,
        summary: {
          totalMatches: allMatches.length,
          totalStaked,
          totalPositions,
          topMatches
        }
      }
    } catch (error) {
      console.error('Error searching atoms by label:', error)
      throw error
    }
  }

  /**
   * Normalize a label for consistent searching
   * @param label The label to normalize
   * @returns Normalized label
   */
  normalizeLabel(label: string): string {
    return label
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/\/$/, '') // Remove trailing slash
  }

  /**
   * Search with normalization
   * @param label The label to search for
   * @returns Search results
   */
  async search(label: string): Promise<{
    matches: AtomMatch[]
    summary: MatchSummary
  }> {
    const normalizedLabel = this.normalizeLabel(label)
    return this.searchByLabel(normalizedLabel)
  }
} 