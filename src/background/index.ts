// background/index.ts
import { Web3Service } from './web3-service'
import { ContractConfigService } from './contract-config-service'
import { AtomTrackingService } from './atom-tracking-service'
import { isAtomQueryMessage, isUrlDataMessage, isAddressDetectedMessage, isSocialAtomDetectedMessage } from '../types/messages'

export class BackgroundService {
  private web3Service: Web3Service
  private contractConfigService: ContractConfigService
  private atomTrackingService: AtomTrackingService

  constructor() {
    // Initialize the web3 service
    this.web3Service = new Web3Service()
    
    // Initialize the contract config service
    this.contractConfigService = new ContractConfigService()
    this.contractConfigService.init()
    
    // Initialize the atom tracking service
    this.atomTrackingService = new AtomTrackingService()
    
    // Listen for storage changes and broadcast to all contexts
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.web3_state) {
        this.broadcastToAllContexts({
          type: 'WEB3_STATE_CHANGED',
          data: changes.web3_state.newValue
        })
      }
    })

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const tabId = sender.tab?.id
      
      // Handle URL detection for badge counting
      if (isUrlDataMessage(message) && tabId !== undefined) {
        console.log('[Background] URL detected:', message.data)
        this.atomTrackingService.handleUrlDetection(tabId, message.data)
        
        // Still forward to sidepanel if open
        this.forwardToSidepanel(message)
      }
      
      // Handle address detection for badge counting
      else if (isAddressDetectedMessage(message) && tabId !== undefined) {
        console.log('[Background] Address detected:', message.data)
        this.atomTrackingService.handleAddressDetection(tabId, message.data)
        
        // Still forward to sidepanel if open
        this.forwardToSidepanel(message)
      }
      
      // Handle social atom detection (new message type)
      else if (isSocialAtomDetectedMessage(message) && tabId !== undefined) {
        console.log('[Background] Social atom detected:', message.data)
        this.atomTrackingService.handleSocialDetection(tabId, message.data)
        
        // Forward to sidepanel if open
        this.forwardToSidepanel(message)
      }
      
      // Handle atom queries (existing functionality)
      else if (isAtomQueryMessage(message)) {
        console.log('[Background] Received atom query:', message.data)
        this.forwardToSidepanel(message)
      }
      
      // Handle request for tab atoms from sidepanel
      else if (message.type === 'GET_TAB_ATOMS' && message.tabId) {
        const atoms = this.atomTrackingService.getTabAtoms(message.tabId)
        sendResponse({ atoms })
        return true // Will send response asynchronously
      }
      
      // Return true to indicate we might send a response asynchronously
      return true
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
    return this.web3Service
  }
  
  // Getter for contractConfigService
  getContractConfigService() {
    return this.contractConfigService
  }
  
  // Getter for atomTrackingService
  getAtomTrackingService() {
    return this.atomTrackingService
  }
  
  // Helper to forward messages to sidepanel
  private forwardToSidepanel(message: any) {
    chrome.runtime.sendMessage(message).catch(error => {
      // Sidepanel might not be open, that's okay
      console.debug('[Background] Could not forward to sidepanel:', error.message)
    })
  }
}

// Initialize the background service when the background script loads
const backgroundService = new BackgroundService()

// Export for use in message handlers
export default backgroundService