import React, { useState } from 'react'
import { sendToBackground } from '@plasmohq/messaging'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Loader2, Info, Sparkles } from 'lucide-react'
import { toast } from '~/hooks/use-toast'
import { toHex } from 'viem'
import { useWeb3 } from '../hooks/useWeb3'

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
  const [isCreating, setIsCreating] = useState(false)
  const [currentAtomName, setCurrentAtomName] = useState<string | null>(null)
  const [lastCreatedAtom, setLastCreatedAtom] = useState<{
    name: string
    atomId?: string
    transactionHash?: string
  } | null>(null)

  const handleCreateAtom = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    try {
      // Generate random atom name
      const atomName = generateRandomAtomName()
      setCurrentAtomName(atomName)
      
      setIsCreating(true)
      
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
        createdAt: new Date().toISOString()
      }

      // Send to background for execution (includes simulation)
      const response = await sendToBackground({
        name: 'web3',
        body: {
          method: 'createAtoms',
          params: [
            [toHex(JSON.stringify(atomMetadata))], // data array
            [DEFAULT_STAKE_AMOUNT.toString()], // assets array
            DEFAULT_STAKE_AMOUNT.toString() // value
          ]
        }
      })

      console.log('Create atom response:', response)

      if (response.success !== false && response.transactionHash) {
        toast({
          title: "Atom created successfully!",
          description: `Created atom: ${atomName}`,
        })
        
        setLastCreatedAtom({
          name: atomName,
          atomId: response.atomId,
          transactionHash: response.transactionHash
        })
        
        // Reset current name
        setCurrentAtomName(null)
      } else {
        throw new Error(response.error || 'Failed to create atom')
      }

    } catch (error: any) {
      console.error('Failed to create atom:', error)
      
      // Check if it's a simulation error
      if (error.message?.includes('simulation failed') || error.message?.includes('would revert')) {
        toast({
          title: "Transaction would fail",
          description: "The transaction simulation failed. This usually means insufficient balance or the atom already exists.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Failed to create atom",
          description: error.message || 'An error occurred while creating the atom',
          variant: "destructive"
        })
      }
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
          disabled={isCreating || !isConnected}
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
          <p>Transaction is simulated before execution for safety</p>
        </div>
      </CardContent>
    </Card>
  )
} 