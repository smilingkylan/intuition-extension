import React from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { CheckCircle, User, Image, Globe } from 'lucide-react'
import { formatEther, parseEther } from 'viem'
import { uploadJSONToIPFS } from '~/util/fetch'
import { toast } from '~/hooks/use-toast'
import type { SocialAtomFormData, TransactionData } from '../types'

interface ReviewStepProps {
  formData: SocialAtomFormData
  onNext: (transactionData: TransactionData) => void
  onBack: () => void
}

export function ReviewStep({ formData, onNext, onBack }: ReviewStepProps) {
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
      // description: formData.socialAtomDescription,
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
        '@type': 'Thing',
        name: formData.imageName,
        description: formData.imageDescription,
        image: formData.imageUrl,
      }
      const imageUpload = await uploadJSONToIPFS([imageAtomData])
      atomsToCreate.push({
        uri: `ipfs://${imageUpload[0].IpfsHash}`,
        stake: atomStakeAmount
      })
    }

    // 3. Optional identity atom  
    if (formData.hasIdentity && formData.identityName) {
      const identityAtomData = {
        '@context': 'https://schema.org',
        '@type': formData.identityType === 'person' ? 'Person' : 'Organization',
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
      const txData = await prepareTransactions()
      onNext(txData)
    } catch (error) {
      console.error('Failed to prepare transactions:', error)
      toast({
        title: "Preparation failed",
        description: "Failed to prepare transactions. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Review & Confirm</CardTitle>
          <CardDescription>
            Review your atoms before creating them on-chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Media Atom */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h4 className="font-semibold">Social Media Profile</h4>
              <Badge variant="secondary">Primary Atom</Badge>
            </div>
            <div className="pl-6 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {formData.socialAtomName}</p>
              <p><span className="text-muted-foreground">Description:</span> {formData.socialAtomDescription}</p>
            </div>
          </div>

          {/* Image Atom */}
          {formData.hasImage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <h4 className="font-semibold">Profile Image</h4>
                <Badge variant="outline">Linked Atom</Badge>
              </div>
              <div className="pl-6 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {formData.imageName}</p>
                <p><span className="text-muted-foreground">Description:</span> {formData.imageDescription}</p>
              </div>
            </div>
          )}

          {/* Identity Atom */}
          {formData.hasIdentity && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h4 className="font-semibold">Real-World Identity</h4>
                <Badge variant="outline">{formData.identityType === 'person' ? 'Person' : 'Organization'}</Badge>
              </div>
              <div className="pl-6 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {formData.identityName}</p>
                <p><span className="text-muted-foreground">Description:</span> {formData.identityDescription}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Atoms to create:</span>
            <Badge>{totalAtoms}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Relationships to create:</span>
            <Badge>{totalTriples}</Badge>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center font-semibold">
              <span>Total Cost:</span>
              <span>{formatEther(totalCost)} tTRUST</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Plus network gas fees
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <p className="text-sm">
          You will need to sign {totalTriples > 0 ? '2 transactions' : '1 transaction'} to complete this process
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Create Atoms
        </Button>
      </div>
    </div>
  )
} 