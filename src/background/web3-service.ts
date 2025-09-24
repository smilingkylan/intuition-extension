import { createExternalExtensionProvider } from '@metamask/providers'
import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  type Hex,
  fromHex,
  toHex,
} from 'viem'
import { Web3Storage, type Web3State } from '../lib/storage'
import { CONFIG } from '~/constants/web3'
import { uploadJSONToIPFS } from '~/util/fetch'
import { eventParseAtomCreated } from '@0xintuition/protocol'

export class Web3Service {
  private provider: any = null
  private publicClient: PublicClient | null = null
  private walletClient: WalletClient | null = null
  private currentState: Web3State
  private isAuthenticated: boolean = false

  constructor() {
    this.currentState = {
      isConnected: false,
      connectedAddress: null,
      chainId: null,
      lastConnected: null
    }
    console.log('Web3Service constructor - provider NOT created yet')
    // Try to restore connection eagerly if user was previously connected
    this.connectEagerly()
  }

  // Lazy provider initialization - only create when needed
  private getProvider() {
    if (!this.provider) {
      console.log('Creating external provider with stable parameter...')
      this.provider = createExternalExtensionProvider('stable')
      this.subscribeToEvents(this.provider)
    }
    return this.provider
  }

  private subscribeToEvents(provider: any) {
    if (provider && provider.on) {
      console.log('Subscribing to provider events...')
      provider.on('accountsChanged', this.handleAccountsChanged.bind(this))
      provider.on('chainChanged', this.handleChainChanged.bind(this))
      provider.on('connect', this.handleConnect.bind(this))
      provider.on('disconnect', this.handleDisconnect.bind(this))
    }
  }

  private unsubscribeFromEvents(provider: any) {
    if (provider && provider.removeListener) {
      console.log('Unsubscribing from provider events...')
      provider.removeListener('accountsChanged', this.handleAccountsChanged)
      provider.removeListener('chainChanged', this.handleChainChanged)
      provider.removeListener('connect', this.handleConnect)
      provider.removeListener('disconnect', this.handleDisconnect)
    }
  }

  private async connectEagerly() {
    console.log('Checking for eager connection...')
    const state = await Web3Storage.getState()
    if (state.isConnected && state.connectedAddress) {
      console.log('Found previous connection, attempting to restore...')
      try {
        await this.connectWallet(state.connectedAddress, state.chainId!)
      } catch (error) {
        console.log('Eager connection failed:', error)
        await this.disconnect()
      }
    }
  }

  private async getAccounts(provider: any): Promise<[string[], string] | false> {
    if (provider) {
      try {
        const [accounts, chainId] = await Promise.all([
          provider.request({ method: 'eth_requestAccounts' }),
          provider.request({ method: 'eth_chainId' })
        ])
        return [accounts, chainId]
      } catch (error) {
        console.error('Failed to get accounts:', error)
        return false
      }
    }
    return false
  }

  private handleAccountsChanged = (accounts: string[]) => {
    console.log('Accounts changed:', accounts)
    if (accounts.length === 0) {
      this.disconnect()
    } else {
      // Update current account
      const newAccount = accounts[0].toLowerCase()
      if (this.currentState.connectedAddress?.toLowerCase() !== newAccount) {
        Web3Storage.setState({
          connectedAddress: newAccount as Address
        })
      }
    }
  }

  private handleChainChanged = (chainId: string) => {
    console.log('Chain changed:', chainId)
    const numericChainId = parseInt(chainId, 16)
    Web3Storage.setState({
      chainId: numericChainId
    })
    // Reinitialize clients with new chain
    if (this.currentState.connectedAddress) {
      this.setContract(chainId)
    }
  }

  private handleConnect = () => {
    console.log('Provider connected')
    this.isAuthenticated = true
  }

  private handleDisconnect = () => {
    console.log('Provider disconnected')
    this.disconnect()
  }

  async connectWallet(account?: Address, chainId?: number) {
    console.log('connectWallet called with:', { account, chainId })
    
    try {
      const provider = this.getProvider()
      console.log('Got provider:', !!provider)

      let accounts: string[]
      let currentChainId: string

      if (account && chainId) {
        // Use provided account and chain (for reconnection)
        console.log('Using provided credentials for reconnection')
        accounts = [account]
        currentChainId = `0x${chainId.toString(16)}`
      } else {
        // Request new connection
        console.log('Requesting new connection...')
        const result = await this.getAccounts(provider)
        if (!result) {
          throw new Error('Failed to get accounts from MetaMask')
        }
        [accounts, currentChainId] = result
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet in MetaMask.')
      }

      const connectedAccount = accounts[0] as Address
      const numericChainId = parseInt(currentChainId, 16)
      
      console.log('Setting up clients for:', { connectedAccount, numericChainId })

      // Set contract and clients
      await this.setContract(currentChainId, connectedAccount)

      // Save state
      await Web3Storage.setState({
        connectedAddress: connectedAccount,
        chainId: numericChainId,
        isConnected: true,
        lastConnected: Date.now()
      })

      this.currentState = await Web3Storage.getState()
      this.isAuthenticated = true

      console.log('Wallet connected successfully')
      return { success: true, address: connectedAccount, chainId: numericChainId }

    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      await this.disconnect()
      
      // Provide better error messages
      if (error.code === 4001) {
        throw new Error('User rejected the connection request')
      }
      if (error.code === -32002) {
        throw new Error('Please unlock MetaMask')
      }
      if (error.message?.includes('MetaMask')) {
        throw error
      }
      
      throw new Error('Failed to connect to MetaMask: ' + (error.message || 'Unknown error'))
    }
  }

