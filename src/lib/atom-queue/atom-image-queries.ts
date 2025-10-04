import { graphQLQuery } from '~/common/util/api'
import { CONFIG } from '~/constants'

const fetchRelatedImageQuery = `
  query GetRelatedImage($atomId: String!, $predicateId: String!) {
    triples(
      where: {
        subject_id: { _eq: $atomId }
        predicate_id: { _eq: $predicateId }
      }
      order_by: { triple_vault: { market_cap: desc_nulls_last } }
      limit: 1
    ) {
      term_id
      object_id
      triple_vault {
        market_cap
        total_shares
      }
      object {
        term_id
        label
        data
        image
      }
    }
  }
`

export interface RelatedImage {
  tripleId: string
  imageAtomId: string
  imageData?: string
  imageUrl?: string
  tripleStake: string
}

export async function fetchRelatedImage(atomId: string): Promise<RelatedImage | null> {
  if (!atomId) return null
  
  try {
    const response = await graphQLQuery<{ triples: any[] }>(
      fetchRelatedImageQuery,
      { 
        atomId,
        predicateId: CONFIG.HAS_RELATED_IMAGE_VAULT_ID 
      }
    )
    
    if (!response.data?.triples || response.data.triples.length === 0) {
      return null
    }
    
    const triple = response.data.triples[0]
    return {
      tripleId: triple.term_id,
      imageAtomId: triple.object_id,
      imageData: triple.object?.data,
      imageUrl: triple.object?.image || triple.object?.data,
      tripleStake: triple.triple_vault?.market_cap || '0'
    }
  } catch (error) {
    console.error('[fetchRelatedImage] Error fetching image for atom:', atomId, error)
    return null
  }
}

