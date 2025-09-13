import {
  Atom as DbAtom,
  Triple as DbTriple,
  Vault as DbVault,
} from './database'

// Re-export database types with modifications for API compatibility
export type Atom = Omit<DbAtom, 'blockNumber' | 'blockTimestamp'> & {
  contents: string
  blockNumber: number // Convert from string to number
  blockTimestamp: number // Convert from string to number
}

export type AtomIpfsDataContents = {
  '@context': string
  '@type': string
  name?: string
  description?: string
  image?: string
  url?: string
}

// Alias for backward compatibility
export type AtomContents = AtomIpfsDataContents

// Extend DbVault to include snake_case variants for API compatibility
export type Vault = DbVault & {
  // Snake case variants (for API response consistency)
  total_shares?: string
  current_share_price?: string
  position_count?: number
  atom_id?: string
  triple_id?: string
  vault_id?: string
}

// Extend DbTriple to include snake_case variants and type conversions
export type Triple = Omit<
  DbTriple,
  'blockNumber' | 'blockTimestamp' | 'transactionHash'
> & {
  creator_id: string
  subject_id: string
  predicate_id: string
  object_id: string
  vault_id: string
  counter_vault_id: string
  block_number: number
  block_timestamp: string
  transaction_hash: Buffer
}