  async disconnect() {
    console.log('Disconnecting wallet...')
    
    // Unsubscribe from events
    if (this.provider) {
      this.unsubscribeFromEvents(this.provider)
    }
    
    this.walletClient = null
    this.publicClient = null
    this.isAuthenticated = false
    
    await Web3Storage.clearState()
    this.currentState = await Web3Storage.getState()
  }

  private async setContract(chainId: string, account?: Address) {
    console.log('Setting contract for chainId:', chainId, 'account:', account)
    
    const chain = this.getChainById(parseInt(chainId, 16))
    const provider = this.getProvider()
    
    // Create public client
    this.publicClient = createPublicClient({
      chain,
      transport: http()
    })

    // Create wallet client if we have an account
    if (account || this.currentState.connectedAddress) {
      this.walletClient = createWalletClient({
        chain,
        account: account || this.currentState.connectedAddress!,
        transport: custom(provider)
      })
    }

    console.log('Clients created:', { 
      publicClient: !!this.publicClient, 
      walletClient: !!this.walletClient 
    })
  }

  async getConnectionState(): Promise<Web3State> {
    return Web3Storage.getState()
  }

  private getChainById(chainId: number) {
    switch (chainId) {
      case 13579:
        // This is likely a local testnet or custom chain
        // For now, we'll treat it as sepolia (testnet)
        console.log(`Using sepolia config for chain ID: ${chainId}`)
        return CONFIG.CHAIN_CONFIG
      default:
        console.warn(`Unknown chain ID: ${chainId}, defaulting to mainnet`)
        return CONFIG.CHAIN_CONFIG
    }
  }

  // Protocol methods - to be implemented
  async createAtoms(data: Hex[], assets: string[], value: string) {
    if (!this.walletClient || !this.publicClient) {
      throw new Error('Wallet not connected')
    }

    const account = this.currentState.connectedAddress as Address
    const chainId = this.currentState.chainId
    
    if (!account || !chainId) {
      throw new Error('No account or chain ID available')
    }

    try {
      console.log('Creating atoms with params:', { data, assets, value })

      // Process data - upload JSON to IPFS if needed
      const processedData = await Promise.all(data.map(async (item) => {
        try {
          const jsonStr = fromHex(item, 'string')
          const jsonData = JSON.parse(jsonStr)
          
          console.log('Uploading to IPFS:', jsonData)
          const [fileData] = await uploadJSONToIPFS([jsonData])
          const ipfsUri = `ipfs://${fileData.IpfsHash}`
          
          return toHex(ipfsUri)
        } catch {
          // If not JSON, assume it's already a URI or other data
          return item
        }
      }))

      // Execute the transaction directly
      console.log('Executing createAtoms transaction...')
      const txHash = await this.walletClient.writeContract({
        account,
        address: CONFIG.I8N_CONTRACT_ADDRESS as Address,
        abi: CONFIG.CONTRACT_ABI,
        functionName: 'createAtoms',
        args: [processedData, processedAssets],
        value: processedValue,
      })
      
      console.log('Transaction sent:', txHash)

      // Wait for transaction receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      })

      console.log('Transaction confirmed:', receipt)

      // Parse the event to get atom IDs
      const [event] = await eventParseAtomCreated(this.publicClient, txHash)
      const atomId = event.args.atomId || event.args.termId // Handle both possible field names

      return {
        success: true,
        transactionHash: txHash,
        atomId: atomId?.toString(),
        event,
        receipt
      }
    } catch (error: any) {
      console.error('Failed to create atoms:', error)
      
      // Parse errors for more helpful messages
      let errorMessage = error.message || 'Unknown error'
      if (error.shortMessage) {
        errorMessage = error.shortMessage
      }
      
      // Check for common errors
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user'
      }
      
      throw new Error(errorMessage)
    }
  }

  // Getters
  getPublicClient() {
    return this.publicClient
  }

  getWalletClient() {
    return this.walletClient
  }

  isConnected() {
    return this.isAuthenticated && this.walletClient !== null
  }

  getWalletData() {
    // Return serializable data only
    return {
      isAuthenticated: this.isAuthenticated,
      account: this.currentState.connectedAddress,
      chainId: this.currentState.chainId,
      isConnected: this.currentState.isConnected
    }
  }
}