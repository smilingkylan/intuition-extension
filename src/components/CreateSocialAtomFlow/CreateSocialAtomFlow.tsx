import React, { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, User, Image, Link, X, RefreshCwIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomCreation } from '../../hooks/useAtomCreation'
import { useTransactionProvider } from '../../providers/TransactionProvider'
import { INTUITION_TESTNET } from '~/constants/web3'
import { formatUnits } from 'viem'
import { atomQueryKeys } from '../../lib/atom-queue/query-keys'
import { uploadJSONToIPFS, uploadImageUrlToHash } from '~/util/fetch'
import type { AtomCreationData } from '../../lib/atom-queue/types'
import { fixImageUrl } from '@/src/x-com/utils'
import { toast } from '~/hooks/use-toast'

interface CreateSocialAtomFlowProps {
  creationData: AtomCreationData
  onClose: () => void
}

type Step = 'review' | 'identity-question' | 'identity-form' | 'creating' | 'success' | 'error'

interface IdentityData {
  name: string
  description: string
}

export function CreateSocialAtomFlow({ creationData, onClose }: CreateSocialAtomFlowProps) {
  const [step, setStep] = useState<Step>('review')
  const [identityData, setIdentityData] = useState<IdentityData>({ name: '', description: '' })
  const [includeIdentity, setIncludeIdentity] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const { createAtomsAndTriples } = useAtomCreation()
  const { contractConfig, publicClient, walletClient } = useTransactionProvider()
  
  const [isCreating, setIsCreating] = useState(false)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<bigint | null>(null)
  
  const avatarUrl = creationData.metadata?.avatarUrl
  const displayName = creationData.name || 'Unknown'
  const username = creationData.username || ''
  
  // Fetch balance and calculate cost
  useEffect(() => {
    const fetchBalanceAndCost = async () => {
      if (walletClient && publicClient && contractConfig) {
        const address = walletClient.account?.address
        if (address) {
          const bal = await publicClient.getBalance({ address })
          setBalance(bal)
          
          // Calculate estimated cost
          const atomCount = includeIdentity ? 3 : 2
          const tripleCount = includeIdentity ? 3 : 1
          
          const atomCost = contractConfig.atom_cost ? BigInt(contractConfig.atom_cost) : BigInt(0)
          const tripleCost = contractConfig.triple_cost ? BigInt(contractConfig.triple_cost) : BigInt(0)
          const minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
          
          const cost = (atomCost * BigInt(atomCount)) + 
                      (minDeposit * BigInt(atomCount)) +
                      (tripleCost * BigInt(tripleCount)) +
                      (minDeposit * BigInt(tripleCount))
          
          setEstimatedCost(cost)
        }
      }
    }
    
    if (step === 'review') {
      fetchBalanceAndCost()
    }
  }, [step, includeIdentity, walletClient, publicClient, contractConfig])
  
  const handleCreate = async () => {
    setStep('creating')
    setError(null)
    setIsCreating(true)
    
    try {
      console.log('[CreateSocialAtomFlow] Starting creation with:', {
        creationData,
        includeIdentity,
        identityData: includeIdentity ? identityData : null,
        avatarUrl,
        displayName,
        username,
        userId
      })
      
      // Check wallet balance first
      if (walletClient && publicClient) {
        const address = walletClient.account?.address
        if (address) {
          const balance = await publicClient.getBalance({ address })
          console.log('[CreateSocialAtomFlow] Wallet balance:', {
            address,
            balance: balance.toString(),
            balanceFormatted: formatUnits(balance, 18)
          })
          
          // Calculate estimated cost
          const atomCount = includeIdentity ? 3 : 2
          const tripleCount = includeIdentity ? 3 : 1
          
          let estimatedCost = BigInt(0)
          if (contractConfig) {
            const atomCost = contractConfig.atom_cost ? BigInt(contractConfig.atom_cost) : BigInt(0)
            const tripleCost = contractConfig.triple_cost ? BigInt(contractConfig.triple_cost) : BigInt(0)
            const minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
            
            estimatedCost = (atomCost * BigInt(atomCount)) + 
                          (minDeposit * BigInt(atomCount)) +
                          (tripleCost * BigInt(tripleCount)) +
                          (minDeposit * BigInt(tripleCount))
          }
          
          console.log('[CreateSocialAtomFlow] Cost estimate:', {
            atomCount,
            tripleCount,
            estimatedCost: estimatedCost.toString(),
            estimatedCostFormatted: formatUnits(estimatedCost, 18),
            hasEnoughBalance: balance >= estimatedCost
          })
          
          if (balance < estimatedCost) {
            throw new Error(`Insufficient balance. You need at least ${formatUnits(estimatedCost, 18)} tTRUST but only have ${formatUnits(balance, 18)} tTRUST`)
          }
        }
      }
      
      const socialAtomLabel = `x.com:${username}`
      const imageAtomLabel = `x.com:${username} image`
      
      // Upload avatar image to IPFS
      let imageIpfsHash: string | null = null
      if (avatarUrl) {
        try {
          const fixedUrl = fixImageUrl(avatarUrl)
          await fetch(fixedUrl) // make sure it's a valid link
          const result = await uploadImageUrlToHash(avatarUrl)
          imageIpfsHash = result.ipfsHash
        } catch (error) {
          console.error('[CreateSocialAtomFlow] Failed to upload avatar to IPFS:', error)
          // Continue without IPFS image if upload fails - will use direct URL as fallback
        }
      }
      
      // 1. Prepare metadata objects
      const socialAtomMetadata = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: socialAtomLabel
      }
      
      const imageAtomMetadata = {
        '@context': 'https://schema.org',
        '@type': 'Thing', 
        name: imageAtomLabel,
        url: imageIpfsHash ? `ipfs://${imageIpfsHash}` : (avatarUrl || ''),
        image: imageIpfsHash ? `ipfs://${imageIpfsHash}` : (avatarUrl || '')
      }
      
      // Prepare metadata array for upload
      const metadataToUpload = [socialAtomMetadata, imageAtomMetadata]
      
      // Add identity metadata if requested
      let identityAtomMetadata = null
      if (includeIdentity && identityData.name) {
        identityAtomMetadata = {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: identityData.name,
          description: identityData.description
        }
        metadataToUpload.push(identityAtomMetadata)
      }
      
      console.log('[CreateSocialAtomFlow] Uploading metadata to IPFS:', metadataToUpload)
      
      // 2. Upload all metadata to IPFS
      const ipfsUploadResults = await uploadJSONToIPFS(metadataToUpload)
      console.log('[CreateSocialAtomFlow] IPFS upload results:', ipfsUploadResults)
      
      // 3. Prepare atoms with IPFS URIs
      const atoms = [
        {
          label: socialAtomLabel,
          data: `ipfs://${ipfsUploadResults[0].IpfsHash}`
        },
        {
          label: imageAtomLabel,
          data: `ipfs://${ipfsUploadResults[1].IpfsHash}`
        }
      ]
      
      // 4. Add identity atom if requested
      if (includeIdentity && identityData.name && ipfsUploadResults[2]) {
        atoms.push({
          label: `identity:${identityData.name.toLowerCase().replace(/\s+/g, '-')}`,
          data: `ipfs://${ipfsUploadResults[2].IpfsHash}`
        })
      }
      
      console.log('[CreateSocialAtomFlow] Atoms to create:', atoms)
      console.log('[CreateSocialAtomFlow] Contract config:', contractConfig)
      
      // Create atoms
      const result = await createAtomsAndTriples.createAtoms(atoms)
      console.log('[CreateSocialAtomFlow] Atoms created successfully:', result)
      
      const { atomIds } = result
      
      // Prepare triples
      const triples = [
        // Social account -> has related image -> Profile picture
        {
          subjectId: atomIds[0], // Social atom
          predicateId: INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID,
          objectId: atomIds[1] // Image atom
        }
      ]
      
      // Add identity triples if created
      if (includeIdentity && atomIds[2]) {
        triples.push(
          // Identity -> has related image -> Profile picture
          {
            subjectId: atomIds[2], // Identity atom
            predicateId: INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID,
            objectId: atomIds[1] // Image atom
          },
          // Identity -> owns -> Social account
          {
            subjectId: atomIds[2], // Identity atom
            predicateId: INTUITION_TESTNET.OWNS_ATOM_ID,
            objectId: atomIds[0] // Social atom
          }
        )
      }
      
      console.log('[CreateSocialAtomFlow] Triples to create:', triples)
      
      // Create triples
      await createAtomsAndTriples.createTriples(triples)
      
      console.log('[CreateSocialAtomFlow] All atoms and triples created successfully!')
      
      // Invalidate queries for the created atoms
      await queryClient.invalidateQueries({
        queryKey: atomQueryKeys.search(creationData.name)
      })
      
      if (identityData?.name) {
        await queryClient.invalidateQueries({
          queryKey: atomQueryKeys.search(identityData.name)
        })
      }
      
      setStep('success')
      
      // Show success toast
      toast({
        title: '✅ Atoms Created Successfully!',
        description: 'Your atoms are being indexed. Use the refresh button (↻) if they show as "Not Found" initially.',
        duration: 8000, // Show for 8 seconds
      })
      
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err) {
      console.error('[CreateSocialAtomFlow] Error creating atoms:', err)
      setError(err instanceof Error ? err.message : 'Failed to create atoms')
      setStep('error')
    } finally {
      setIsCreating(false)
    }
  }
  
  const renderContent = () => {
    switch (step) {
      case 'review':
        return (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Social Media Atoms</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                The following atoms and relationships will be created for @{username}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Preview what will be created */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Social Media Account</p>
                    <p className="text-xs text-muted-foreground">{creationData.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">Avatar image for {displayName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Link className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Has Related Image</p>
                    <p className="text-xs text-muted-foreground">Links account to profile picture</p>
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  You can optionally add the real-world identity if you know who this account belongs to.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => setStep('identity-question')}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )
        
      case 'identity-question':
        return (
          <>
            <CardHeader>
              <CardTitle>Real-World Identity</CardTitle>
              <CardDescription>
                Do you know the real-world identity of @{username}?
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{displayName}</p>
                  <p className="text-sm text-muted-foreground">@{username}</p>
                </div>
              </div>
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('review')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIncludeIdentity(false)
                      handleCreate()
                    }}
                    disabled={isCreating || (balance !== null && estimatedCost !== null && balance < estimatedCost)}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'No, Skip Identity'
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setIncludeIdentity(true)
                      setStep('identity-form')
                    }}
                  >
                    Yes, Add Identity
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )
        
      case 'identity-form':
        return (
          <>
            <CardHeader>
              <CardTitle>Add Real-World Identity</CardTitle>
              <CardDescription>
                Provide information about the person behind @{username}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Elon Musk"
                  value={identityData.name}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this person..."
                  rows={3}
                  value={identityData.description}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <Alert>
                <AlertDescription className="text-xs">
                  This will create:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Identity atom for {identityData.name || 'this person'}</li>
                    <li>Connection: Identity → owns → @{username}</li>
                    <li>Connection: Identity → has image → Profile picture</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep('identity-question')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !identityData.name.trim() || (balance !== null && estimatedCost !== null && balance < estimatedCost)}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Atoms'
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )
        
      case 'creating':
        return (
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Creating atoms and relationships...</p>
            </div>
          </CardContent>
        )
        
      case 'success':
        return (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Success! 🎉</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Atoms created successfully and being indexed!
                  
                  <div className="mt-3 text-sm text-muted-foreground">
                    <strong>💡 Tip:</strong> It may take 15-30 seconds for the blockchain 
                    to index your atoms. If they show as "Not Found" initially, click the 
                    <RefreshCwIcon className="inline h-3 w-3 mx-1" /> refresh button in the queue.
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="text-center text-sm text-muted-foreground">
                Closing automatically in 3 seconds...
              </div>
              
              <Button onClick={onClose} className="w-full" variant="outline">
                Close Now
              </Button>
            </CardContent>
          </>
        )
        
      case 'error':
        return (
          <>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to create atoms</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error || 'An unknown error occurred'}</AlertDescription>
              </Alert>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={() => setStep('review')}>Try Again</Button>
              </div>
            </CardContent>
          </>
        )
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 border-0 shadow-none">
        {renderContent()}
      </Card>
    </div>
  )
} 