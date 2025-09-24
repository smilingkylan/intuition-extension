import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createExternalExtensionProvider } from '@metamask/providers'
import { createWalletClient, custom, type WalletClient, type Address, parseEther } from 'viem'
import { Web3Storage, type Web3State } from '../lib/storage'
import { intuitionTestnet } from '~/constants/intuitionTestnet'

interface TransactionProviderContextType {
  // State from background
  account: Address | null
  chainId: number | null
  isConnected: boolean
  
  // Transaction capabilities
  sendTransaction: (tx: any) => Promise<string>
  signMessage: (message: string) => Promise<string>
  
  // Status
  isReady: boolean
  error: string | null
}

const TransactionProviderContext = createContext<TransactionProviderContextType | null>(null)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // State managed by background
  const [state, setState] = useState<Web3State | null>(null)
  
  // Local provider just for transactions - use 'any' type to avoid type conflicts
  const providerRef = useRef<any>(null)
  const walletClientRef = useRef<WalletClient | null>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get state from background storage
        const savedState = await Web3Storage.getState()
        setState(savedState)

        // 2. Only create provider if wallet is connected
        if (savedState.isConnected && savedState.connectedAddress && savedState.chainId) {
          console.log('TransactionProvider: Creating provider for connected wallet', savedState)
          
          // Create provider instance (but don't connect - just for signing)
          const provider = createExternalExtensionProvider()
          providerRef.current = provider

          // Verify the provider has access to the account
          try {
            const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
            console.log('TransactionProvider: Available accounts', accounts)
            
            if (accounts && accounts.length > 0 && accounts.includes(savedState.connectedAddress)) {
              // Create wallet client with the stored account info
              const walletClient = createWalletClient({
                account: savedState.connectedAddress as Address,
                chain: intuitionTestnet,
                transport: custom(provider)
              })
              walletClientRef.current = walletClient
              setIsReady(true)
              console.log('TransactionProvider: Ready for transactions')
            } else {
              console.warn('TransactionProvider: Account not available in provider')
              setError('Wallet account not available. Please reconnect.')
            }
          } catch (err) {
            console.error('TransactionProvider: Failed to verify account access', err)
            setError('Failed to access wallet')
          }
        } else {
          console.log('TransactionProvider: No connected wallet found')
        }
      } catch (err) {
        console.error('Failed to initialize transaction provider:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    init()

    // Listen for state changes from background
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.web3_state) {
        const newState = changes.web3_state.newValue as Web3State
        console.log('TransactionProvider: State changed', newState)
        setState(newState)
        
        // Recreate wallet client if account/chain changed
        if (newState.isConnected && newState.connectedAddress && newState.chainId && providerRef.current) {
          providerRef.current.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
            if (accounts && accounts.includes(newState.connectedAddress!)) {
              const walletClient = createWalletClient({
                account: newState.connectedAddress as Address,
                chain: intuitionTestnet,
                transport: custom(providerRef.current!)
              })
              walletClientRef.current = walletClient
              setIsReady(true)
              setError(null)
            } else {
              walletClientRef.current = null
              setIsReady(false)
              setError('Wallet account not available')
            }
          })
        } else {
          walletClientRef.current = null
          setIsReady(false)
        }
      }
    }

    // Also listen for runtime messages
    const handleMessage = (message: any) => {
      if (message.type === 'WEB3_STATE_CHANGED') {
        const newState = message.data as Web3State
        setState(newState)
        // Same recreation logic as above
        if (newState.isConnected && newState.connectedAddress && newState.chainId && providerRef.current) {
          providerRef.current.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
            if (accounts && accounts.includes(newState.connectedAddress!)) {
              const walletClient = createWalletClient({
                account: newState.connectedAddress as Address,
                chain: intuitionTestnet,
                transport: custom(providerRef.current!)
              })
              walletClientRef.current = walletClient
              setIsReady(true)
              setError(null)
            }
          })
        } else {
          walletClientRef.current = null
          setIsReady(false)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const sendTransaction = async (tx: any): Promise<string> => {
    if (!walletClientRef.current || !state?.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('TransactionProvider: Sending transaction', tx)
      // This will trigger MetaMask popup directly
      const hash = await walletClientRef.current.sendTransaction(tx)
      console.log('TransactionProvider: Transaction sent', hash)
      return hash
    } catch (err: any) {
      // Handle user rejection, etc
      console.error('Transaction failed:', err)
      throw err
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!walletClientRef.current || !state?.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await walletClientRef.current.signMessage({
        account: state.connectedAddress as Address,
        message
      })
      return signature
    } catch (err: any) {
      console.error('Signing failed:', err)
      throw err
    }
  }

  const value: TransactionProviderContextType = {
    account: state?.connectedAddress as Address | null,
    chainId: state?.chainId || null,
    isConnected: state?.isConnected || false,
    sendTransaction,
    signMessage,
    isReady,
    error
  }

  return (
    <TransactionProviderContext.Provider value={value}>
      {children}
    </TransactionProviderContext.Provider>
  )
}

export const useTransactionProvider = () => {
  const context = useContext(TransactionProviderContext)
  if (!context) {
    throw new Error('useTransactionProvider must be used within TransactionProvider')
  }
  return context
} 