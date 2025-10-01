import React, { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, User, Image, Link, X } from 'lucide-react'
import { useAtomCreation } from '../../hooks/useAtomCreation'
import { useTransactionProvider } from '../../providers/TransactionProvider'
import { INTUITION_TESTNET } from '~/common/constants/web3'
import { formatUnits } from 'viem'
import type { AtomCreationData } from '../../lib/atom-queue/types'

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
  const [createdAtomIds, setCreatedAtomIds] = useState<Record<string, string>>({})
  
  const { createAtomsAndTriples } = useAtomCreation()
  const { contractConfig, publicClient, walletClient } = useTransactionProvider()
  
  const [isCreating, setIsCreating] = useState(false)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<bigint | null>(null)
  
  const avatarUrl = creationData.metadata?.avatarUrl
  const displayName = creationData.name || 'Unknown'
  const username = creationData.username || ''
  const userId = creationData.userId || ''
  
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
      
      // Prepare atoms to create
      const atoms = [
        // 1. Social media account atom
        {
          label: creationData.name, // x.com:userId
          data: {
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            name: creationData.name
          }
        },
        // 2. Profile picture atom
        {
          label: `${creationData.name}:image`,
          data: {
            '@context': 'https://schema.org',
            '@type': 'ImageObject',
            name: `${creationData.name}:image`,
            url: avatarUrl,
            image: avatarUrl
          }
        }
      ]
      
      // 3. Add identity atom if requested
      if (includeIdentity && identityData.name) {
        atoms.push({
          label: `identity:${identityData.name.toLowerCase().replace(/\s+/g, '-')}`,
          data: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: identityData.name,
            description: identityData.description
          }
        })
      }
      
      console.log('[CreateSocialAtomFlow] Atoms to create:', atoms)
      console.log('[CreateSocialAtomFlow] Contract config:', contractConfig)
      
      // Create atoms
      const result = await createAtomsAndTriples.createAtoms(atoms)
      console.log('[CreateSocialAtomFlow] Atoms created successfully:', result)
      
      const { atomIds } = result
      setCreatedAtomIds({
        social: atomIds[0],
        image: atomIds[1],
        identity: atomIds[2] // May be undefined
      })
      
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
      setStep('success')
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
              <CardTitle>Success!</CardTitle>
              <CardDescription>
                All atoms and relationships have been created successfully.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Social media account atom created</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Profile picture atom created</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Relationships established</span>
                </div>
                {includeIdentity && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Identity atom created for {identityData.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button onClick={onClose}>Done</Button>
              </div>
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