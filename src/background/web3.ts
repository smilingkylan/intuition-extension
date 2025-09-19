import { Web3Storage } from '../lib/storage'

class Web3Service {
  private publicClient: PublicClient
  private walletClient: WalletClient | null = null
  private contractAddress: Address
  private currentState: Web3State

  constructor() {
    this.initializeFromStorage()
  }

  private async initializeFromStorage() {
    this.currentState = await Web3Storage.getState()
    
    // Auto-reconnect if we have a previous connection
    if (this.currentState.isConnected && this.currentState.connectedAddress) {
      try {
        await this.reconnectWallet()
      } catch (error) {
        console.log('Auto-reconnect failed:', error)
        await this.disconnect()
      }
    }
  }

  async connectWallet(account: Address, chainId: number) {
    try {
      await this.initializeClients(chainId)
      
      this.walletClient = createWalletClient({
        account,
        chain: this.publicClient.chain,
        transport: window.ethereum ? custom(window.ethereum) : http()
      })

      // Test the connection
      const connectedAccount = await this.walletClient.getAddresses()
      
      if (connectedAccount[0] !== account) {
        throw new Error('Account mismatch')
      }

      // Persist successful connection
      await Web3Storage.setState({
        connectedAddress: account,
        chainId,
        isConnected: true,
        lastConnected: Date.now()
      })

      this.currentState = await Web3Storage.getState()
      
      return { success: true, address: account, chainId }
    } catch (error) {
      await this.disconnect()
      throw error
    }
  }

  async disconnect() {
    this.walletClient = null
    await Web3Storage.clearState()
    this.currentState = await Web3Storage.getState()
  }

  async getConnectionState(): Promise<Web3State> {
    return Web3Storage.getState()
  }

  private async reconnectWallet() {
    const state = await Web3Storage.getState()
    if (!state.connectedAddress || !state.chainId) {
      throw new Error('No previous connection found')
    }

    // Check if wallet is still available and has the same account
    if (!window.ethereum) {
      throw new Error('No ethereum provider')
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    })
    
    if (!accounts.includes(state.connectedAddress)) {
      throw new Error('Account no longer available')
    }

    await this.connectWallet(state.connectedAddress, state.chainId)
  }
}