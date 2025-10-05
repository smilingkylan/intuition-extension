import type { AtomMatch } from './types'

export interface AtomDisplayInfo {
  displayLabel: string
  platform?: 'x.com' | 'github.com' | 'generic'
  username?: string
  avatarUrl?: string
}

/**
 * Service for transforming atom labels into display-friendly formats
 */
export class AtomLabelService {
  private static instance: AtomLabelService | null = null
  private cache = new Map<string, AtomDisplayInfo>()
  
  static getInstance(): AtomLabelService {
    if (!AtomLabelService.instance) {
      AtomLabelService.instance = new AtomLabelService()
    }
    return AtomLabelService.instance
  }

  /**
   * Transform an atom label into display-friendly format
   */
  async transformLabel(label: string): Promise<AtomDisplayInfo> {
    // Check cache first
    if (this.cache.has(label)) {
      return this.cache.get(label)!
    }

    let displayInfo: AtomDisplayInfo = {
      displayLabel: label
    }

    // Handle X.com atoms
    if (label.startsWith('x.com:')) {
      const username = label.split(':')[1]
      displayInfo = {
        displayLabel: `@${username}`,
        platform: 'x.com',
        username: username,
        avatarUrl: `https://unavatar.io/twitter/${username}`
      }
    }
    // Handle GitHub atoms
    else if (label.startsWith('github.com:')) {
      const username = label.split(':')[1]
      displayInfo = {
        displayLabel: `@${username}`,
        platform: 'github.com',
        username: username,
        avatarUrl: `https://github.com/${username}.png`
      }
    }
    // Handle other platforms as needed
    
    // Cache the result
    this.cache.set(label, displayInfo)
    
    return displayInfo
  }

  /**
   * Transform multiple labels in parallel
   */
  async transformLabels(labels: string[]): Promise<Map<string, AtomDisplayInfo>> {
    const results = new Map<string, AtomDisplayInfo>()
    
    // Separate cached and uncached labels
    const uncachedLabels: string[] = []
    
    for (const label of labels) {
      if (this.cache.has(label)) {
        results.set(label, this.cache.get(label)!)
      } else {
        uncachedLabels.push(label)
      }
    }
    
    // Transform uncached labels in parallel
    if (uncachedLabels.length > 0) {
      const transformPromises = uncachedLabels.map(label => 
        this.transformLabel(label).then(info => ({ label, info }))
      )
      
      const transformedResults = await Promise.all(transformPromises)
      
      for (const { label, info } of transformedResults) {
        results.set(label, info)
      }
    }
    
    return results
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache size (for debugging)
   */
  getCacheSize(): number {
    return this.cache.size
  }
}

// Export singleton instance getter
export const getAtomLabelService = () => AtomLabelService.getInstance()
