import { parseEther } from 'viem'
import type { ContractConfig } from '~/background/contract-config-service'

/**
 * Calculate the assets needed for atom creation including deposit and fees
 */
export function calculateAtomAssets(
  stake: string,
  contractConfig: ContractConfig
): {
  deposit: bigint
  atomCost: bigint
  totalAssets: bigint
} {
  const atomCost = BigInt(contractConfig.atom_cost)
  const minDeposit = BigInt(contractConfig.min_deposit)
  const requestedStake = parseEther(stake)
  
  const deposit = requestedStake < minDeposit ? minDeposit : requestedStake
  const totalAssets = atomCost + deposit
  
  return { deposit, atomCost, totalAssets }
}

/**
 * Calculate the total value needed for triple creation
 */
export function calculateTripleValue(
  deposits: bigint[],
  contractConfig: ContractConfig
): bigint {
  const tripleCost = BigInt(contractConfig.triple_cost)
  return deposits.reduce((total, deposit) => total + tripleCost + deposit, BigInt(0))
}

/**
 * Calculate the total value from an array of atom assets
 */
export function calculateTotalAtomValue(
  atomsAssets: bigint[]
): bigint {
  return atomsAssets.reduce((total, assets) => total + assets, BigInt(0))
}

/**
 * Calculate a single triple's total cost
 */
export function calculateSingleTripleCost(
  deposit: bigint,
  contractConfig: ContractConfig
): bigint {
  const tripleCost = BigInt(contractConfig.triple_cost)
  return tripleCost + deposit
}
