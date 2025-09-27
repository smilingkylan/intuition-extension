// background/index.ts
import { Web3Service } from './web3-service'
import { ContractConfigService } from './contract-config-service'

export class BackgroundService {
  private web3Service: Web3Service
  private contractConfigService: ContractConfigService

  constructor() {
    // Initialize the web3 service
    this.web3Service = new Web3Service()
    
    // Initialize the contract config service
    this.contractConfigService = new ContractConfigService()
    this.contractConfigService.init()
    
    // Listen for storage changes and broadcast to all contexts
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.web3_state) {
        this.broadcastToAllContexts({
          type: 'WEB3_STATE_CHANGED',
          data: changes.web3_state.newValue
        })
      }
    })
  }

  private broadcastToAllContexts(message: any) {
    // Send to all extension contexts (sidepanel, popup, content scripts)
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors if no listeners
    })

    // Send to all tabs with content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors if no content script
          })
        }
      })
    })
  }

  // Getter for web3Service (for use in message handlers)
  getWeb3Service() {
    console.log('background->index getting web3Service', this.web3Service)
    return this.web3Service
  }
  
  // Getter for contractConfigService
  getContractConfigService() {
    return this.contractConfigService
  }
}

// Initialize the background service when the background script loads
const backgroundService = new BackgroundService()

// Export for use in message handlers
export default backgroundService