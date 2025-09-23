import { createExternalExtensionProvider } from '@metamask/providers'
import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain,
  parseEther,
  toHex,
  encodeFunctionData,
  parseEventLogs
} from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { Web3Storage, type Web3State } from '../lib/storage'
import { intuitionTestnet } from '~/constants/intuitionTestnet'
import { 
  createAtomsEncode,
  createTriplesEncode,
  eventParseAtomCreated,
  getAtomCost 
} from '@0xintuition/protocol'
import { INTUITION_TESTNET } from '../../common/constants/web3'

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
      console.log('🚀 Creating new MetaMask provider')
      this.provider = createExternalExtensionProvider()
      
      // Add debug log
      console.log('📌 Attaching event listeners to provider...')
      
      // Attach event listeners once when provider is created
      this.provider.on('accountsChanged', this.handleAccountsChanged)
      this.provider.on('chainChanged', this.handleChainChanged.bind(this))
      this.provider.on('connect', this.handleConnect)
      this.provider.on('disconnect', this.handleDisconnect)
      
      // Add debug to verify listeners attached
      console.log('✅ Event listeners attached, provider._events:', this.provider._events)
      
      // Test current chain
      this.provider.request({ method: 'eth_chainId' })
        .then((chainId: string) => console.log('📊 Current chainId:', chainId))
        .catch((err: any) => console.error('❌ Failed to get chainId:', err))
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
        const now = Date.now()
        Web3Storage.setState({
          connectedAddress: newAccount as Address,
          lastChanged: now
        })
        
        // Send notification to UI
        chrome.runtime.sendMessage({
          type: 'ACCOUNT_CHANGED_NOTIFICATION',
          data: { 
            newAccount: newAccount,
            timestamp: now
          }
        }).catch(err => {
          // Ignore errors from no listeners
          console.log('No listeners for account change notification')
        })
      }
    }
  }

  // need to find out whether we were ever able to show chain switching
  // or account switching

  private handleChainChanged = (chainId: string) => {
    console.log('🔄 handleChainChanged called with:', chainId)
    console.log('🔄 Type of chainId:', typeof chainId)
    console.log('🔄 this.currentState before update:', this.currentState)
    
    const numericChainId = parseInt(chainId, 16)
    console.log('🔄 Parsed numeric chainId:', numericChainId)
    
    const now = Date.now()
    
    // Update state
    Web3Storage.setState({
      chainId: numericChainId,
      lastChanged: now
    }).then(() => {
      console.log('✅ Storage updated with new chainId')
    }).catch(err => {
      console.error('❌ Failed to update storage:', err)
    })
    
    // Send notification to UI
    chrome.runtime.sendMessage({
      type: 'CHAIN_CHANGED_NOTIFICATION', 
      data: {
        chainId: numericChainId,
        chainName: this.getNetworkName(numericChainId),
        timestamp: now
      }
    }).catch(err => {
      // Ignore errors from no listeners
      console.log('No listeners for chain change notification')
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

      // Check if we're on the correct chain (Intuition Testnet)
      const numericChainId = parseInt(currentChainId, 16)
      if (numericChainId !== 13579) {
        console.log(`⚠️ Wrong chain detected: ${numericChainId}. Switching to Intuition Testnet...`)
        try {
          await this.checkAndSwitchToCorrectChain()
          // Update chain ID after switching
          currentChainId = '0x350B'
        } catch (switchError: any) {
          // If user rejects the switch, we continue but warn them
          console.warn('User rejected network switch:', switchError)
          // Don't throw here - let them connect on wrong network but show warning in UI
        }
      }

      const connectedAccount = accounts[0] as Address
      const finalChainId = parseInt(currentChainId, 16)
      
      console.log('Setting up clients for:', { connectedAccount, chainId: finalChainId })

      // Set contract and clients
      await this.setContract(currentChainId, connectedAccount)

      // Save state
      await Web3Storage.setState({
        connectedAddress: connectedAccount,
        chainId: finalChainId,
        isConnected: true,
        lastConnected: Date.now()
      })

      this.currentState = await Web3Storage.getState()
      this.isAuthenticated = true

      console.log('Wallet connected successfully')
      return { success: true, address: connectedAccount, chainId: finalChainId }

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

  private getChainById(chainId: number): typeof mainnet | typeof sepolia {
    switch (chainId) {
      case 13579:
        return intuitionTestnet
      default:
        console.warn(`Unknown chain ID: ${chainId}, defaulting to mainnet`)
        return mainnet
    }
  }

  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 13579:
        return 'Intuition Testnet'
      default:
        return `Chain ${chainId}`
    }
  }

  async switchToIntuitionTestnet() {
    const provider = this.getProvider()
    const chainIdHex = '0x350B' // 13579 in hex
    
    try {
      console.log('Attempting to switch to Intuition Testnet...')
      // Try to switch to the network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      })
      console.log('✅ Switched to Intuition Testnet')
      return true
    } catch (error: any) {
      console.error('Switch network error:', error)
      // If network doesn't exist (error 4902), add it first
      if (error.code === 4902) {
        console.log('📡 Network not found, adding Intuition Testnet...')
        return await this.addIntuitionTestnetToWallet()
      } else {
        throw new Error(`Failed to switch network: ${error.message || 'Unknown error'}`)
      }
    }
  }

  async addIntuitionTestnetToWallet() {
    const provider = this.getProvider()
    
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x350B', // 13579 in hex
          chainName: 'Intuition Testnet',
          nativeCurrency: {
            name: 'Testnet TRUST',
            symbol: 'tTRUST',
            decimals: 18
          },
          rpcUrls: ['https://testnet.rpc.intuition.systems'],
          blockExplorerUrls: ['https://testnet.explorer.intuition.systems/']
        }]
      })
      console.log('✅ Intuition Testnet added to wallet')
      return true
    } catch (error: any) {
      console.error('❌ Failed to add network:', error)
      if (error.code === 4001) {
        throw new Error('User rejected adding Intuition Testnet')
      }
      throw new Error('Failed to add Intuition Testnet to your wallet')
    }
  }

  async checkAndSwitchToCorrectChain() {
    try {
      const currentChain = await this.getProvider().request({ method: 'eth_chainId' })
      const targetChainHex = '0x350B' // Intuition Testnet
      
      console.log(`Current chain: ${currentChain}, Target chain: ${targetChainHex}`)
      
      if (currentChain !== targetChainHex) {
        console.log(`🔄 Wrong network detected. Switching to Intuition Testnet...`)
        return await this.switchToIntuitionTestnet()
      }
      
      console.log('✅ Already on correct chain')
      return true
    } catch (error: any) {
      console.error('Failed to check/switch chain:', error)
      throw error
    }
  }

  // Protocol methods
  async createAtoms(params: {
    atoms: Array<{ data: string; initialDeposit: string }>
  }) {
    if (!this.walletClient || !this.publicClient) {
      throw new Error('Wallet not connected')
    }

    console.log('Creating atoms:', params.atoms)

    try {
      // Prepare atoms for creation
      const atomsToCreate = params.atoms.map(atom => ({
        data: atom.data, // Should already be hex-encoded (e.g., ipfs://...)
        initialDeposit: parseEther(atom.initialDeposit)
      }))

      // Calculate total value needed
      let totalValue = BigInt(0)
      for (const atom of atomsToCreate) {
        // Get atom creation cost
        const atomCost = await this.publicClient.readContract({
          address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          abi: INTUITION_TESTNET.CONTRACT_ABI,
          functionName: 'getAtomCost',
          args: []
        }) as bigint
        
        console.log('Atom cost:', atomCost.toString(), 'Initial deposit:', atom.initialDeposit.toString())
        totalValue += atom.initialDeposit + atomCost
      }

      console.log('Total value needed:', totalValue.toString())

      // Use the pre-built encoder to avoid dynamic imports
      const encodedData = createAtomsEncode(
        atomsToCreate.map(atom => toHex(atom.data)), // Array of hex-encoded data
        atomsToCreate.map(atom => atom.initialDeposit) // Array of initial deposits
      )

      // Send raw transaction (no simulation needed)
      const txHash = await this.walletClient.sendTransaction({
        to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        data: encodedData,
        value: totalValue,
        chain: this.walletClient.chain,
        account: this.walletClient.account!,
      })

      console.log('Create atoms transaction hash:', txHash)

      // Wait for confirmation and parse events
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1 
      })

      // Parse the created atom IDs from events
      const atomIds: string[] = []
      const parsedLogs = parseEventLogs({
        abi: INTUITION_TESTNET.CONTRACT_ABI,
        logs: receipt.logs,
        eventName: 'AtomCreated'
      })

      for (const log of parsedLogs) {
        if (log.eventName === 'AtomCreated' && log.args) {
          const atomId = (log.args as any).atomId || (log.args as any).atom?.atomId
          if (atomId) {
            atomIds.push(atomId.toString())
          }
        }
      }

      console.log('Created atom IDs:', atomIds)

      return {
        transactionHash: txHash,
        atomIds,
        receipt
      }
    } catch (error: any) {
      console.error('Create atoms failed:', error)
      
      // Provide better error messages
      if (error.code === 4001) {
        throw new Error('User rejected the transaction')
      }
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction')
      }
      
      throw new Error(`Failed to create atoms: ${error.message || 'Unknown error'}`)
    }
  }

  // Create triples (relationships between atoms)
  async createTriples(params: {
    triples: Array<{
      subjectId: string
      predicateId: string
      objectId: string
      initialDeposit: string
    }>
  }) {
    if (!this.walletClient || !this.publicClient) {
      throw new Error('Wallet not connected')
    }

    console.log('Creating triples:', params.triples)

    try {
      // Prepare triples for creation
      const triplesToCreate = params.triples.map(triple => ({
        subjectId: BigInt(triple.subjectId),
        predicateId: BigInt(triple.predicateId),
        objectId: BigInt(triple.objectId),
        initialDeposit: parseEther(triple.initialDeposit)
      }))

      // Calculate total value needed
      let totalValue = BigInt(0)
      for (const triple of triplesToCreate) {
        // For triples, we just need the initial deposit
        totalValue += triple.initialDeposit
      }

      console.log('Total value needed for triples:', totalValue.toString())

      // Use the pre-built encoder to avoid dynamic imports
      const encodedData = createTriplesEncode(
        triplesToCreate.map(t => toHex(t.subjectId.toString())), // Convert to hex
        triplesToCreate.map(t => toHex(t.predicateId.toString())), // Convert to hex
        triplesToCreate.map(t => toHex(t.objectId.toString())), // Convert to hex
        triplesToCreate.map(t => t.initialDeposit)
      )

      // Send raw transaction (no simulation needed)
      const txHash = await this.walletClient.sendTransaction({
        to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        data: encodedData,
        value: totalValue,
        chain: this.walletClient.chain,
        account: this.walletClient.account!,
      })

      console.log('Create triples transaction hash:', txHash)

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: txHash,
        confirmations: 1 
      })

      return {
        transactionHash: txHash,
        receipt
      }
    } catch (error: any) {
      console.error('Create triples failed:', error)
      
      // Provide better error messages
      if (error.code === 4001) {
        throw new Error('User rejected the transaction')
      }
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction')
      }
      
      throw new Error(`Failed to create triples: ${error.message || 'Unknown error'}`)
    }
  }

  // Send native token transaction
  async sendTransaction(to: Address, value: string) {
    if (!this.walletClient || !this.publicClient) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert string value to bigint
      const valueInWei = BigInt(value)
      console.log('Sending transaction:', { to, value: valueInWei })
      
      // Send the transaction
      const hash = await this.walletClient.sendTransaction({
        to,
        value: valueInWei,
        chain: this.walletClient.chain,
        account: this.walletClient.account!,
      })
      
      console.log('Transaction sent:', hash)
      
      // Wait for the transaction to be mined
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        confirmations: 1 
      })
      
      console.log('Transaction confirmed:', receipt)
      return { hash, receipt }
    } catch (error: any) {
      console.error('Transaction failed:', error)
      
      // Provide better error messages
      if (error.code === 4001) {
        throw new Error('User rejected the transaction')
      }
      if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for transaction')
      }
      
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`)
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