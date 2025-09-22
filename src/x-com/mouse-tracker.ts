/**
 * Twitter/X.com Mouse Tracker Content Script
 * Monitors mouse movements and detects when hovering over tweets
 */

import { sendToBackground } from "@plasmohq/messaging"

interface TweetData {
  tweetId: string
  username: string
  displayName: string
  content: string
  timestamp: string
  isVerified: boolean
  url: string
  hoveredAt: number
  mediaCount: number
  replyCount: number
  retweetCount: number
  likeCount: number
}

export class TwitterMouseTracker {
  private debounceTimer: number | null = null
  private lastHoveredTweet: string | null = null
  private isActive = true
  private pendingTweetData: TweetData | null = null
  private collectedUsernames: Set<string> = new Set()
  private atomCreationTimer: number | null = null

  constructor() {
    this.initMouseTracking()
    this.setupVisibilityHandling()
  }

  private initMouseTracking() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    
    console.log('🐭 Twitter Mouse Tracker initialized')
  }

  private setupVisibilityHandling() {
    // Pause tracking when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden
      if (!this.isActive) {
        this.clearCurrentHover()
      }
    })
  }

  private handleMouseMove(event: MouseEvent) {
    if (!this.isActive) return

    // Clear any existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Set a new timer for 1000ms
    this.debounceTimer = window.setTimeout(() => {
      this.checkHoveredTweet(event)
    }, 400)
  }

  private handleMouseLeave() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.clearCurrentHover()
  }

  private checkHoveredTweet(event: MouseEvent) {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    const article = element?.closest('article[data-testid="tweet"]') as HTMLElement
    
    if (article) {
      const tweetData = this.extractTweetData(article)
      const tweetId = tweetData.tweetId
      
      // Only send if different from last hovered tweet
      if (tweetId !== this.lastHoveredTweet) {
        this.lastHoveredTweet = tweetId
        this.pendingTweetData = tweetData
        this.sendTweetData(tweetData)
        console.log('🐦 Tweet hovered (after 1000ms):', tweetData.username, tweetData.content.substring(0, 50) + '...')
      }
    } else if (this.lastHoveredTweet) {
      // Mouse moved away from tweet
      this.clearCurrentHover()
    }
  }

  private clearCurrentHover() {
    this.lastHoveredTweet = null
    this.pendingTweetData = null
    this.sendTweetData(null)
    console.log('🐦 Tweet hover cleared')
  }

  private extractTweetData(article: HTMLElement): TweetData {
    const username = this.extractUsername(article)
    
    // Collect username for atom creation
    this.collectUsername(username)
    
    return {
      tweetId: this.extractTweetId(article),
      username: username,
      displayName: this.extractDisplayName(article),
      content: this.extractTweetText(article),
      timestamp: this.extractTimestamp(article),
      isVerified: this.checkIfVerified(article),
      url: window.location.href,
      hoveredAt: Date.now(),
      mediaCount: this.extractMediaCount(article),
      replyCount: this.extractReplyCount(article),
      retweetCount: this.extractRetweetCount(article),
      likeCount: this.extractLikeCount(article)
    }
  }

  private extractTweetId(article: HTMLElement): string {
    // Look for tweet ID in URL or data attributes
    const link = article.querySelector('a[href*="/status/"]')
    const href = link?.getAttribute('href') || ''
    const match = href.match(/\/status\/(\d+)/)
    return match ? match[1] : 'unknown'
  }

  private extractUsername(article: HTMLElement): string {
    const usernameEl = article.querySelector('[data-testid="User-Name"]')
    const link = usernameEl?.querySelector('a[href^="/"]')
    const href = link?.getAttribute('href') || ''
    return href.replace('/', '') || 'unknown'
  }

  private extractDisplayName(article: HTMLElement): string {
    const nameEl = article.querySelector('[data-testid="User-Name"]')
    const textContent = nameEl?.textContent || ''
    // Remove @username part if present
    return textContent.split('@')[0].trim() || 'Unknown User'
  }

  private extractTweetText(article: HTMLElement): string {
    const textEl = article.querySelector('[data-testid="tweetText"]')
    return textEl?.textContent?.trim() || ''
  }

  private extractTimestamp(article: HTMLElement): string {
    const timeEl = article.querySelector('time')
    return timeEl?.getAttribute('datetime') || new Date().toISOString()
  }

  private checkIfVerified(article: HTMLElement): boolean {
    return article.querySelector('[data-testid="icon-verified"]') !== null
  }

  private extractMediaCount(article: HTMLElement): number {
    const mediaElements = article.querySelectorAll('[data-testid="tweetPhoto"]')
    return mediaElements.length
  }

  private extractReplyCount(article: HTMLElement): number {
    const replyButton = article.querySelector('[data-testid="reply"]')
    const countEl = replyButton?.querySelector('[data-testid="app-text-transition-container"]')
    return this.parseCount(countEl?.textContent || '0')
  }

  private extractRetweetCount(article: HTMLElement): number {
    const retweetButton = article.querySelector('[data-testid="retweet"]')
    const countEl = retweetButton?.querySelector('[data-testid="app-text-transition-container"]')
    return this.parseCount(countEl?.textContent || '0')
  }

  private extractLikeCount(article: HTMLElement): number {
    const likeButton = article.querySelector('[data-testid="like"]')
    const countEl = likeButton?.querySelector('[data-testid="app-text-transition-container"]')
    return this.parseCount(countEl?.textContent || '0')
  }

  private parseCount(text: string): number {
    const cleanText = text.replace(/[^\d.KM]/g, '')
    if (cleanText.includes('K')) {
      return Math.floor(parseFloat(cleanText.replace('K', '')) * 1000)
    } else if (cleanText.includes('M')) {
      return Math.floor(parseFloat(cleanText.replace('M', '')) * 1000000)
    }
    return parseInt(cleanText) || 0
  }


  private collectUsername(username: string) {
    if (username && !this.collectedUsernames.has(username)) {
      this.collectedUsernames.add(username)
      // Automatic atom creation disabled - atoms are now created through the sidepanel UI
      // this.scheduleAtomCreation()
    }
  }

  private scheduleAtomCreation() {
    // Automatic atom creation disabled - atoms are now created through the sidepanel UI
    /*
    // Clear existing timer
    if (this.atomCreationTimer) {
      clearTimeout(this.atomCreationTimer)
    }

    // Schedule batch creation after 2 seconds of no new usernames
    this.atomCreationTimer = setTimeout(() => {
      this.createAtomsForCollectedUsernames()
    }, 2000)
    */
  }

  private async createAtomsForCollectedUsernames() {
    // Automatic atom creation disabled - atoms are now created through the sidepanel UI
    /*
    const usernames = Array.from(this.collectedUsernames)
    if (usernames.length === 0) return

    console.log(`Creating atoms for ${usernames.length} usernames:`, usernames)

    try {
      await sendToBackground({
        name: "create-atoms",
        body: {
          usernames
        }
      })
      
      // Clear the collected usernames after sending
      this.collectedUsernames.clear()
    } catch (error) {
      console.error('Failed to trigger atom creation:', error)
    }
    */
  }

  private sendTweetData(data: TweetData | null) {
    chrome.runtime.sendMessage({
      type: 'TWEET_HOVERED',
      data
    }).catch(error => {
      console.warn('Failed to send tweet data to sidepanel:', error)
    })
  }

  // Public method to manually trigger check (useful for testing)
  public checkCurrentPosition() {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    this.checkHoveredTweet({ clientX: centerX, clientY: centerY } as MouseEvent)
  }

  // Cleanup method
  public destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    document.removeEventListener('mouseleave', this.handleMouseLeave.bind(this))
  }
}
