// lib/storage.ts
export interface Web3State {
  connectedAddress: string | null
  chainId: number | null
  isConnected: boolean
  lastConnected: number | null
}

export class Web3Storage {
  private static STORAGE_KEY = 'web3_state'

  static async getState(): Promise<Web3State> {
    const result = await chrome.storage.local.get(this.STORAGE_KEY)
    return result[this.STORAGE_KEY] || {
      connectedAddress: null,
      chainId: null,
      isConnected: false,
      lastConnected: null
    }
  }

  static async setState(state: Partial<Web3State>): Promise<void> {
    const currentState = await this.getState()
    const newState = { ...currentState, ...state }
    await chrome.storage.local.set({ [this.STORAGE_KEY]: newState })
    
    // Broadcast state change to all contexts
    chrome.runtime.sendMessage({
      type: 'WEB3_STATE_CHANGED',
      data: newState
    })
  }

  static async clearState(): Promise<void> {
    await chrome.storage.local.remove(this.STORAGE_KEY)
    chrome.runtime.sendMessage({
      type: 'WEB3_STATE_CHANGED', 
      data: {
        connectedAddress: null,
        chainId: null,
        isConnected: false,
        lastConnected: null
      }
    })
  }
}