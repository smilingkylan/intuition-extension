import { useState } from 'react'
import { 
  createAtoms as protocolCreateAtoms, 
  createTriples as protocolCreateTriples, 
  eventParseAtomCreated, 
  eventParseTripleCreated 
} from '@0xintuition/protocol'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { prepareAtomsForCreation } from '~/utils/transaction-preparation'
import { parseTransactionError } from '~/utils/error-handling'
import { INTUITION_TESTNET } from '~/constants/web3'
import type { TransactionData } from '~/components/CreateSocialAtom/types'
import type { Address, Hex } from 'viem'
import { toHex } from 'viem'

interface AtomData {
  label: string
  data: any
}

interface TripleData {
  subjectId: string
  predicateId: string
  objectId: string
}

export function useAtomCreation() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { publicClient, walletClient, contractConfig, waitForTransactionReceipt } = useTransactionProvider()
  
  const createAtomsFromData = async (txData: TransactionData) => {
    if (!publicClient || !walletClient || !contractConfig) {
      throw new Error('Wallet not ready. Please ensure your wallet is connected.')
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      const { atomsData, atomsAssets, totalValue } = prepareAtomsForCreation(txData, contractConfig)
      
      // Use SDK's createAtoms which includes simulateContract
      const txHash = await protocolCreateAtoms(
        { 
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          walletClient,
          publicClient 
        },
        {
          args: [atomsData, atomsAssets],
          value: totalValue
        }
      )
      
      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(txHash as Hex)
      
      // Parse atom IDs from events
      const atomEvents = await eventParseAtomCreated(publicClient, receipt.transactionHash)
      const atomIds = atomEvents.map(event => event.args.termId.toString())
      
      if (atomIds.length === 0) {
        throw new Error('No atom IDs found in transaction receipt')
      }
      
      return { txHash, receipt, atomIds }
    } catch (err: any) {
      const error = parseTransactionError(err)
      setError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }
  
  const createAtoms = async (atoms: AtomData[]) => {
    if (!publicClient || !walletClient || !contractConfig) {
      throw new Error('Wallet not ready. Please ensure your wallet is connected.')
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      console.log('[useAtomCreation] Starting atom creation with:', {
        atomCount: atoms.length,
        atoms: atoms.map(a => ({ label: a.label, dataKeys: Object.keys(a.data) })),
        contractConfig: {
          min_deposit: contractConfig.min_deposit,
          min_deposit_type: typeof contractConfig.min_deposit,
          min_deposit_value: contractConfig.min_deposit?.toString()
        },
        walletAddress: walletClient.account?.address
      })
      
      // Prepare atom data for contract
      const atomsData = atoms.map(atom => {
        // Data must be provided as an IPFS URI
        if (!atom.data || typeof atom.data !== 'string' || !atom.data.startsWith('ipfs://')) {
          throw new Error(`Invalid atom data for ${atom.label}. Must be an IPFS URI (ipfs://...)`)
        }
        
        console.log(`[useAtomCreation] Using atom URI for ${atom.label}:`, atom.data)
        
        // Convert to hex-encoded bytes
        const hexData = toHex(atom.data)
        console.log(`[useAtomCreation] Hex encoded data for ${atom.label}:`, hexData)
        
        return hexData
      })
      
      // Get atom creation cost once (before the map)
      let atomCost: bigint
      try {
        atomCost = contractConfig.atom_cost ? BigInt(contractConfig.atom_cost) : BigInt(0)
      } catch (conversionError) {
        console.error('[useAtomCreation] Error converting atom_cost to BigInt:', {
          atom_cost: contractConfig.atom_cost,
          error: conversionError
        })
        atomCost = BigInt(0)
      }
      
      // Prepare assets (atom cost + deposit) for each atom
      const atomsAssets = atoms.map((atom, index) => {
        let minDeposit: bigint
        try {
          // contractConfig.min_deposit is a string, need to convert to BigInt
          minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
        } catch (conversionError) {
          console.error(`[useAtomCreation] Error converting min_deposit to BigInt:`, {
            min_deposit: contractConfig.min_deposit,
            error: conversionError
          })
          minDeposit = BigInt(0)
        }
        
        // Each asset should be atomCost + deposit (following SDK pattern)
        const totalAssetForAtom = atomCost + minDeposit
        
        console.log(`[useAtomCreation] Creating asset for atom ${index}:`, {
          atom_label: atom.label,
          min_deposit_original: contractConfig.min_deposit,
          min_deposit_bigint: minDeposit,
          atom_cost: atomCost.toString(),
          total_asset: totalAssetForAtom.toString()
        })
        
        return totalAssetForAtom
      })
      
      // Calculate total value (should match sum of atomsAssets)
      const totalValue = atomsAssets.reduce((sum, asset) => {
        console.log('[useAtomCreation] Adding to total:', {
          current_sum: sum.toString(),
          asset_amount: asset.toString()
        })
        return sum + asset
      }, BigInt(0))
      
      console.log('[useAtomCreation] Final calculations:', {
        atomCost: atomCost.toString(),
        atomCount: atoms.length,
        atomsAssets: atomsAssets.map(a => a.toString()),
        totalValue: totalValue.toString(),
        check: totalValue === atomsAssets.reduce((a, b) => a + b, BigInt(0))
      })
      
      console.log('[useAtomCreation] Calling protocolCreateAtoms with:', {
        contractAddress: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS,
        atomsData,
        atomsAssets: atomsAssets.map(a => a.toString()),
        totalValue: totalValue.toString()
      })
      
      // Use SDK's createAtoms
      const txHash = await protocolCreateAtoms(
        { 
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          walletClient,
          publicClient 
        },
        {
          args: [atomsData, atomsAssets],
          value: totalValue  // This should now match sum of atomsAssets
        }
      )
      
      console.log('[useAtomCreation] Transaction hash:', txHash)
      
      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(txHash as Hex)
      
      console.log('[useAtomCreation] Transaction receipt:', receipt)
      
      // Parse atom IDs from events
      const atomEvents = await eventParseAtomCreated(publicClient, receipt.transactionHash)
      const atomIds = atomEvents.map(event => event.args.termId.toString())
      
      console.log('[useAtomCreation] Created atom IDs:', atomIds)
      
      if (atomIds.length === 0) {
        throw new Error('No atom IDs found in transaction receipt')
      }
      
      return { txHash, receipt, atomIds }
    } catch (err: any) {
      console.error('[useAtomCreation] Error creating atoms:', err)
      console.error('[useAtomCreation] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      })
      const error = parseTransactionError(err)
      setError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }
  
  const createTriples = async (triples: TripleData[]) => {
    if (!publicClient || !walletClient || !contractConfig) {
      throw new Error('Wallet not ready. Please ensure your wallet is connected.')
    }
    
    if (triples.length === 0) {
      return null
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      console.log('[useAtomCreation] Creating triples:', {
        count: triples.length,
        triples,
        contractConfig: {
          min_deposit: contractConfig.min_deposit,
          min_deposit_type: typeof contractConfig.min_deposit
        }
      })
      
      // Prepare arrays for batch creation
      const subjects = triples.map(t => {
        // If it's a hex string, keep as is; otherwise convert to BigInt
        if (t.subjectId.startsWith('0x')) {
          return t.subjectId as `0x${string}`
        }
        return BigInt(t.subjectId)
      })
      
      const predicates = triples.map(t => {
        // Predicate IDs from chain config are hex strings
        if (t.predicateId.startsWith('0x')) {
          return t.predicateId as `0x${string}`
        }
        return BigInt(t.predicateId)
      })
      
      const objects = triples.map(t => {
        // If it's a hex string, keep as is; otherwise convert to BigInt
        if (t.objectId.startsWith('0x')) {
          return t.objectId as `0x${string}`
        }
        return BigInt(t.objectId)
      })
      
      // Get triple creation cost once
      let tripleCost: bigint
      try {
        tripleCost = contractConfig.triple_cost ? BigInt(contractConfig.triple_cost) : BigInt(0)
      } catch (conversionError) {
        console.error('[useAtomCreation] Error converting triple_cost to BigInt:', {
          triple_cost: contractConfig.triple_cost,
          error: conversionError
        })
        tripleCost = BigInt(0)
      }
      
      // Convert min_deposit string to BigInt
      let minDeposit: bigint
      try {
        minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
      } catch (conversionError) {
        console.error('[useAtomCreation] Error converting min_deposit to BigInt for triples:', {
          min_deposit: contractConfig.min_deposit,
          error: conversionError
        })
        minDeposit = BigInt(0)
      }
      
      // Each deposit should be tripleCost + minDeposit (following SDK pattern)
      const assetPerTriple = tripleCost + minDeposit
      const deposits = triples.map(() => assetPerTriple)
      
      console.log('[useAtomCreation] Triple creation arrays prepared:', {
        subjects: subjects.map(s => typeof s === 'string' ? s : s.toString()),
        predicates: predicates.map(p => typeof p === 'string' ? p : p.toString()),
        objects: objects.map(o => typeof o === 'string' ? o : o.toString()),
        deposits: deposits.map(d => d.toString()),
        tripleCost: tripleCost.toString(),
        minDeposit: minDeposit.toString(),
        assetPerTriple: assetPerTriple.toString()
      })
      
      // Calculate total value (should match sum of deposits)
      const totalValue = deposits.reduce((sum, deposit) => sum + deposit, BigInt(0))
      
      console.log('[useAtomCreation] Triple final calculations:', {
        tripleCost: tripleCost.toString(),
        tripleCount: triples.length,
        deposits: deposits.map(d => d.toString()),
        totalValue: totalValue.toString(),
        check: totalValue === deposits.reduce((a, b) => a + b, BigInt(0))
      })
      
      // Use SDK's createTriples
      const txHash = await protocolCreateTriples(
        {
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          walletClient,
          publicClient
        },
        {
          args: [subjects, predicates, objects, deposits],
          value: totalValue  // This should now match sum of deposits
        }
      )
      
      console.log('[useAtomCreation] Triple transaction hash:', txHash)
      
      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(txHash as Hex)
      
      // Parse triple IDs from events
      const tripleEvents = await eventParseTripleCreated(publicClient, receipt.transactionHash)
      const tripleIds = tripleEvents.map(event => event.args.termId.toString())
      
      console.log('[useAtomCreation] Created triple IDs:', tripleIds)
      
      return { txHash, receipt, tripleIds }
    } catch (err: any) {
      console.error('[useAtomCreation] Error creating triples:', err)
      const error = parseTransactionError(err)
      setError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }
  
  const reset = () => {
    setError(null)
    setIsCreating(false)
  }
  
  return {
    createAtomsFromData,
    createAtomsAndTriples: {
      createAtoms,
      createTriples
    },
    isCreating,
    error,
    reset
  }
}
