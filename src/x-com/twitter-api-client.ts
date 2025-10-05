import { CONFIG } from '~/constants/web3'

/**
 * Client for interacting with Twitter API through our backend proxy
 * Note: Currently simplified as userId lookups are no longer needed
 */
export class TwitterApiClient {
  private readonly apiEndpoint: string
  
  constructor(apiEndpoint: string = CONFIG.REVEL8_API_ORIGIN) {
    this.apiEndpoint = apiEndpoint
  }
  
  // Add any future Twitter API methods here as needed
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
