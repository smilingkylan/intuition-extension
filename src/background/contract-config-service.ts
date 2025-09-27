import { createPublicClient, http, type Address } from 'viem'
import { multiCallIntuitionConfigs } from '@0xintuition/protocol'
import { intuitionTestnet } from '~/constants/intuitionTestnet'
import { INTUITION_TESTNET } from '~/constants/web3'

export interface ContractConfig {
  atom_cost: string
  formatted_atom_cost: string
  triple_cost: string
  formatted_triple_cost: string
  atom_wallet_initial_deposit_amount: string
  formatted_atom_wallet_initial_deposit_amount: string
  atom_creation_protocol_fee: string
  formatted_atom_creation_protocol_fee: string
  triple_creation_protocol_fee: string
  formatted_triple_creation_protocol_fee: string
  atom_deposit_fraction_on_triple_creation: string
  formatted_atom_deposit_fraction_on_triple_creation: string
  atom_deposit_fraction_for_triple: string
  formatted_atom_deposit_fraction_for_triple: string
  entry_fee: string
  formatted_entry_fee: string
  exit_fee: string
  formatted_exit_fee: string
  protocol_fee: string
  formatted_protocol_fee: string
  fee_denominator: string
  formatted_fee_denominator: string
  min_deposit: string
  formatted_min_deposit: string
}

export class ContractConfigService {
  private config: ContractConfig | null = null
  private publicClient = createPublicClient({
    chain: intuitionTestnet,
    transport: http()
  })
  
  async loadConfig() {
    try {
      console.log('[ContractConfig] Loading contract configuration...')
      
      // Fetch all config in one multicall
      this.config = await multiCallIntuitionConfigs({
        address: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
        publicClient: this.publicClient
      })
      
      console.log('[ContractConfig] Configuration loaded:', this.config)
      
      // Store in Chrome storage for sidepanel access
      await chrome.storage.local.set({
        contractConfig: this.config,
        configLastUpdated: Date.now()
      })
      
      console.log('[ContractConfig] Configuration stored in Chrome storage')
    } catch (error) {
      console.error('[ContractConfig] Failed to load configuration:', error)
    }
  }
  
  async getConfig(): Promise<ContractConfig | null> {
    if (this.config) {
      return this.config
    }
    
    // Try to load from storage
    const stored = await chrome.storage.local.get(['contractConfig'])
    if (stored.contractConfig) {
      this.config = stored.contractConfig
      return this.config
    }
    
    // Load fresh
    await this.loadConfig()
    return this.config
  }
  
  // Load on startup and refresh periodically
  async init() {
    await this.loadConfig()
    
    // Refresh every hour
    setInterval(() => this.loadConfig(), 3600000)
    
    // Also refresh on chain change messages
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CHAIN_CHANGED') {
        this.loadConfig()
      }
    })
  }
} 