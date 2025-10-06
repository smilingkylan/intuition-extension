import { AtomSearchClient } from '../lib/atom-queue/atom-search-queries'
import type { AtomMatch, AtomQuery } from '../lib/atom-queue/types'

export interface TrackedAtom {
  query: string
  type: 'url' | 'address' | 'social'
  detectedAt: number
  matches?: AtomMatch[]
  metadata?: any
}

export interface TabAtomData {
  atoms: Map<string, TrackedAtom>
  count: number
  lastUpdated: number
}

/**
 * Service that tracks detected atoms per tab and manages badge counts
 */
export class AtomTrackingService {
  private tabData: Map<number, TabAtomData> = new Map()
  private atomSearchClient: AtomSearchClient
  
  constructor() {
    this.atomSearchClient = new AtomSearchClient()
    this.setupTabListeners()
  }
  
  /**
   * Set up listeners for tab events
   */
  private setupTabListeners() {
    // Reset count when tab navigates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === 'loading') {
        this.clearTabData(tabId)
        this.updateBadge(tabId, 0)
      }
    })
    
    // Cleanup when tab closes
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.tabData.delete(tabId)
    })
    
    // Clear badge when tab becomes active (optional UX choice)
    chrome.tabs.onActivated.addListener((activeInfo) => {
      // Could refresh badge here if needed
      const data = this.tabData.get(activeInfo.tabId)
      if (data) {
        this.updateBadge(activeInfo.tabId, data.count)
      }
    })
  }
  
  /**
   * Track a detected atom for a specific tab
   */
  trackAtom(tabId: number, atom: TrackedAtom): boolean {
    if (!this.tabData.has(tabId)) {
      this.tabData.set(tabId, {
        atoms: new Map(),
        count: 0,
        lastUpdated: Date.now()
      })
    }
    
    const tabData = this.tabData.get(tabId)!
    
    // Check if we already tracked this atom (deduplication)
    if (tabData.atoms.has(atom.query)) {
      return false // Already tracked
    }
    
    // Add the atom
    tabData.atoms.set(atom.query, atom)
    tabData.count = tabData.atoms.size
    tabData.lastUpdated = Date.now()
    
    // Update badge
    this.updateBadge(tabId, tabData.count)
    
    // Optionally pre-fetch atom data in background
    this.prefetchAtomData(atom.query).catch(error => {
      console.error('[AtomTrackingService] Error prefetching atom:', error)
    })
    
    return true
  }
  
  /**
   * Update the badge text for a tab
   */
  private updateBadge(tabId: number, count: number) {
    if (count === 0) {
      // Clear badge when no atoms
      chrome.action.setBadgeText({ tabId, text: '' })
    } else {
      // Show count
      chrome.action.setBadgeText({ tabId, text: count.toString() })
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#4ade80' }) // Green color
    }
  }
  
  /**
   * Clear data for a tab
   */
  private clearTabData(tabId: number) {
    this.tabData.delete(tabId)
  }
  
  /**
   * Pre-fetch atom data in the background
   */
  private async prefetchAtomData(query: string): Promise<void> {
    try {
      const result = await this.atomSearchClient.search(query)
      
      // Update the tracked atom with match data if found
      for (const [tabId, tabData] of this.tabData.entries()) {
        const atom = tabData.atoms.get(query)
        if (atom && result.matches.length > 0) {
          atom.matches = result.matches
        }
      }
    } catch (error) {
      console.error('[AtomTrackingService] Failed to prefetch atom:', query, error)
    }
  }
  
  /**
   * Get tracked atoms for a specific tab
   */
  getTabAtoms(tabId: number): TrackedAtom[] {
    const tabData = this.tabData.get(tabId)
    if (!tabData) return []
    
    return Array.from(tabData.atoms.values())
  }
  
  /**
   * Get the current count for a tab
   */
  getTabCount(tabId: number): number {
    return this.tabData.get(tabId)?.count || 0
  }
  
  /**
   * Handle URL detection
   */
  handleUrlDetection(tabId: number, urlData: any) {
    const { hostname, protocol } = urlData
    const fullUrl = protocol + '//' + hostname
    
    this.trackAtom(tabId, {
      query: fullUrl,
      type: 'url',
      detectedAt: Date.now(),
      metadata: urlData
    })
  }
  
  /**
   * Handle address detection
   */
  handleAddressDetection(tabId: number, addressData: any) {
    const { addresses } = addressData
    
    // Track each unique address
    addresses.forEach((address: string) => {
      this.trackAtom(tabId, {
        query: address,
        type: 'address',
        detectedAt: Date.now(),
        metadata: addressData
      })
    })
  }
  
  /**
   * Handle social atom detection
   */
  handleSocialDetection(tabId: number, socialData: any) {
    const { username, platform = 'x.com' } = socialData
    const query = `${platform}:${username}`
    
    this.trackAtom(tabId, {
      query,
      type: 'social',
      detectedAt: Date.now(),
      metadata: socialData
    })
  }
}
