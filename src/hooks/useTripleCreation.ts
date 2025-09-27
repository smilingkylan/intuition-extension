import { useState } from 'react'
import { createTriples, eventParseTripleCreated } from '@0xintuition/protocol'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { prepareTripleRelationships } from '~/utils/transaction-preparation'
import { parseTransactionError } from '~/utils/error-handling'
import { INTUITION_TESTNET } from '~/constants/web3'
import type { Address, Hex } from 'viem'

interface TripleCreationOptions {
  hasImage: boolean
  hasIdentity: boolean
}

export function useTripleCreation() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { publicClient, walletClient, contractConfig, waitForTransactionReceipt } = useTransactionProvider()
  
  const createTriplesFromData = async (
    atomIds: string[],
    options: TripleCreationOptions
  ) => {
    if (!publicClient || !walletClient || !contractConfig) {
      throw new Error('Wallet not ready. Please ensure your wallet is connected.')
    }
    
    const tripleData = prepareTripleRelationships(atomIds, {
      ...options,
      contractConfig
    })
    
    // No triples to create
    if (!tripleData) {
      return null
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      // Use SDK's createTriples which includes simulateContract
      const txHash = await createTriples(
        {
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          walletClient,
          publicClient
        },
        {
          args: [
            tripleData.subjects,
            tripleData.predicates,
            tripleData.objects,
            tripleData.deposits
          ],
          value: tripleData.totalValue
        }
      )
      
      // Wait for transaction receipt
      const receipt = await waitForTransactionReceipt(txHash as Hex)
      
      // Parse triple IDs from events if needed
      const tripleEvents = await eventParseTripleCreated(publicClient, receipt.transactionHash)
      const tripleIds = tripleEvents.map(event => event.args.termId.toString())
      
      return { txHash, receipt, tripleIds }
    } catch (err: any) {
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
    createTriplesFromData,
    isCreating,
    error,
    reset
  }
}
