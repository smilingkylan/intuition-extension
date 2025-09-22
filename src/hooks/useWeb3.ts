import { useState, useEffect, useCallback } from 'react'
import { sendToBackground } from '@plasmohq/messaging'
import type { Web3State } from '../lib/storage'
import { INTUITION_TESTNET } from '../../common/constants/web3'
import { toast } from '../../common/hooks/use-toast'

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    connectedAddress: null,
    chainId: null,
    lastConnected: null
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('useWeb3 1 state', state)
  // Fetch initial state on mount
  useEffect(() => {
    console.log('useWeb3 2 useEffect')
    fetchConnectionState()

    // Listen for state changes from background
    const handleMessage = (message: any) => {
      console.log('useWeb3 3 handleMessage', message)
      if (message.type === 'WEB3_STATE_CHANGED') {
        console.log('Web3 state changed:', message.data)
        setState(message.data)
      } else if (message.type === 'ACCOUNT_CHANGED_NOTIFICATION') {
        const { newAccount } = message.data
        toast({
          title: "Account Changed",
          description: `Switched to ${newAccount.slice(0,6)}...${newAccount.slice(-4)}`,
          duration: 4000,
        })
      } else if (message.type === 'CHAIN_CHANGED_NOTIFICATION') {
        const { chainName } = message.data
        toast({
          title: "Network Changed", 
          description: `Switched to ${chainName}`,
          duration: 4000,
        })
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const fetchConnectionState = async () => {
    try {
      const response = await sendToBackground({
        name: 'web3',
        body: {
          action: 'GET_CONNECTION_STATE'
        }
      })

      if (response.success) {
        setState(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch connection state:', err)
    }
  }

  const connectWallet = async () => {
    console.log('useWeb3 4 connectWallet')
    setIsConnecting(true)
    setError(null)

    try {
      console.log('Attempting to connect wallet...')
      const response = await sendToBackground({
        name: 'web3',
        body: {
          method: 'connectWallet',
          params: []
        }
      })

      console.log('Connect wallet response:', response)

      if (response.success !== false && response.address) {
        // Success response from new format
        setState({
          isConnected: true,
          connectedAddress: response.address,
          chainId: response.chainId,
          lastConnected: Date.now()
        })
      } else if (response.success && response.data) {
        // Success response from legacy format
        setState({
          isConnected: true,
          connectedAddress: response.data.address,
          chainId: response.data.chainId,
          lastConnected: Date.now()
        })
      } else {
        // Error response
        const errorMessage = response.error || 'Failed to connect wallet'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      console.error('Connect wallet error:', err)
      const errorMessage = err.message || 'Failed to connect wallet'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const response = await sendToBackground({
        name: 'web3',
        body: {
          method: 'disconnect',
          params: []
        }
      })

      // Always update local state regardless of response
      setState({
        isConnected: false,
        connectedAddress: null,
        chainId: null,
        lastConnected: null
      })
    } catch (err) {
      console.error('Failed to disconnect wallet:', err)
      // Still update local state on error
      setState({
        isConnected: false,
        connectedAddress: null,
        chainId: null,
        lastConnected: null
      })
    }
  }

  const getShortAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number | null) => {
    if (!chainId) return 'Unknown'
    switch (chainId) {
      case 13579:
        return 'Intuition Testnet'
      default:
        return `Chain ${chainId}`
    }
  }

  return {
    ...state,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    getNetworkName,
    refetch: fetchConnectionState
  }
}