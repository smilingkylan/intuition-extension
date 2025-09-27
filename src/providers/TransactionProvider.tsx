import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createExternalExtensionProvider } from '@metamask/providers'
import { createWalletClient, createPublicClient, custom, http, type WalletClient, type PublicClient, type Address, parseEther, type Hex } from 'viem'
import { Web3Storage, type Web3State } from '../lib/storage'
import { intuitionTestnet } from '~/constants/intuitionTestnet'
import type { ContractConfig } from '../background/contract-config-service'

interface TransactionProviderContextType {
  // State from background
  account: Address | null
  chainId: number | null
  isConnected: boolean
  
  // Clients
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  
  // Contract configuration
  contractConfig: ContractConfig | null
  
  // Transaction capabilities
  sendTransaction: (tx: any) => Promise<string>
  signMessage: (message: string) => Promise<string>
  waitForTransactionReceipt: (hash: Hex) => Promise<any>
  
  // Status
  isReady: boolean
  error: string | null
}

const TransactionProviderContext = createContext<TransactionProviderContextType | null>(null)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // State managed by background
  const [state, setState] = useState<Web3State | null>(null)
  const [contractConfig, setContractConfig] = useState<ContractConfig | null>(null)
  
  // Local provider just for transactions - use 'any' type to avoid type conflicts
  const providerRef = useRef<any>(null)
  const walletClientRef = useRef<WalletClient | null>(null)
  const publicClientRef = useRef<PublicClient | null>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load contract config from storage
  useEffect(() => {
    chrome.storage.local.get(['contractConfig'], (result) => {
      if (result.contractConfig) {
        setContractConfig(result.contractConfig)
      }
    })
    
    // Listen for config updates
    const handleStorageChange = (changes: any, namespace: string) => {
      if (namespace === 'local' && changes.contractConfig) {
        setContractConfig(changes.contractConfig.newValue)
      }
    }
    
    chrome.storage.onChanged.addListener(handleStorageChange)
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        // Always create public client
        const publicClient = createPublicClient({
          chain: intuitionTestnet,
          transport: http()
        })
        publicClientRef.current = publicClient
        
        // 1. Get state from background storage
        const savedState = await Web3Storage.getState()
        setState(savedState)

        // 2. Only create wallet client if connected
        if (savedState.isConnected && savedState.connectedAddress && savedState.chainId) {
          console.log('TransactionProvider: Creating provider for connected wallet', savedState)
          
          // Create provider instance (but don't connect - just for signing)
          const provider = createExternalExtensionProvider()
          providerRef.current = provider

          // Verify the provider has access to the account
          const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
          
          if (accounts && accounts.includes(savedState.connectedAddress)) {
            // Create wallet client with the connected account
            const walletClient = createWalletClient({
              account: savedState.connectedAddress as Address,
              chain: intuitionTestnet,
              transport: custom(provider)
            })
            
            walletClientRef.current = walletClient
            setIsReady(true)
            setError(null)
          } else {
            walletClientRef.current = null
            setIsReady(false)
            setError('Wallet account not available')
          }
        } else {
          walletClientRef.current = null
          setIsReady(false)
        }
      } catch (err: any) {
        console.error('TransactionProvider init error:', err)
        setError(err.message)
        setIsReady(false)
      }
    }

    init()
  }, [])

  // Listen for state changes from background
  useEffect(() => {
    const handleStorageChange = (changes: any, namespace: string) => {
      if (namespace === 'local' && changes.web3_state) {
        const newState = changes.web3_state.newValue as Web3State
        setState(newState)
        
        // Recreate clients if connection status changed
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
      // This will trigger MetaMask popup directly
      const hash = await walletClientRef.current.sendTransaction(tx)
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
  
  const waitForTransactionReceipt = async (hash: Hex) => {
    if (!publicClientRef.current) {
      throw new Error('Public client not available')
    }
    
    return await publicClientRef.current.waitForTransactionReceipt({ hash })
  }

  const value: TransactionProviderContextType = {
    account: state?.connectedAddress as Address | null,
    chainId: state?.chainId || null,
    isConnected: state?.isConnected || false,
    publicClient: publicClientRef.current,
    walletClient: walletClientRef.current,
    contractConfig,
    sendTransaction,
    signMessage,
    waitForTransactionReceipt,
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