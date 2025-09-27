import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { LoaderIcon, AlertCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { toast } from "~/hooks/use-toast"
import { INTUITION_TESTNET } from '~/constants/web3'
import { useTransactionProvider } from '../../../providers/TransactionProvider'
import { 
  toHex, 
  parseEther, 
  encodeFunctionData, 
  parseEventLogs,
  type Address,
  type Hex 
} from 'viem'
import type { SocialAtomFormData, TransactionData, CreatedAtoms } from '../types'

interface ProcessStepProps {
  formData: SocialAtomFormData
  transactionData: TransactionData
  onComplete: (createdAtoms: CreatedAtoms) => void
  onError: () => void
}

export function ProcessStep({ formData, transactionData, onComplete, onError }: ProcessStepProps) {
  const { publicClient, walletClient, waitForTransactionReceipt, isReady, account } = useTransactionProvider()
  
  const [isExecuting, setIsExecuting] = useState(false)
  const [hasExecuted, setHasExecuted] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentAction, setCurrentAction] = useState<string>('')
  
  // Use ref to prevent double execution
  const executionStarted = useRef(false)
  
  const executeTransactions = async () => {
    // Prevent double execution
    if (executionStarted.current || isExecuting || hasExecuted) {
      console.log('Transaction already executing or completed')
      return
    }
    
    // Validate prerequisites
    console.log(isReady, account, publicClient, walletClient)
    if (!isReady || !account || !publicClient || !walletClient) {
      const error = new Error('Wallet not ready. Please ensure your wallet is connected.')
      setError(error)
      toast({
        title: "Wallet not ready",
        description: error.message,
        variant: "destructive"
      })
      return
    }
    
    executionStarted.current = true
    setIsExecuting(true)
    setError(null)
    setCurrentAction('Preparing transaction...')
    
    try {
      // Prepare atoms to create
      const atomsData = transactionData.atomsToCreate.map(atom => toHex(atom.uri))
      const atomsDeposits = transactionData.atomsToCreate.map(atom => parseEther(atom.stake))
      
      console.log('🔍 DEBUGGING: Preparing atoms creation', {
        atomsCount: atomsData.length,
        atomsData: atomsData.map(data => ({ length: data.length, preview: data.slice(0, 20) + '...' })),
        atomsDeposits: atomsDeposits.map(d => ({ 
          bigint: d.toString(), 
          ether: (Number(d) / 1e18).toFixed(6) + ' ETH'
        }))
      })
      
      // Calculate total value needed
      const atomCost = parseEther('0.003') // INTUITION_TESTNET.ATOM_COST
      let totalValue = BigInt(0)
      for (const deposit of atomsDeposits) {
        totalValue += atomCost + deposit
      }
      
      console.log('🔍 DEBUGGING: Transaction value', {
        totalValueBigInt: totalValue.toString(),
        totalValueEther: (Number(totalValue) / 1e18).toFixed(6) + ' ETH',
        contractAddress: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS
      })
      
      // SIMULATE CONTRACT CALL FIRST
      setCurrentAction('Simulating transaction...')
      toast({
        title: "Simulating transaction...",
        description: "Checking if transaction will succeed...",
      })
      
      const { request } = await publicClient.simulateContract({
        account: account,
        address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        abi: INTUITION_TESTNET.CONTRACT_ABI,
        functionName: 'createAtoms',
        args: [atomsData, atomsDeposits],
        value: totalValue * BigInt(15) / BigInt(10),
      })
      
      console.log('✅ DEBUGGING: Simulation successful!', {
        gas: request.gas?.toString(),
        value: request.value?.toString(),
      })
      
      setCurrentAction('Sending transaction to wallet...')
      toast({
        title: "Simulation successful!",
        description: "Sending transaction to wallet...",
      })
      
      // Send the simulated transaction
      const atomTxHash = await walletClient.writeContract(request)
      
      console.log('✅ DEBUGGING: Transaction sent', { hash: atomTxHash })
      
      // Wait for confirmation
      setCurrentAction('Waiting for blockchain confirmation...')
      toast({
        title: "Transaction submitted",
        description: "Waiting for blockchain confirmation...",
      })
      
      const atomReceipt = await waitForTransactionReceipt(atomTxHash as Hex)
      console.log('Atom creation receipt:', atomReceipt)
      
      // Parse the created atom IDs from events
      const atomIds: string[] = []
      const parsedLogs = parseEventLogs({
        abi: INTUITION_TESTNET.CONTRACT_ABI,
        logs: atomReceipt.logs,
        eventName: 'AtomCreated'
      })

      for (const log of parsedLogs) {
        if (log.eventName === 'AtomCreated' && log.args) {
          const atomId = (log.args as any).atomId || (log.args as any).atom?.atomId
          if (atomId) {
            atomIds.push(atomId.toString())
          }
        }
      }

      if (atomIds.length === 0) {
        throw new Error('No atom IDs found in transaction receipt')
      }
      
      console.log('Created atom IDs:', atomIds)
      
      // Handle triple creation if needed
      if (formData.hasImage || formData.hasIdentity) {
        await createTriples(atomIds)
      }
      
      // Map atom IDs to our structure
      const createdAtoms: CreatedAtoms = {
        social: atomIds[0],
        image: formData.hasImage ? atomIds[1] : undefined,
        identity: formData.hasIdentity ? atomIds[atomIds.length - 1] : undefined
      }
      
      setHasExecuted(true)
      toast({
        title: "Success!",
        description: "Atoms created successfully on-chain",
      })
      
      // Call completion handler
      onComplete(createdAtoms)
      
    } catch (err: any) {
      console.error('Transaction failed:', err)
      
      // Parse error for user-friendly message
      let errorMessage = 'Transaction failed'
      
      if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (err.message?.includes('InsufficientAssets')) {
        errorMessage = 'Deposit amount is too small to cover atom creation cost'
      } else if (err.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected'
      } else if (err.cause?.reason) {
        errorMessage = `Contract error: ${err.cause.reason}`
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage
      }
      
      const error = new Error(errorMessage)
      setError(error)
      
      toast({
        title: "Transaction failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
      setCurrentAction('')
    }
  }
  
  const createTriples = async (atomIds: string[]) => {
    const tripleSubjects: bigint[] = []
    const triplePredicates: bigint[] = []
    const tripleObjects: bigint[] = []
    const tripleDeposits: bigint[] = []
    
    // Add image relationship
    if (formData.hasImage && atomIds[1]) {
      tripleSubjects.push(BigInt(atomIds[0]))
      triplePredicates.push(BigInt(INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID))
      tripleObjects.push(BigInt(atomIds[1]))
      tripleDeposits.push(parseEther('0.0004'))
    }
    
    // Add identity ownership relationship
    if (formData.hasIdentity) {
      const identityAtomId = atomIds[atomIds.length - 1]
      tripleSubjects.push(BigInt(identityAtomId))
      triplePredicates.push(BigInt(INTUITION_TESTNET.OWNS_ATOM_ID))
      tripleObjects.push(BigInt(atomIds[0]))
      tripleDeposits.push(parseEther('0.0004'))
    }

    if (tripleSubjects.length > 0) {
      console.log('Creating triples...')
      setCurrentAction('Creating relationships...')
      
      try {
        // Calculate total value for triples
        let tripleTotalValue = BigInt(0)
        for (const deposit of tripleDeposits) {
          tripleTotalValue += deposit
        }
        
        // Simulate triple creation
        const { request: tripleRequest } = await publicClient!.simulateContract({
          account: account!,
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          abi: INTUITION_TESTNET.CONTRACT_ABI,
          functionName: 'createTriples',
          args: [tripleSubjects, triplePredicates, tripleObjects, tripleDeposits],
          value: tripleTotalValue,
        })
        
        const tripleTxHash = await walletClient!.writeContract(tripleRequest)
        
        toast({
          title: "Creating relationships...",
          description: "Relationship transaction submitted...",
        })
        
        // Wait for triple confirmation
        const tripleReceipt = await waitForTransactionReceipt(tripleTxHash as Hex)
        console.log('Triple creation receipt:', tripleReceipt)
        
      } catch (tripleError: any) {
        console.error('Triple creation failed:', tripleError)
        // Don't fail the whole process for triple errors
        toast({
          title: "Relationship creation failed",
          description: "Atoms were created but relationships failed",
          variant: "destructive"
        })
      }
    }
  }
  
  const handleRetry = () => {
    executionStarted.current = false
    setError(null)
    executeTransactions()
  }
  
  // Auto-start execution on mount
  React.useEffect(() => {
    executeTransactions()
  }, []) // Empty deps - run once on mount
  
  if (error && !isExecuting) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Failed</CardTitle>
            <CardDescription>
              There was an error creating your atoms
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center text-muted-foreground max-w-md">
                {error.message}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="default">
                  Retry Transaction
                </Button>
                <Button onClick={onError} variant="outline">
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Creating Your Atoms</CardTitle>
          <CardDescription>
            {currentAction || "Please confirm the transactions in your wallet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="font-semibold">Processing Transactions...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> You may need to approve up to 2 transactions in your wallet:
        </p>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Create atoms transaction</li>
          <li>Create relationships transaction (if applicable)</li>
        </ol>
      </div>
    </div>
  )
} 