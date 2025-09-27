import { useState } from 'react'
import { createAtoms, eventParseAtomCreated } from '@0xintuition/protocol'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { prepareAtomsForCreation } from '~/utils/transaction-preparation'
import { parseTransactionError } from '~/utils/error-handling'
import { INTUITION_TESTNET } from '~/constants/web3'
import type { TransactionData } from '~/components/CreateSocialAtom/types'
import type { Address, Hex } from 'viem'

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
      const txHash = await createAtoms(
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
  
  const reset = () => {
    setError(null)
    setIsCreating(false)
  }
  
  return {
    createAtomsFromData,
    isCreating,
    error,
    reset
  }
}
