import { useState } from 'react'
import { encodeFunctionData, toHex, parseEther, type Address } from 'viem'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { calculateAtomAssets } from '~/utils/fees'
import { parseTransactionError } from '~/utils/error-handling'
import { INTUITION_TESTNET } from '~/constants/web3'

interface CreateAtomParams {
  uri: string
  stake: string
}

export function useSingleAtomCreation() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  
  const { sendTransaction, contractConfig } = useTransactionProvider()
  
  const createAtom = async ({ uri, stake }: CreateAtomParams) => {
    if (!contractConfig) {
      throw new Error('Contract configuration not loaded')
    }
    
    setIsCreating(true)
    setError(null)
    setTransactionHash(null)
    
    try {
      const hexData = toHex(uri)
      const { totalAssets } = calculateAtomAssets(stake, contractConfig)
      
      // Encode the function call
      const data = encodeFunctionData({
        abi: INTUITION_TESTNET.CONTRACT_ABI,
        functionName: 'createAtoms',
        args: [
          [hexData], // Array of hex-encoded data
          [totalAssets] // Array of total assets (includes atom cost + deposit)
        ]
      })
      
      // Send transaction
      const hash = await sendTransaction({
        to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        data,
        value: totalAssets
      })
      
      setTransactionHash(hash)
      
      // For demo purposes, generate a mock atom ID
      // In production, you'd parse this from transaction events
      const mockAtomId = `0x${Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}`
      
      return { hash, atomId: mockAtomId }
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
    setTransactionHash(null)
    setIsCreating(false)
  }
  
  return {
    createAtom,
    isCreating,
    error,
    transactionHash,
    reset
  }
}
