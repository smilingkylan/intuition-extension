import { AlertTriangle, Network } from 'lucide-react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { useWeb3 } from '../hooks/useWeb3'
import { INTUITION_TESTNET } from '../../common/constants/web3'

export function NetworkWarning() {
  const { 
    isConnected, 
    isOnCorrectChain, 
    switchToIntuitionTestnet,
    chainId,
    getNetworkName
  } = useWeb3()
  
  // Only show warning if connected but on wrong chain
  const shouldShowWarning = isConnected && !isOnCorrectChain
  
  if (!shouldShowWarning) return null
  
  const handleSwitch = async () => {
    try {
      await switchToIntuitionTestnet()
    } catch (error) {
      // Error is already handled in the hook with toast notifications
      console.error('Failed to switch network:', error)
    }
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">Wrong Network</span>
          <span className="text-sm">
            Currently on {getNetworkName(chainId)}. Please switch to {INTUITION_TESTNET.CHAIN_NAME} to use this app.
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSwitch}
          className="whitespace-nowrap"
        >
          <Network className="h-3 w-3 mr-1" />
          Switch to {INTUITION_TESTNET.CHAIN_NAME}
        </Button>
      </AlertDescription>
    </Alert>
  )
} 