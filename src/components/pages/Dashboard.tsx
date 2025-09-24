import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { toast } from '~/hooks/use-toast'
import { useTheme } from '~/components/ThemeProvider'
import { useMode } from '../../hooks/useModeContext'
import { useTweetHover } from '../../hooks/useTweetHover'
import { useWeb3 } from '../../hooks/useWeb3'
import { TweetDisplay } from '../TweetDisplay'
import { AtomDisplay } from '../AtomDisplay'
import { AtomCreationStatus } from '../AtomCreationStatus'
import { NetworkWarning } from '../NetworkWarning'
import { RandomAtomCreator } from '../RandomAtomCreator'
import { formatSocialAtomLabel } from '~/util/api'
import { TrendingUpIcon, ActivityIcon, LayersIcon, UsersIcon, SendIcon } from 'lucide-react'

export function Dashboard() {
  const { currentTweet, isHovering } = useTweetHover()
  const { theme } = useTheme()
  const { currentMode, isMouseMode, isExploreMode } = useMode()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSendingTx, setIsSendingTx] = useState(false)
  
  // Web3 hook
  const { 
    isConnected, 
    connectedAddress, 
    chainId,
    getNetworkName,
    sendSelfTransfer,
    isOnCorrectChain 
  } = useWeb3()
  
  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          toast({
            title: "Data refreshed",
            description: "Your dashboard has been updated with the latest data.",
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }
  
  // Handle self-transfer
  const handleSelfTransfer = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    setIsSendingTx(true)
    
    try {
      const result = await sendSelfTransfer('1')
      
      toast({
        title: "Transaction sent!",
        description: `Sent 1 native token to yourself. Tx: ${result.hash?.slice(0, 10)}...`,
      })
    } catch (err: any) {
      console.error('Self-transfer failed:', err)
      toast({
        title: "Transaction failed",
        description: err.message || "Failed to send transaction",
        variant: "destructive"
      })
    } finally {
      setIsSendingTx(false)
    }
  }
  
  return (
    <div className="px-6 pt-8 pb-6 space-y-6">
      {/* Network Warning - Shows when on wrong network */}
      <NetworkWarning />
      
      {/* Random Atom Creator */}
      <RandomAtomCreator />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your Intuition overview
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {isLoading && (
        <Progress value={progress} className="w-full" />
      )}

      {/* Self-Transfer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SendIcon className="h-5 w-5" />
            Test Transaction
          </CardTitle>
          <CardDescription>
            Send 1 native token to yourself on {isConnected ? getNetworkName(chainId) : 'the current network'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isConnected ? (
              <>
                <div className="text-sm text-muted-foreground">
                  From & To: <code className="text-xs">{connectedAddress}</code>
                </div>
                <Button 
                  onClick={handleSelfTransfer} 
                  disabled={isSendingTx || !isOnCorrectChain}
                  className="w-full"
                >
                  {isSendingTx ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Sending Transaction...
                    </>
                  ) : (
                    <>
                      <SendIcon className="mr-2 h-4 w-4" />
                      Send 1 Token to Self
                    </>
                  )}
                </Button>
                {!isOnCorrectChain && (
                  <p className="text-xs text-destructive text-center">
                    Please switch to Intuition Testnet to send transactions
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to send a test transaction
                </p>
                <Badge variant="secondary">Wallet Not Connected</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      {/* Current Tweet Display */}
      <TweetDisplay tweet={currentTweet} isHovering={isHovering} />
      
      {/* Atom Display for Tweet Author */}
      <AtomDisplay 
        identifier={currentTweet?.username}
        platform="x.com"
        formatLabel={(username) => `x.com:${username.toLowerCase()}`}
        title="Tweet Author Atom"
        notFoundMessage={`No Intuition atom found for @${currentTweet?.username || 'this user'}`}
      />
      
      {/* Atom Creation Status */}
      <AtomCreationStatus />
    </div>
  )
}