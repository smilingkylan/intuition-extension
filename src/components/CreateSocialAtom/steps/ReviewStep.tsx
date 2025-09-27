import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { CheckCircle, User, Image, Globe, Loader2 } from 'lucide-react'
import { formatEther, parseEther } from 'viem'
import { uploadJSONToIPFS } from '~/util/fetch'
import type { SocialAtomFormData, TransactionData } from '../types'
import { toast } from '~/hooks/use-toast'

interface ReviewStepProps {
  formData: SocialAtomFormData
  onNext: (transactionData: TransactionData) => void
  onBack: () => void
}

export function ReviewStep({ formData, onNext, onBack }: ReviewStepProps) {
  const [isPreparing, setIsPreparing] = useState(false)
  
  const totalAtoms = 1 + (formData.hasImage ? 1 : 0) + (formData.hasIdentity ? 1 : 0)
  const totalTriples = (formData.hasImage && formData.hasIdentity ? 2 : 
                       formData.hasImage || formData.hasIdentity ? 1 : 0)
  
  const atomStakeAmount = '0.001'  // tTRUST amount as string
  const tripleStakeAmount = '0.0004'  // tTRUST amount as string
  const atomStake = parseEther(atomStakeAmount)
  const tripleStake = parseEther(tripleStakeAmount)
  const totalStake = atomStake * BigInt(totalAtoms)
  const totalTripleStake = tripleStake * BigInt(totalTriples)
  const totalCost = totalStake + totalTripleStake

  const prepareTransactions = async (): Promise<TransactionData> => {
    const atomsToCreate = []
    const triplesToCreate = []

    // 1. Social media atom
    const socialAtomData = {
      '@context': 'https://schema.org',
      '@type': 'Thing', 
      name: formData.socialAtomName,
      description: formData.socialAtomDescription,
    }
    const socialUpload = await uploadJSONToIPFS([socialAtomData])
    atomsToCreate.push({
      uri: `ipfs://${socialUpload[0].IpfsHash}`,
      stake: atomStakeAmount
    })

    // 2. Optional image atom
    if (formData.hasImage && formData.imageUrl) {
      const imageAtomData = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: formData.imageUrl,
        description: formData.imageDescription || 'Profile image',
      }
      const imageUpload = await uploadJSONToIPFS([imageAtomData])
      atomsToCreate.push({
        uri: `ipfs://${imageUpload[0].IpfsHash}`,
        stake: atomStakeAmount
      })
    }

    // 3. Optional identity atom
    if (formData.hasIdentity) {
      const identityAtomData = {
        '@context': 'https://schema.org',
        '@type': formData.identityType === 'Person' ? 'Person' : 'Organization',
        name: formData.identityName,
        description: formData.identityDescription,
      }
      const identityUpload = await uploadJSONToIPFS([identityAtomData])
      atomsToCreate.push({
        uri: `ipfs://${identityUpload[0].IpfsHash}`,
        stake: atomStakeAmount
      })
    }

    return { atomsToCreate, triplesToCreate }
  }

  const handleNext = async () => {
    try {
      setIsPreparing(true)
      console.log('Preparing transactions...')
      const txData = await prepareTransactions()
      console.log('Transaction data prepared:', txData)
      onNext(txData)
    } catch (error) {
      console.error('Failed to prepare transactions:', error)
      toast({
        title: "Preparation failed",
        description: "Failed to prepare transactions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPreparing(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Atoms</CardTitle>
          <CardDescription>
            Please review the atoms you're about to create
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Media Atom */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <p className="font-medium">Social Media Profile</p>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formData.socialAtomName}</p>
              <p className="text-xs text-muted-foreground">{formData.socialAtomDescription}</p>
              <p className="text-xs">Stake: {atomStakeAmount} tTRUST</p>
            </div>
          </div>

          {/* Optional Image Atom */}
          {formData.hasImage && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <p className="font-medium">Profile Image</p>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.imageDescription || 'Profile image'}
                </p>
                <p className="text-xs">Stake: {atomStakeAmount} tTRUST</p>
              </div>
            </div>
          )}

          {/* Optional Identity Atom */}
          {formData.hasIdentity && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <p className="font-medium">Real-World Identity</p>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formData.identityName}</p>
                <p className="text-xs text-muted-foreground">{formData.identityDescription}</p>
                <p className="text-xs">Stake: {atomStakeAmount} tTRUST</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relationships */}
      {totalTriples > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relationships</CardTitle>
            <CardDescription>
              The following relationships will be created automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.hasImage && (
              <div className="text-sm">
                <span className="font-medium">Social Profile</span>
                <span className="text-muted-foreground"> → has image → </span>
                <span className="font-medium">Profile Image</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({tripleStakeAmount} tTRUST)
                </span>
              </div>
            )}
            {formData.hasIdentity && (
              <div className="text-sm">
                <span className="font-medium">Identity</span>
                <span className="text-muted-foreground"> → owns → </span>
                <span className="font-medium">Social Profile</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({tripleStakeAmount} tTRUST)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Atoms ({totalAtoms})</span>
            <span>{formatEther(totalStake)} tTRUST</span>
          </div>
          {totalTriples > 0 && (
            <div className="flex justify-between text-sm">
              <span>Relationships ({totalTriples})</span>
              <span>{formatEther(totalTripleStake)} tTRUST</span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total Cost</span>
              <span>{formatEther(totalCost)} tTRUST</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isPreparing}>
          {isPreparing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            'Create Atoms'
          )}
        </Button>
      </div>
    </div>
  )
} 