import React, { useState } from 'react'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { X, ArrowLeft } from 'lucide-react'
import { toast } from "~/hooks/use-toast"
import { useAtomCreation } from '~/hooks/useAtomCreation'
import { useTripleCreation } from '~/hooks/useTripleCreation'
import { mapAtomIdsToStructure } from '~/utils/transaction-preparation'

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
  // Custom hooks for transaction management
  const { createAtomsFromData, isCreating: isCreatingAtoms } = useAtomCreation()
  const { createTriplesFromData, isCreating: isCreatingTriples } = useTripleCreation()
  
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
  
  // Simplified transaction execution using hooks
  const executeTransactions = async (txData: TransactionData) => {
    setIsExecuting(true)
    setExecutionError(null)
    setCurrentAction('Preparing transactions...')
    
    try {
      // Step 1: Create atoms
      setCurrentAction('Creating atoms on blockchain...')
      
      toast({
        title: "Creating atoms...",
        description: "Please confirm the transaction in your wallet",
      })
      
      const { atomIds } = await createAtomsFromData(txData)
      
      setCurrentAction('Waiting for blockchain confirmation...')
      
      // Step 2: Create triples if needed
      if (formData.hasImage || formData.hasIdentity) {
        setCurrentAction('Creating relationships...')
        
        toast({
          title: "Creating relationships...",
          description: "Please confirm the second transaction",
        })
        
        try {
          await createTriplesFromData(atomIds, {
            hasImage: formData.hasImage || false,
            hasIdentity: formData.hasIdentity || false
          })
          
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
      
      // Step 3: Map results
      const createdAtomsResult = mapAtomIdsToStructure(atomIds, formData)
      setCreatedAtoms(createdAtomsResult)
      
      toast({
        title: "Success!",
        description: "Atoms created successfully on-chain",
      })
      
      setCurrentStep('success')
      
    } catch (error: any) {
      setExecutionError(error)
      
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
      setCurrentAction('')
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
            isExecuting={isExecuting || isCreatingAtoms || isCreatingTriples}
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
