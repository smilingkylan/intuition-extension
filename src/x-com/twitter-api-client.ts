import axios from 'axios'
import { CONFIG } from '~/constants/web3'

/**
 * Client for interacting with the Revel8 Twitter API endpoints
 * Simple caching for user ID lookups
 */
export class TwitterApiClient {
  private userIdCache: Map<string, string> = new Map()
  private readonly apiEndpoint: string
  
  constructor(apiEndpoint: string = CONFIG.REVEL8_API_ORIGIN) {
    this.apiEndpoint = apiEndpoint
  }

  /**
   * Get user ID by username (with caching)
   */
  async getUserId(username: string): Promise<string | null> {
    const normalizedUsername = username.replace('@', '').toLowerCase()
    
    // Check cache first
    if (this.userIdCache.has(normalizedUsername)) {
      return this.userIdCache.get(normalizedUsername)!
    }
    
    try {
      const response = await axios.get(`${this.apiEndpoint}/twitter/user/${normalizedUsername}`)
      const userId = response.data.user_id
      
      // Cache the result
      this.userIdCache.set(normalizedUsername, userId)
      
      return userId
    } catch (error) {
      console.warn(`Failed to fetch user ID for ${normalizedUsername}:`, error)
      return null
    }
  }

  /**
   * Get username by user ID (with caching)
   */
  async getUsername(userId: string): Promise<string | null> {
    // Check reverse cache first
    const cachedUsername = this.getUsernameFromCache(userId)
    if (cachedUsername) {
      return cachedUsername
    }
    
    try {
      const response = await axios.get(`${this.apiEndpoint}/twitter/user-id/${userId}`)
      const username = response.data.username
      
      // Cache bidirectionally
      this.userIdCache.set(username.toLowerCase(), userId)
      
      return username
    } catch (error) {
      console.warn(`Failed to fetch username for user ID ${userId}:`, error)
      return null
    }
  }

  /**
   * Get user ID synchronously if cached, otherwise return null
   */
  getCachedUserId(username: string): string | null {
    const normalizedUsername = username.replace('@', '').toLowerCase()
    return this.userIdCache.get(normalizedUsername) || null
  }

  /**
   * Get username from cache by searching through entries
   */
  private getUsernameFromCache(userId: string): string | null {
    for (const [username, cachedId] of this.userIdCache.entries()) {
      if (cachedId === userId) {
        return username
      }
    }
    return null
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.userIdCache.clear()
  }

  /**
   * Get cache size (for debugging)
   */
  getCacheSize(): number {
    return this.userIdCache.size
  }
}

// Singleton instance
let twitterApiClient: TwitterApiClient | null = null

/**
 * Get or create the singleton Twitter API client instance
 */
export function getTwitterApiClient(): TwitterApiClient {
  if (!twitterApiClient) {
    twitterApiClient = new TwitterApiClient()
  }
  return twitterApiClient
}
