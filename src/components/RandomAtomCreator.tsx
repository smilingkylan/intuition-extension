import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useTransactionProvider } from '../providers/TransactionProvider'
import { useWeb3 } from '../hooks/useWeb3'
import { encodeFunctionData, parseEther, toHex, type Address } from 'viem'
import { INTUITION_TESTNET } from '~/constants/web3'
import { toast } from '~/hooks/use-toast'

// Function to generate random atom data
function generateRandomAtomData() {
  const categories = ['person', 'thing', 'concept', 'place', 'event']
  const adjectives = ['amazing', 'mysterious', 'quantum', 'cosmic', 'ethereal', 'digital', 'ancient', 'futuristic']
  const nouns = ['explorer', 'artifact', 'dimension', 'nexus', 'crystal', 'portal', 'beacon', 'matrix']
  
  const category = categories[Math.floor(Math.random() * categories.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  
  return {
    label: `${adjective} ${noun}`,
    description: `A ${category} that represents the ${adjective} nature of the ${noun} in the Intuition ecosystem.`,
    emoji: '✨',
    category
  }
}

export function RandomAtomCreator() {
  const { isConnected, connectWallet } = useWeb3()
  const { sendTransaction, isReady, error: providerError, account, chainId } = useTransactionProvider()
  
  const [isCreating, setIsCreating] = useState(false)
  const [generatedAtom, setGeneratedAtom] = useState<ReturnType<typeof generateRandomAtomData> | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [atomId, setAtomId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateAtom = () => {
    const atomData = generateRandomAtomData()
    setGeneratedAtom(atomData)
    setTransactionHash(null)
    setAtomId(null)
    setError(null)
  }

  const createAtom = async () => {
    if (!generatedAtom || !isReady) return

    setIsCreating(true)
    setError(null)
    setTransactionHash(null)
    setAtomId(null)

    try {
      // Create the atom data structure (mimicking IPFS format)
      const atomData = {
        label: generatedAtom.label,
        description: generatedAtom.description,
        emoji: generatedAtom.emoji,
        category: generatedAtom.category,
        created_at: new Date().toISOString(),
        creator: account
      }

      // Convert to hex-encoded JSON string (simulating IPFS URI)
      const dataString = `ipfs://QmRandom${Date.now()}` // In production, you'd upload to IPFS first
      const hexData = toHex(dataString)

      // Initial deposit (0.01 ETH)
      const initialDeposit = parseEther('0.01')

      // Calculate atom cost (simplified - in production, read from contract)
      const atomCost = parseEther('0.003') // Approximate atom creation cost

      // Total value needed
      const totalValue = initialDeposit + atomCost

      console.log('Creating atom with:', {
        data: dataString,
        hexData,
        initialDeposit: initialDeposit.toString(),
        atomCost: atomCost.toString(),
        totalValue: totalValue.toString()
      })

      // Encode the function call
      const data = encodeFunctionData({
        abi: INTUITION_TESTNET.CONTRACT_ABI,
        functionName: 'createAtoms',
        args: [
          [hexData], // Array of hex-encoded data
          [initialDeposit] // Array of initial deposits
        ]
      })

      // Send transaction directly through sidepanel provider
      const hash = await sendTransaction({
        to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        data,
        value: totalValue
      })

      setTransactionHash(hash)
      
      // For demo purposes, generate a mock atom ID
      // In production, you'd parse this from transaction events
      const mockAtomId = `0x${Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}`
      setAtomId(mockAtomId)

      toast({
        title: "Atom Created!",
        description: `Your ${generatedAtom.label} has been created successfully.`,
      })

      // Clear the generated atom after success
      setTimeout(() => {
        setGeneratedAtom(null)
      }, 3000)

    } catch (err: any) {
      console.error('Failed to create atom:', err)
      
      const errorMessage = err.message?.includes('user rejected')
        ? 'Transaction cancelled by user'
        : err.message || 'Failed to create atom'
      
      setError(errorMessage)
      
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Show connect button if not connected
  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Random Atom Creator</CardTitle>
          <CardDescription>Connect your wallet to create random atoms</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Random Atom Creator</CardTitle>
        <CardDescription>
          Generate and create random atoms on Intuition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Error */}
        {providerError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{providerError}</AlertDescription>
          </Alert>
        )}

        {/* Transaction Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated Atom Preview */}
        {generatedAtom && !transactionHash && (
          <div className="p-4 border rounded-lg bg-secondary/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{generatedAtom.emoji}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{generatedAtom.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">{generatedAtom.description}</p>
                <p className="text-xs text-muted-foreground mt-2">Category: {generatedAtom.category}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {transactionHash && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-green-600">Atom created successfully!</p>
                <p className="text-xs text-muted-foreground">
                  Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                </p>
                {atomId && (
                  <p className="text-xs text-muted-foreground">
                    Atom ID: {atomId}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!generatedAtom || transactionHash ? (
            <Button 
              onClick={generateAtom} 
              className="flex-1"
              disabled={isCreating}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Random Atom
            </Button>
          ) : (
            <>
              <Button 
                onClick={generateAtom} 
                variant="outline"
                className="flex-1"
                disabled={isCreating}
              >
                Regenerate
              </Button>
              <Button 
                onClick={createAtom} 
                className="flex-1"
                disabled={isCreating || !isReady}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Atom'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Wallet Info */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          Connected: {account?.slice(0, 6)}...{account?.slice(-4)} | Chain ID: {chainId}
        </div>
      </CardContent>
    </Card>
  )
} 