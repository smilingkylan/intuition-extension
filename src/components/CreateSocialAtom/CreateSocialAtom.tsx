import React, { useState } from 'react'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { X, ArrowLeft } from 'lucide-react'
import { sendToBackground } from "@plasmohq/messaging"
import { toast } from "~/hooks/use-toast"
import { INTUITION_TESTNET } from '~/constants/web3'

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
  
  // Web3 transaction execution
  const executeTransactions = async (txData: TransactionData) => {
    setIsExecuting(true)
    setExecutionError(null)
    setCurrentAction('Preparing transactions...')
    
    try {
      // Create atoms
      const atomsToCreate = txData.atomsToCreate.map(atom => ({
        data: atom.uri,
        initialDeposit: atom.stake
      }))
      
      console.log('Creating atoms:', atomsToCreate)
      setCurrentAction('Creating atoms on blockchain...')
      
      const response = await sendToBackground({
        name: "web3",
        body: {
          method: "createAtoms",
          params: [{ atoms: atomsToCreate }]
        }
      })
      
      console.log('Create atoms response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const atomIds = response.atomIds
      if (!atomIds || atomIds.length === 0) {
        throw new Error('No atom IDs returned from transaction')
      }
      
      console.log('Created atom IDs:', atomIds)
      
      // Handle triple creation if needed
      if (formData.hasImage || formData.hasIdentity) {
        const triplesToCreate = []
        
        // Add image relationship
        if (formData.hasImage && atomIds[1]) {
          triplesToCreate.push({
            subjectId: atomIds[0],
            predicateId: INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID,
            objectId: atomIds[1],
            initialDeposit: '0.0004'
          })
        }
        
        // Add identity ownership relationship
        if (formData.hasIdentity) {
          const identityAtomId = atomIds[atomIds.length - 1]
          triplesToCreate.push({
            subjectId: identityAtomId,
            predicateId: INTUITION_TESTNET.OWNS_ATOM_ID,
            objectId: atomIds[0],
            initialDeposit: '0.0004'
          })
        }

        if (triplesToCreate.length > 0) {
          console.log('Creating triples:', triplesToCreate)
          setCurrentAction('Creating relationships...')
          
          const tripleResponse = await sendToBackground({
            name: "web3",
            body: {
              method: "createTriples",
              params: [{ triples: triplesToCreate }]
            }
          })

          console.log('Create triples response:', tripleResponse)
          
          if (tripleResponse.error) {
            throw new Error(tripleResponse.error)
          }
        }
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
      setExecutionError(error)
      
      toast({
        title: "Transaction failed",
        description: error.message || 'Failed to create atoms',
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