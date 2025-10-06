/**
 * Service for tracking and retrieving recently used atoms
 * Helps provide better UX by showing atoms the user has recently interacted with
 */

interface RecentAtom {
  termId: string
  label: string
  displayLabel?: string
  lastUsed: number
  useCount: number
}

const RECENT_ATOMS_KEY = 'recentlyUsedAtoms'
const MAX_RECENT_ATOMS = 20

export class RecentAtomsService {
  /**
   * Track when a user uses an atom in a triple
   * Updates usage count and last used timestamp
   */
  static async trackAtomUsage(atom: { termId: string; label: string; displayLabel?: string }) {
    try {
      const stored = await chrome.storage.local.get(RECENT_ATOMS_KEY)
      const recentAtoms: RecentAtom[] = stored[RECENT_ATOMS_KEY] || []
      
      const existingIndex = recentAtoms.findIndex(a => a.termId === atom.termId)
      
      if (existingIndex >= 0) {
        // Update existing
        recentAtoms[existingIndex].lastUsed = Date.now()
        recentAtoms[existingIndex].useCount++
        recentAtoms[existingIndex].displayLabel = atom.displayLabel || recentAtoms[existingIndex].displayLabel
      } else {
        // Add new
        recentAtoms.push({
          ...atom,
          lastUsed: Date.now(),
          useCount: 1
        })
      }
      
      // Sort by last used and limit
      recentAtoms.sort((a, b) => b.lastUsed - a.lastUsed)
      recentAtoms.splice(MAX_RECENT_ATOMS)
      
      await chrome.storage.local.set({ [RECENT_ATOMS_KEY]: recentAtoms })
    } catch (error) {
      console.error('[RecentAtoms] Error tracking atom usage:', error)
    }
  }
  
  /**
   * Get recently used atoms
   * @param limit Maximum number of atoms to return
   */
  static async getRecentAtoms(limit: number = 10): Promise<RecentAtom[]> {
    try {
      const stored = await chrome.storage.local.get(RECENT_ATOMS_KEY)
      const recentAtoms: RecentAtom[] = stored[RECENT_ATOMS_KEY] || []
      return recentAtoms.slice(0, limit)
    } catch (error) {
      console.error('[RecentAtoms] Error getting recent atoms:', error)
      return []
    }
  }
  
  /**
   * Clear all recent atoms history
   */
  static async clearRecentAtoms(): Promise<void> {
    try {
      await chrome.storage.local.remove(RECENT_ATOMS_KEY)
    } catch (error) {
      console.error('[RecentAtoms] Error clearing recent atoms:', error)
    }
  }
}
