import React, { useState } from 'react'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { X, ArrowLeft } from 'lucide-react'
import { toast } from "~/hooks/use-toast"
import { INTUITION_TESTNET } from '~/constants/web3'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { 
  toHex, 
  parseEther, 
  type Address, 
  type Hex,
  parseEventLogs
} from 'viem'
import { 
  createAtoms,
  createTriples,
  eventParseAtomCreated,
  eventParseTripleCreated
} from '@0xintuition/protocol'

// Import step components
import { BasicInfoStep } from './steps/BasicInfoStep'
import { ImageStep } from './steps/ImageStep'
import { IdentityStep } from './steps/IdentityStep'
import { ReviewStep } from './steps/ReviewStep'
import { ProcessStep } from './steps/ProcessStep'
import { SuccessStep } from './steps/SuccessStep'

// Import types
import type { SocialAtomFormData, TransactionData, CreatedAtoms } from './types'

// Step type definition
type Step = 'basic' | 'image' | 'identity' | 'review' | 'process' | 'success'

interface CreateSocialAtomProps {
  initialPlatform?: string
  initialUsername?: string
  onClose?: () => void
}

export function CreateSocialAtom({ initialPlatform, initialUsername, onClose }: CreateSocialAtomProps) {
  // Get transaction provider
  const { publicClient, walletClient, contractConfig, account, waitForTransactionReceipt } = useTransactionProvider()
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  
  // Form data - no persistence
  const [formData, setFormData] = useState<Partial<SocialAtomFormData>>({
    platform: initialPlatform || 'x.com',
    username: initialUsername || '',
    hasImage: false,
    hasIdentity: false,
  })
  
  // Transaction state
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [createdAtoms, setCreatedAtoms] = useState<CreatedAtoms>({})
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionError, setExecutionError] = useState<Error | null>(null)
  const [currentAction, setCurrentAction] = useState<string>('')
  
  // Progress calculation
  const getProgress = () => {
    const stepOrder: Step[] = ['basic', 'image', 'identity', 'review', 'process', 'success']
    const currentIndex = stepOrder.indexOf(currentStep)
    const totalSteps = stepOrder.filter(step => {
      if (step === 'image' && !formData.hasImage) return false
      if (step === 'identity' && !formData.hasIdentity) return false
      return true
    }).length
    const adjustedIndex = stepOrder.slice(0, currentIndex + 1).filter(step => {
      if (step === 'image' && !formData.hasImage) return false
      if (step === 'identity' && !formData.hasIdentity) return false
      return true
    }).length
    return (adjustedIndex / totalSteps) * 100
  }
  
  // Web3 transaction execution with SDK
  const executeTransactions = async (txData: TransactionData) => {
    if (!publicClient || !walletClient || !account || !contractConfig) {
      setExecutionError(new Error('Wallet not ready. Please ensure your wallet is connected.'))
      return
    }
    
    setIsExecuting(true)
    setExecutionError(null)
    setCurrentAction('Preparing transactions...')
    
    try {
      // Use cached config for fee calculations
      const atomCost = BigInt(contractConfig.atom_cost)
      const minDeposit = BigInt(contractConfig.min_deposit)
      
      // Prepare atoms data
      const atomsData = txData.atomsToCreate.map(atom => toHex(atom.uri))
      const atomsAssets = txData.atomsToCreate.map(atom => {
        const stake = parseEther(atom.stake)
        const finalDeposit = stake < minDeposit ? minDeposit : stake
        return atomCost + finalDeposit  // ✅ Include both atom cost and deposit
      })
      
      // Calculate total value
      let totalValue = BigInt(0)
      for (const assets of atomsAssets) {
        totalValue += assets  // ✅ Already includes everything
      }
      
      setCurrentAction('Creating atoms on blockchain...')
      
      toast({
        title: "Creating atoms...",
        description: "Please confirm the transaction in your wallet",
      })
      
      // Use SDK's createAtoms which includes simulateContract
      const atomTxHash = await createAtoms(
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
      
      
      setCurrentAction('Waiting for blockchain confirmation...')
      
      // Wait for receipt
      const atomReceipt = await waitForTransactionReceipt(atomTxHash as Hex)
      
      
      // Parse atom IDs from events using SDK parser
      const atomEvents = await eventParseAtomCreated(publicClient, atomReceipt.transactionHash)
      const atomIds: string[] = atomEvents.map(event => event.args.termId.toString())
      
      if (atomIds.length === 0) {
        throw new Error('No atom IDs found in transaction receipt')
      }
      
      
      // Handle triple creation if needed
      if (formData.hasImage || formData.hasIdentity) {
        await createTriplesWithSDK(atomIds)
      }

      // Map atom IDs to our structure
      const createdAtomsResult = {
        social: atomIds[0],
        image: formData.hasImage ? atomIds[1] : undefined,
        identity: formData.hasIdentity ? atomIds[atomIds.length - 1] : undefined
      }

      setCreatedAtoms(createdAtomsResult)
      
      toast({
        title: "Success!",
        description: "Atoms created successfully on-chain",
      })
      
      setCurrentStep('success')
      
    } catch (error: any) {
      console.error('Transaction failed:', error)
      
      // Parse error for user-friendly message
      let errorMessage = 'Transaction failed'
      
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (error.message?.includes('InsufficientAssets')) {
        errorMessage = 'Deposit amount is too small'
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected'
      } else if (error.cause?.reason) {
        errorMessage = `Contract error: ${error.cause.reason}`
      } else if (error.shortMessage) {
        errorMessage = error.shortMessage
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setExecutionError(new Error(errorMessage))
      
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
  
  // Create triples using SDK
  const createTriplesWithSDK = async (atomIds: string[]) => {
    if (!publicClient || !walletClient || !account) return
    
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
      setCurrentAction('Creating relationships...')
      
      try {
        // Use cached triple cost from config
        const tripleCost = BigInt(contractConfig?.triple_cost || '0')
        
        // Calculate total value for triples
        let tripleTotalValue = BigInt(0)
        for (let i = 0; i < tripleDeposits.length; i++) {
          tripleTotalValue += tripleCost + tripleDeposits[i]
        }
        
        toast({
          title: "Creating relationships...",
          description: "Please confirm the second transaction",
        })
        
        // Use SDK's createTriples
        const tripleTxHash = await createTriples(
          {
            address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
            walletClient,
            publicClient
          },
          {
            args: [tripleSubjects, triplePredicates, tripleObjects, tripleDeposits],
            value: tripleTotalValue
          }
        )
        
        // Wait for triple confirmation
        const tripleReceipt = await waitForTransactionReceipt(tripleTxHash as Hex)
        
        toast({
          title: "Relationships created!",
          description: "All transactions completed successfully",
        })
        
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
  
  // Step navigation handlers
  const handleBasicNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    
    if (data.hasImage) {
      setCurrentStep('image')
    } else if (data.hasIdentity) {
      setCurrentStep('identity')
    } else {
      setCurrentStep('review')
    }
  }
  
  const handleImageNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    
    if (formData.hasIdentity) {
      setCurrentStep('identity')
    } else {
      setCurrentStep('review')
    }
  }
  
  const handleIdentityNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setCurrentStep('review')
  }
  
  const handleReviewNext = async (txData: TransactionData) => {
    setTransactionData(txData)
    setCurrentStep('process')
    // Start execution immediately
    await executeTransactions(txData)
  }
  
  const handleProcessRetry = () => {
    if (transactionData) {
      executeTransactions(transactionData)
    }
  }
  
  const handleProcessBack = () => {
    setCurrentStep('review')
    setExecutionError(null)
  }
  
  const handleBack = () => {
    switch (currentStep) {
      case 'image':
        setCurrentStep('basic')
        break
      case 'identity':
        setCurrentStep(formData.hasImage ? 'image' : 'basic')
        break
      case 'review':
        if (formData.hasIdentity) {
          setCurrentStep('identity')
        } else if (formData.hasImage) {
          setCurrentStep('image')
        } else {
          setCurrentStep('basic')
        }
        break
      default:
        break
    }
  }
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BasicInfoStep
            data={formData}
            onNext={handleBasicNext}
          />
        )
        
      case 'image':
        return (
          <ImageStep
            data={formData}
            onNext={handleImageNext}
            onBack={handleBack}
          />
        )
        
      case 'identity':
        return (
          <IdentityStep
            data={formData}
            onNext={handleIdentityNext}
            onBack={handleBack}
          />
        )
        
      case 'review':
        return (
          <ReviewStep
            formData={formData as SocialAtomFormData}
            onNext={handleReviewNext}
            onBack={handleBack}
          />
        )
        
      case 'process':
        return (
          <ProcessStep
            isExecuting={isExecuting}
            error={executionError}
            currentAction={currentAction}
            onRetry={handleProcessRetry}
            onBack={handleProcessBack}
          />
        )
        
      case 'success':
        return (
          <SuccessStep
            createdAtoms={createdAtoms}
            onClose={onClose || (() => window.close())}
          />
        )
        
      default:
        return null
    }
  }
  
  const showBackButton = ['image', 'identity', 'review'].includes(currentStep)
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg font-semibold">Create Social Atom</h2>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  )
} 