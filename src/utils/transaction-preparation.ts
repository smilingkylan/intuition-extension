import { toHex, parseEther } from 'viem'
import type { TransactionData } from '~/components/CreateSocialAtom/types'
import type { ContractConfig } from '~/background/contract-config-service'
import { INTUITION_TESTNET } from '~/constants/web3'
import { calculateAtomAssets, calculateTotalAtomValue, calculateTripleValue } from './fees'

export interface PreparedAtomData {
  atomsData: `0x${string}`[]
  atomsAssets: bigint[]
  totalValue: bigint
}

/**
 * Prepare atom data for creation transaction
 */
export function prepareAtomsForCreation(
  txData: TransactionData,
  contractConfig: ContractConfig
): PreparedAtomData {
  const atomsData = txData.atomsToCreate.map(atom => toHex(atom.uri))
  const atomsAssets = txData.atomsToCreate.map(atom => {
    const { totalAssets } = calculateAtomAssets(atom.stake, contractConfig)
    return totalAssets
  })
  
  const totalValue = calculateTotalAtomValue(atomsAssets)
  
  return { atomsData, atomsAssets, totalValue }
}

export interface PreparedTripleData {
  subjects: bigint[]
  predicates: bigint[]
  objects: bigint[]
  deposits: bigint[]
  totalValue: bigint
}

/**
 * Prepare triple relationship data for creation
 */
export function prepareTripleRelationships(
  atomIds: string[],
  options: {
    hasImage: boolean
    hasIdentity: boolean
    contractConfig: ContractConfig
  }
): PreparedTripleData | null {
  const { hasImage, hasIdentity, contractConfig } = options
  const data: PreparedTripleData = {
    subjects: [],
    predicates: [],
    objects: [],
    deposits: [],
    totalValue: BigInt(0)
  }
  
  // Add image relationship
  if (hasImage && atomIds[1]) {
    data.subjects.push(BigInt(atomIds[0]))
    data.predicates.push(BigInt(INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID))
    data.objects.push(BigInt(atomIds[1]))
    data.deposits.push(parseEther('0.0004'))
  }
  
  // Add identity ownership relationship
  if (hasIdentity) {
    const identityAtomId = atomIds[atomIds.length - 1]
    data.subjects.push(BigInt(identityAtomId))
    data.predicates.push(BigInt(INTUITION_TESTNET.OWNS_ATOM_ID))
    data.objects.push(BigInt(atomIds[0]))
    data.deposits.push(parseEther('0.0004'))
  }
  
  if (data.subjects.length === 0) return null
  
  data.totalValue = calculateTripleValue(data.deposits, contractConfig)
  return data
}

/**
 * Map atom IDs to the expected structure
 */
export function mapAtomIdsToStructure(
  atomIds: string[],
  formData: { hasImage?: boolean; hasIdentity?: boolean }
) {
  return {
    social: atomIds[0],
    image: formData.hasImage ? atomIds[1] : undefined,
    identity: formData.hasIdentity ? atomIds[atomIds.length - 1] : undefined
  }
}
