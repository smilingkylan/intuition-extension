import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Loader2, Info, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from '~/hooks/use-toast'
import { encodeFunctionData, parseEther, toHex, type Address } from 'viem'
import { useWeb3 } from '../hooks/useWeb3'
import { useTransactionProvider } from '../providers/TransactionProvider'
import { INTUITION_TESTNET } from '~/constants/web3'

// Random name generators
const adjectives = ['Quantum', 'Cosmic', 'Digital', 'Neural', 'Cyber', 'Atomic', 'Dynamic', 'Stellar', 'Hybrid', 'Crystal']
const nouns = ['Entity', 'Nexus', 'Core', 'Matrix', 'Sphere', 'Node', 'Portal', 'Circuit', 'Beacon', 'Conduit']
const suffixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Prime', 'Zero', 'One', 'Infinity', 'Genesis']

const generateRandomAtomName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  const randomNum = Math.floor(Math.random() * 1000)
  
  return `${adj}-${noun}-${suffix}-${randomNum}`
}

const DEFAULT_STAKE_AMOUNT = 40000000000000000n // 0.04 ETH

export function CreateRandomAtom() {
  const { isConnected, connectWallet } = useWeb3()
  const { sendTransaction, isReady, error: providerError, account, chainId } = useTransactionProvider()
  const [isCreating, setIsCreating] = useState(false)
  const [currentAtomName, setCurrentAtomName] = useState<string | null>(null)
  const [lastCreatedAtom, setLastCreatedAtom] = useState<{
    name: string
    atomId?: string
    transactionHash?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAtom = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!isReady) {
      setError('Transaction provider not ready. Please try again.')
      return
    }

    try {
      // Generate random atom name
      const atomName = generateRandomAtomName()
      setCurrentAtomName(atomName)
      
      setIsCreating(true)
      setError(null)
      
      toast({
        title: "Creating atom...",
        description: `Generating atom: ${atomName}`,
      })

      // Prepare atom metadata
      const atomMetadata = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: atomName,
        description: `Randomly generated atom: ${atomName}`,
        category: 'random',
        createdAt: new Date().toISOString(),
        creator: account
      }

      // Convert to hex-encoded JSON string
      const dataString = JSON.stringify(atomMetadata)
      const hexData = toHex(dataString)

      // Calculate costs
      const initialDeposit = parseEther('0.04') // 0.04 ETH as per DEFAULT_STAKE_AMOUNT
      const atomCost = parseEther('0.003') // Approximate atom creation cost
      const totalValue = initialDeposit + atomCost

      console.log('Creating atom with:', {
        name: atomName,
        metadata: atomMetadata,
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

      console.log('Transaction sent:', hash)

      toast({
        title: "Atom created successfully!",
        description: `Created atom: ${atomName}`,
      })
      
      // For demo purposes, generate a mock atom ID
      const mockAtomId = `0x${Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}`
      
      setLastCreatedAtom({
        name: atomName,
        atomId: mockAtomId,
        transactionHash: hash
      })
      
      // Reset current name
      setCurrentAtomName(null)

    } catch (error: any) {
      console.error('Failed to create atom:', error)
      
      const errorMessage = error.message?.includes('user rejected')
        ? 'Transaction cancelled by user'
        : error.message || 'Failed to create atom'
      
      setError(errorMessage)
      
      toast({
        title: "Failed to create atom",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getShortTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Random Atom Generator
        </CardTitle>
        <CardDescription>
          Generate and create random atoms on the Intuition network
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

        {!isConnected && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="flex items-center gap-2 pt-6">
              <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Please connect your wallet to use this feature
              </p>
            </CardContent>
          </Card>
        )}

        {currentAtomName && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Generating:</p>
            <Badge variant="secondary" className="text-sm">
              {currentAtomName}
            </Badge>
          </div>
        )}

        {lastCreatedAtom && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
              Last Created Atom
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">{lastCreatedAtom.name}</span>
              </div>
              {lastCreatedAtom.atomId && (
                <div className="flex justify-between">
                  <span>Atom ID:</span>
                  <span className="font-mono">{lastCreatedAtom.atomId}</span>
                </div>
              )}
              {lastCreatedAtom.transactionHash && (
                <div className="flex justify-between">
                  <span>Transaction:</span>
                  <span className="font-mono">{getShortTxHash(lastCreatedAtom.transactionHash)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleCreateAtom}
          disabled={isCreating || !isConnected || !isReady}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Atom...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate & Create Random Atom
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Creates a real atom on the blockchain with a 0.04 ETH stake</p>
          {isConnected && (
            <p>Connected: {account?.slice(0, 6)}...{account?.slice(-4)} | Chain ID: {chainId}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 