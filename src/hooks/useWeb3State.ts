// hooks/useWeb3State.ts
import { useState, useEffect } from 'react'
import { Web3Storage, type Web3State } from '../lib/storage'

export function useWeb3State() {
  const [state, setState] = useState<Web3State>({
    connectedAddress: null,
    chainId: null,
    isConnected: false,
    lastConnected: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      try {
        const initialState = await Web3Storage.getState()
        setState(initialState)
      } catch (error) {
        console.error('Failed to load web3 state:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialState()

    // Listen for state changes from background
    const handleMessage = (message: any) => {
      if (message.type === 'WEB3_STATE_CHANGED') {
        setState(message.data)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return { state, loading }
}