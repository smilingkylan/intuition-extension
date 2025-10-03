import { createWalletClient, http, parseEther, toHex, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createAtoms, eventParseAtomCreated } from '@0xintuition/protocol'
import { uploadJSONToIPFS } from '~/util/fetch'
import { CONFIG } from '~/constants'

// SECURITY WARNING: This is for development only. Never hardcode private keys in production!
const PRIVATE_KEY = '0xc1aaa4a40720ca39bd3af71c4cd92f4b59edbc4cb8002c01571e7affa1068587' // Add your private key here (with 0x prefix)
const DEFAULT_STAKE_AMOUNT = parseEther('0.002') // 0.001 ETH

const { ETH_RPC_URL, CHAIN_CONFIG, I8N_CONTRACT_ADDRESS } = CONFIG

interface AtomMetadata {
  '@context': string
  '@type': string
  name: string
  // description?: string
  // image?: string
  // url?: string
  // platform?: string
  // username?: string
  // createdAt?: string
}

interface PendingAtomCreation {
  username: string
  status: 'pending' | 'uploading' | 'creating' | 'completed' | 'failed'
  ipfsHash?: string
  atomVaultId?: string
  transactionHash?: string
  error?: string
}

export class AtomCreatorService {
  private account
  private walletClient
  private publicClient
  private config  // Add config property
  private pendingCreations: Map<string, PendingAtomCreation> = new Map()
  
  constructor() {
    if (!PRIVATE_KEY) {
      console.error('AtomCreatorService: Private key not configured')
      return
    }

    this.account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
    
    this.walletClient = createWalletClient({
      account: this.account,
      chain: CHAIN_CONFIG,
      transport: http(ETH_RPC_URL)
    })

    this.publicClient = createPublicClient({
      chain: CHAIN_CONFIG,
      transport: http(ETH_RPC_URL)
    })

    // Create the config object for createAtoms
    this.config = {
      address: CONFIG.I8N_CONTRACT_ADDRESS,
      abi: CONFIG.CONTRACT_ABI,
      walletClient: this.walletClient,
      publicClient: this.publicClient,
    }

    console.log('AtomCreatorService initialized with account:', this.account.address)
  }

  /**
   * Process multiple Twitter usernames in parallel
   */
  async processTwitterUsernames(usernames: string[]): Promise<void> {
    // Filter out usernames that are already being processed
    const newUsernames = usernames.filter(username => 
      !this.pendingCreations.has(username) || 
      this.pendingCreations.get(username)?.status === 'failed'
    )

    if (newUsernames.length === 0) {
      return
    }


    // Process all usernames in parallel
    await Promise.allSettled(
      newUsernames.map(username => this.processTwitterUsername(username))
    )
  }

  /**
   * Process a single Twitter username to create an atom
   */
  private async processTwitterUsername(username: string): Promise<void> {
    // Check if private key is configured
    if (!this.account || !this.config) {
      console.warn('AtomCreatorService: Cannot process - service not properly configured')
      return
    }

    // Initialize pending creation
    this.pendingCreations.set(username, {
      username,
      status: 'pending'
    })

    try {
      this.updateStatus(username, 'uploading')

      // 1. Create metadata for IPFS
      const atomJSON: AtomMetadata = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: `x.com:${username}` // should be user ID
      }

      // 2. Upload to IPFS
      const [fileData] = await uploadJSONToIPFS([atomJSON])
      console.log('fileData', fileData)
      const ipfsHash = fileData.IpfsHash

      this.pendingCreations.get(username)!.ipfsHash = ipfsHash
      this.updateStatus(username, 'creating')

      // 3. Create atom with IPFS hash
      const uri = `ipfs://${ipfsHash}`
      console.log('uri', uri)
      // Use the config object with createAtoms
      const transactionHash = await createAtoms(this.config, {
        args: [
          [toHex(uri)],
          [DEFAULT_STAKE_AMOUNT],
        ],
        value: DEFAULT_STAKE_AMOUNT,
      })

      console.log('Transaction sent:', transactionHash)

      // 4. Parse the event to get atomVaultId
      const [event] = await eventParseAtomCreated(this.publicClient, transactionHash)
      
      const atomVaultId = event.args.termId
      console.log('Atom created with vault ID:', atomVaultId)

      // 5. Update status
      this.pendingCreations.get(username)!.atomVaultId = atomVaultId
      this.pendingCreations.get(username)!.transactionHash = transactionHash
      this.updateStatus(username, 'completed')

      // Send success notification
      chrome.runtime.sendMessage({
        type: 'ATOM_CREATED',
        data: {
          username,
          atomVaultId,
          transactionHash,
          ipfsHash,
          uri
        }
      }).catch(() => {})

    } catch (error: any) {
      console.error(`Failed to process ${username}:`, error)
      
      this.pendingCreations.get(username)!.error = error.message || 'Unknown error'
      this.updateStatus(username, 'failed')
      
      // Send error notification
      chrome.runtime.sendMessage({
        type: 'ATOM_CREATION_FAILED',
        data: {
          username,
          error: error.message || 'Unknown error'
        }
      }).catch(() => {})
    }
  }

  private updateStatus(username: string, status: PendingAtomCreation['status']) {
    const creation = this.pendingCreations.get(username)
    if (creation) {
      creation.status = status
      
      // Send status update
      chrome.runtime.sendMessage({
        type: 'ATOM_CREATION_STATUS',
        data: {
          username,
          status,
          ...creation
        }
      }).catch(() => {})
    }
  }

  /**
   * Get the status of all pending creations
   */
  getPendingCreations(): PendingAtomCreation[] {
    return Array.from(this.pendingCreations.values())
  }

  /**
   * Clear completed or failed creations
   */
  clearCompleted(): void {
    for (const [username, creation] of this.pendingCreations.entries()) {
      if (creation.status === 'completed' || creation.status === 'failed') {
        this.pendingCreations.delete(username)
      }
    }
  }
}

// Create singleton instance
let atomCreatorInstance: AtomCreatorService | null = null

export function getAtomCreatorService(): AtomCreatorService {
  if (!atomCreatorInstance) {
    atomCreatorInstance = new AtomCreatorService()
  }
  return atomCreatorInstance
}
