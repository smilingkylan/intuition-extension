import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Sparkles, Loader2, ExternalLink, AlertCircle, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { toast } from "~/hooks/use-toast"
import { useWeb3 } from '~/hooks/useWeb3'
import { useSingleAtomCreation } from '~/hooks/useSingleAtomCreation'

// Mock data for random atom generation
const atomCategories = [
  { name: 'Concept', emoji: '💡' },
  { name: 'Person', emoji: '👤' },
  { name: 'Place', emoji: '📍' },
  { name: 'Thing', emoji: '🎯' },
  { name: 'Event', emoji: '📅' },
  { name: 'Emotion', emoji: '😊' },
]

const sampleAtoms = {
  'Concept': ['Innovation', 'Wisdom', 'Creativity', 'Knowledge', 'Truth'],
  'Person': ['Satoshi Nakamoto', 'Marie Curie', 'Leonardo da Vinci', 'Ada Lovelace'],
  'Place': ['Silicon Valley', 'Ancient Library of Alexandria', 'CERN', 'MIT'],
  'Thing': ['Bitcoin', 'Internet', 'Smartphone', 'Blockchain'],
  'Event': ['Moon Landing', 'Internet Birth', 'Bitcoin Genesis', 'Industrial Revolution'],
  'Emotion': ['Joy', 'Curiosity', 'Wonder', 'Excitement'],
}

export function RandomAtomCreator() {
  const { isConnected, connectWallet } = useWeb3()
  const { createAtom, isCreating, error, transactionHash, reset } = useSingleAtomCreation()
  
  const [generatedAtom, setGeneratedAtom] = useState<{
    label: string
    description: string
    emoji: string
    category: string
  } | null>(null)
  const [atomId, setAtomId] = useState<string | null>(null)

  const generateAtom = () => {
    const category = atomCategories[Math.floor(Math.random() * atomCategories.length)]
    const atomsForCategory = sampleAtoms[category.name as keyof typeof sampleAtoms]
    const label = atomsForCategory[Math.floor(Math.random() * atomsForCategory.length)]
    
    setGeneratedAtom({
      label,
      description: `A fundamental ${category.name.toLowerCase()} in the knowledge graph`,
      emoji: category.emoji,
      category: category.name
    })
    
    // Reset previous transaction state
    reset()
    setAtomId(null)
  }

  const handleCreateAtom = async () => {
    if (!generatedAtom) return

    try {
      // Create the atom data structure (mimicking IPFS format)
      const atomData = {
        label: generatedAtom.label,
        description: generatedAtom.description,
        emoji: generatedAtom.emoji,
        category: generatedAtom.category,
        created_at: new Date().toISOString()
      }

      // Convert to IPFS URI (simulating - in production, you'd upload to IPFS first)
      const dataString = `ipfs://QmRandom${Date.now()}`
      
      // Create atom with 0.01 ETH stake
      const result = await createAtom({
        uri: dataString,
        stake: '0.01'
      })

      setAtomId(result.atomId)

      toast({
        title: "Atom Created!",
        description: `Your ${generatedAtom.label} has been created successfully.`,
      })

      // Clear the generated atom after success
      setTimeout(() => {
        setGeneratedAtom(null)
      }, 3000)

    } catch (err: any) {
      // Error is already handled by the hook
      console.error('Failed to create atom:', err)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
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
        {!isConnected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Required</AlertTitle>
            <AlertDescription>
              Please connect your wallet to create atoms
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {!generatedAtom && !transactionHash && (
              <Button 
                onClick={generateAtom} 
                className="w-full" 
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Random Atom
              </Button>
            )}

            {generatedAtom && !transactionHash && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-secondary/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{generatedAtom.emoji}</span>
                      <h3 className="font-semibold text-lg">{generatedAtom.label}</h3>
                    </div>
                    <Badge variant="secondary">{generatedAtom.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {generatedAtom.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateAtom} 
                    className="flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Create Atom (0.01 ETH)
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={generateAtom} 
                    variant="outline"
                    disabled={isCreating}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}

            {transactionHash && (
              <div className="space-y-3">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <AlertTitle className="text-green-800 dark:text-green-200">
                    Success! 🎉
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your atom has been created on-chain
                  </AlertDescription>
                </Alert>

                {atomId && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Atom ID</p>
                    <code className="text-xs break-all">{atomId}</code>
                  </div>
                )}

                <Button 
                  onClick={generateAtom} 
                  className="w-full"
                  variant="outline"
                >
                  Generate Another
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      {!isConnected && (
        <CardFooter>
          <Button 
            onClick={connectWallet} 
            className="w-full"
          >
            Connect Wallet
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
