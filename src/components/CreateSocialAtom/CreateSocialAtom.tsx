import React, { useState, useEffect } from 'react'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { X, ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

// Import step components (we'll convert these from routes)
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
  initialData?: {
    platform?: string
    username?: string
  }
  onClose?: () => void
}

export function CreateSocialAtom({ initialData, onClose }: CreateSocialAtomProps) {
  const navigate = useNavigate()
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  
  // Form data
  const [formData, setFormData] = useState<Partial<SocialAtomFormData>>({
    platform: initialData?.platform || 'x.com',
    username: initialData?.username || '',
    hasImage: false,
    hasIdentity: false,
  })
  
  // Transaction data
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [createdAtoms, setCreatedAtoms] = useState<CreatedAtoms>({})
  
  // Persist form data to localStorage
  useEffect(() => {
    const key = 'createSocialAtom_formData'
    if (currentStep !== 'success') {
      localStorage.setItem(key, JSON.stringify(formData))
    } else {
      // Clear on success
      localStorage.removeItem(key)
    }
  }, [formData, currentStep])
  
  // Restore form data on mount
  useEffect(() => {
    const saved = localStorage.getItem('createSocialAtom_formData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to restore form data:', e)
      }
    }
  }, [])
  
  // Progress calculation
  const getProgress = () => {
    const stepOrder = ['basic', 'image', 'identity', 'review', 'process', 'success']
    const currentIndex = stepOrder.indexOf(currentStep)
    return ((currentIndex + 1) / stepOrder.length) * 100
  }
  
  // Navigation helpers
  const markStepComplete = (step: Step) => {
    setCompletedSteps(prev => new Set(prev).add(step))
  }
  
  const goToStep = (step: Step) => {
    setCurrentStep(step)
  }
  
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate({ to: '/' })
    }
  }
  
  // Step navigation logic
  const handleBasicNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    markStepComplete('basic')
    
    if (data.hasImage) {
      goToStep('image')
    } else if (data.hasIdentity) {
      goToStep('identity')
    } else {
      goToStep('review')
    }
  }
  
  const handleImageNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    markStepComplete('image')
    
    if (formData.hasIdentity) {
      goToStep('identity')
    } else {
      goToStep('review')
    }
  }
  
  const handleIdentityNext = (data: Partial<SocialAtomFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
    markStepComplete('identity')
    goToStep('review')
  }
  
  const handleReviewNext = (txData: TransactionData) => {
    setTransactionData(txData)
    markStepComplete('review')
    goToStep('process')
  }
  
  const handleProcessComplete = (atoms: CreatedAtoms) => {
    setCreatedAtoms(atoms)
    markStepComplete('process')
    goToStep('success')
  }
  
  const handleBack = () => {
    switch (currentStep) {
      case 'image':
        goToStep('basic')
        break
      case 'identity':
        goToStep(formData.hasImage ? 'image' : 'basic')
        break
      case 'review':
        if (formData.hasIdentity) {
          goToStep('identity')
        } else if (formData.hasImage) {
          goToStep('image')
        } else {
          goToStep('basic')
        }
        break
      case 'process':
        goToStep('review')
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
            initialData={formData}
            onNext={handleBasicNext}
          />
        )
        
      case 'image':
        return (
          <ImageStep
            formData={formData}
            onNext={handleImageNext}
            onBack={handleBack}
          />
        )
        
      case 'identity':
        return (
          <IdentityStep
            formData={formData}
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
            formData={formData as SocialAtomFormData}
            transactionData={transactionData!}
            onComplete={handleProcessComplete}
            onError={handleBack}
          />
        )
        
      case 'success':
        return (
          <SuccessStep
            createdAtoms={createdAtoms}
            onClose={handleClose}
          />
        )
        
      default:
        return null
    }
  }
  
  const canGoBack = currentStep !== 'basic' && currentStep !== 'process' && currentStep !== 'success'
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {canGoBack && (
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  )
} 