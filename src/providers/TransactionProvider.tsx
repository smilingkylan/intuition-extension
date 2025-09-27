import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createExternalExtensionProvider } from '@metamask/providers'
import { 
  createWalletClient, 
  createPublicClient, 
  custom, 
  http,
  type WalletClient, 
  type PublicClient,
  type Address, 
  parseEther,
  type Hash 
} from 'viem'
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
  waitForTransactionReceipt: (hash: Hash) => Promise<any>
  
  // Clients
  publicClient: PublicClient | null
  
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
  const publicClientRef = useRef<PublicClient | null>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get state from background storage
        const savedState = await Web3Storage.getState()
        setState(savedState)

        // 2. Create public client (always available for reading)
        const publicClient = createPublicClient({
          chain: intuitionTestnet,
          transport: http()
        })
        publicClientRef.current = publicClient

        // 3. Only create wallet provider if wallet is connected
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
    const handleStorageChange = (changes: any) => {
      if (changes.web3State) {
        console.log('TransactionProvider: State updated from background', changes.web3State.newValue)
        setState(changes.web3State.newValue)
        // Re-initialize if connection status changed
        if (changes.web3State.newValue?.isConnected !== changes.web3State.oldValue?.isConnected) {
          init()
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // Also listen for runtime messages
    const handleMessage = (message: any) => {
      if (message.type === 'WEB3_STATE_UPDATED') {
        console.log('TransactionProvider: Received state update message', message.state)
        setState(message.state)
        init()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const sendTransaction = async (tx: any) => {
    if (!isReady || !walletClientRef.current) {
      throw new Error('Wallet not ready for transactions')
    }

    if (!state?.isConnected || !state?.connectedAddress) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('TransactionProvider: Sending transaction', tx)
      
      // Use wallet client to send transaction
      const hash = await walletClientRef.current.sendTransaction({
        ...tx,
        account: state.connectedAddress as Address,
        chain: intuitionTestnet
      })

      console.log('TransactionProvider: Transaction sent', hash)
      return hash
    } catch (err: any) {
      console.error('TransactionProvider: Transaction failed', err)
      throw new Error(err.message || 'Transaction failed')
    }
  }

  const signMessage = async (message: string) => {
    if (!isReady || !walletClientRef.current) {
      throw new Error('Wallet not ready for signing')
    }

    if (!state?.isConnected || !state?.connectedAddress) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await walletClientRef.current.signMessage({
        account: state.connectedAddress as Address,
        message
      })
      return signature
    } catch (err: any) {
      console.error('TransactionProvider: Signing failed', err)
      throw new Error(err.message || 'Signing failed')
    }
  }

  const waitForTransactionReceipt = async (hash: Hash) => {
    if (!publicClientRef.current) {
      throw new Error('Public client not available')
    }

    try {
      const receipt = await publicClientRef.current.waitForTransactionReceipt({ 
        hash,
        confirmations: 1 
      })
      return receipt
    } catch (err: any) {
      console.error('TransactionProvider: Failed to get receipt', err)
      throw new Error(err.message || 'Failed to get transaction receipt')
    }
  }

  const value: TransactionProviderContextType = {
    account: state?.connectedAddress as Address | null,
    chainId: state?.chainId || null,
    isConnected: state?.isConnected || false,
    sendTransaction,
    signMessage,
    waitForTransactionReceipt,
    publicClient: publicClientRef.current,
    isReady,
    error
  }

  return (
    <TransactionProviderContext.Provider value={value}>
      {children}
    </TransactionProviderContext.Provider>
  )
}

export function useTransactionProvider() {
  const context = useContext(TransactionProviderContext)
  if (!context) {
    throw new Error('useTransactionProvider must be used within a TransactionProvider')
  }
  return context
} 