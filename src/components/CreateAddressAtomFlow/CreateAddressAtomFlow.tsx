import { useState, useEffect } from 'react'
import { useAtomCreation } from '~/hooks/useAtomCreation'
import { useTransactionProvider } from '~/providers/TransactionProvider'
import { uploadJSONToIPFS } from '~/util'
import { INTUITION_TESTNET } from '~/constants/web3'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Skeleton } from "~/components/ui/skeleton"
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Plus, Wallet } from 'lucide-react'
import { formatUnits } from 'viem'
import { useToast } from "~/hooks/use-toast"
import { atomQueryKeys } from '~/lib/atom-queue/query-keys'
import { useQueryClient } from '@tanstack/react-query'
import { isAddress } from 'viem'

interface CreateAddressAtomFlowProps {
  creationData: {
    type: 'address'
    name: string
    description: string
    address: string
    metadata?: any
  }
  onClose: () => void
}

type Step = 'review' | 'nickname' | 'creating' | 'success' | 'error'

/**
 * Component for creating EVM address atoms.
 * 
 * Address atoms use the address directly as the atom data (no IPFS upload).
 * Optionally creates a nickname triple relationship.
 */
export function CreateAddressAtomFlow({ creationData, onClose }: CreateAddressAtomFlowProps) {
  const [step, setStep] = useState<Step>('review')
  const [error, setError] = useState<string | null>(null)
  const [includeNickname, setIncludeNickname] = useState(false)
  const [nickname, setNickname] = useState('')
  
  const queryClient = useQueryClient()
  const { createAtomsAndTriples } = useAtomCreation()
  const { contractConfig, publicClient, walletClient } = useTransactionProvider()
  const { toast } = useToast()
  
  const [isCreating, setIsCreating] = useState(false)
  const [balance, setBalance] = useState<bigint | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<bigint | null>(null)
  const [createdAtomId, setCreatedAtomId] = useState<string | null>(null)
  const [createdTripleId, setCreatedTripleId] = useState<string | null>(null)
  
  // Validate and format the address
  const formattedAddress = isAddress(creationData.address) ? creationData.address : null
  
  // Fetch balance and calculate cost
  useEffect(() => {
    const fetchBalanceAndCost = async () => {
      if (!walletClient?.account || !publicClient || !contractConfig) return
      
      try {
        // Get user balance
        const userBalance = await publicClient.getBalance({
          address: walletClient.account.address
        })
        setBalance(userBalance)
        
        // Calculate costs
        const atomCost = contractConfig.atom_cost ? BigInt(contractConfig.atom_cost) : BigInt(0)
        const minDeposit = contractConfig.min_deposit ? BigInt(contractConfig.min_deposit) : BigInt(0)
        let totalCost = atomCost + minDeposit
        
        // Add costs for nickname if included
        if (includeNickname && nickname) {
          // One more atom for nickname + one triple
          totalCost += atomCost + minDeposit // nickname atom
          const tripleCost = contractConfig.triple_cost ? BigInt(contractConfig.triple_cost) : BigInt(0)
          totalCost += tripleCost + minDeposit // triple
        }
        
        setEstimatedCost(totalCost)
      } catch (err) {
        console.error('Error fetching balance:', err)
      }
    }
    
    if (step === 'review' || step === 'nickname') {
      fetchBalanceAndCost()
    }
  }, [step, includeNickname, nickname, walletClient, publicClient, contractConfig])
  
  const handleCreate = async () => {
    setStep('creating')
    setError(null)
    setIsCreating(true)
    
    try {
      // Check wallet balance first
      if (balance && estimatedCost && balance < estimatedCost) {
        throw new Error(`Insufficient balance. You need ${formatUnits(estimatedCost, 18)} ETH but only have ${formatUnits(balance, 18)} ETH`)
      }
      
      if (!formattedAddress) {
        throw new Error('Invalid EVM address format')
      }
      
      // 1. Prepare atoms
      const atoms = [
        {
          label: formattedAddress,
          data: formattedAddress // Using address directly as data
        }
      ]
      
      // 2. Add nickname atom if requested
      let nicknameAtomIndex = -1
      if (includeNickname && nickname) {
        nicknameAtomIndex = atoms.length
        
        // Upload nickname metadata to IPFS
        const nicknameMetadata = {
          '@context': 'https://schema.org',
          '@type': 'Thing',
          name: nickname
        }
        
        const [nicknameIpfsResult] = await uploadJSONToIPFS([nicknameMetadata])
        
        atoms.push({
          label: nickname,
          data: `ipfs://${nicknameIpfsResult.IpfsHash}`
        })
      }
      
      // 3. Create atoms
      const result = await createAtomsAndTriples.createAtoms(atoms)
      const { atomIds } = result
      setCreatedAtomId(atomIds[0])
      
      // 4. Create nickname triple if needed
      if (includeNickname && nickname && nicknameAtomIndex !== -1) {
        const triples = [
          {
            subjectId: atomIds[0], // Address atom
            predicateId: INTUITION_TESTNET.HAS_NICKNAME_ATOM_ID,
            objectId: atomIds[nicknameAtomIndex] // Nickname atom
          }
        ]
        
        const tripleResult = await createAtomsAndTriples.createTriples(triples)
        if (tripleResult?.tripleIds?.[0]) {
          setCreatedTripleId(tripleResult.tripleIds[0])
        }
      }
      
      // 5. Invalidate relevant queries
      await queryClient.invalidateQueries({
        queryKey: atomQueryKeys.search(formattedAddress)
      })
      
      setStep('success')
      setIsCreating(false)
      
      toast({
        title: "Address Atom Created!",
        description: `Successfully created atom for ${formattedAddress}${nickname ? ` with nickname "${nickname}"` : ''}`,
      })
    } catch (err: any) {
      console.error('[CreateAddressAtomFlow] Error creating atom:', err)
      setError(err.message || 'Failed to create atom')
      setStep('error')
      setIsCreating(false)
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to create atom',
      })
    }
  }
  
  const handleBack = () => {
    if (step === 'nickname') {
      setStep('review')
    } else {
      onClose()
    }
  }
  
  const handleProceedToNickname = () => {
    if (includeNickname) {
      setStep('nickname')
    } else {
      handleCreate()
    }
  }
  
  if (!formattedAddress) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Invalid Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              The provided address is not a valid EVM address format.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose} variant="secondary" className="w-full">
            Close
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        {/* Review Step */}
        {step === 'review' && (
          <>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="w-fit mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Create Address Atom
              </CardTitle>
              <CardDescription>
                Review the address atom details before creating
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label>EVM Address</Label>
                <div className="mt-1 font-mono text-sm bg-muted p-2 rounded break-all">
                  {formattedAddress}
                </div>
              </div>
              
              <Alert className="min-h-[60px]">
                <AlertDescription>
                  {estimatedCost ? (
                    <>
                      Estimated cost: {formatUnits(estimatedCost, 18)} ETH
                      {balance && balance < estimatedCost && (
                        <span className="text-destructive block mt-1">
                          Insufficient balance
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!balance || (balance < (estimatedCost || BigInt(0)))}
                className="flex-1"
              >
                Create Atom
              </Button>
              <Button 
                onClick={() => {
                  setIncludeNickname(true)
                  setStep('nickname')
                }}
                disabled={!balance || (balance < (estimatedCost || BigInt(0)))}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Nickname
              </Button>
            </CardFooter>
          </>
        )}
        
        {/* Nickname Step */}
        {step === 'nickname' && (
          <>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="w-fit mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <CardTitle>Add Nickname</CardTitle>
              <CardDescription>
                Provide a human-readable nickname for this address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g., Vitalik's Wallet, Uniswap Router"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will create a relationship: {formattedAddress.slice(0, 6)}...{formattedAddress.slice(-4)} → has nickname → {nickname || '...'}
                </p>
              </div>
              
              <Alert className="min-h-[60px]">
                <AlertDescription>
                  {estimatedCost ? (
                    <>
                      Estimated cost: {formatUnits(estimatedCost, 18)} ETH
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!nickname.trim() || !balance || (balance < (estimatedCost || BigInt(0)))}
                className="flex-1"
              >
                Create Atom & Nickname
              </Button>
            </CardFooter>
          </>
        )}
        
        {/* Creating Step */}
        {step === 'creating' && (
          <>
            <CardHeader>
              <CardTitle>Creating Address Atom</CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground text-center">
                  {includeNickname && nickname ? 
                    'Creating address atom and nickname relationship...' : 
                    'Creating address atom...'}
                </p>
              </div>
            </CardContent>
          </>
        )}
        
        {/* Success Step */}
        {step === 'success' && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Success!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Successfully created atom for address:
              </p>
              <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                {formattedAddress}
              </div>
              {includeNickname && nickname && (
                <>
                  <p className="text-sm">
                    With nickname: <span className="font-medium">{nickname}</span>
                  </p>
                  {createdTripleId && (
                    <p className="text-xs text-muted-foreground">
                      Triple ID: {createdTripleId}
                    </p>
                  )}
                </>
              )}
              {createdAtomId && (
                <p className="text-xs text-muted-foreground">
                  Atom ID: {createdAtomId}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </CardFooter>
          </>
        )}
        
        {/* Error Step */}
        {step === 'error' && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  {error || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('review')} className="flex-1">
                Try Again
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
