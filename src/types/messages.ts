/**
 * Message types for communication between content scripts and sidepanel
 */

export interface TweetData {
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
  userId?: string
  userIdSource?: 'cache' | 'api' | 'failed'
  avatarUrl?: string
}

export interface MessageBase {
  type: string
  data?: any
}

export interface TweetHoveredMessage extends MessageBase {
  type: 'TWEET_HOVERED'
  data: TweetData | null
}

export interface ModeChangedMessage extends MessageBase {
  type: 'MODE_CHANGED'
  data: {
    mode: 'mouse' | 'explore'
  }
}

export interface TabChangedMessage extends MessageBase {
  type: 'TAB_CHANGED'
  data: {
    tabId: number
    url: string
    title: string
  }
}

export interface AtomQueryMessage extends MessageBase {
  type: 'ATOM_QUERY'
  data: {
    query: string
    source: 'hover' | 'url' | 'highlight' | 'manual' | 'click'
    creationData: {
      type: 'social' | 'url' | 'address' | 'generic' | 'identity'
      name: string
      description?: string
      platform?: string
      username?: string
      userId?: string
      url?: string
      address?: string
      metadata: Record<string, any>
    }
  }
}

export type ExtensionMessage = 
  | TweetHoveredMessage 
  | ModeChangedMessage 
  | TabChangedMessage
  | AtomQueryMessage

// Helper type guards
export const isTweetHoveredMessage = (message: any): message is TweetHoveredMessage => {
  return message?.type === 'TWEET_HOVERED'
}

export const isModeChangedMessage = (message: any): message is ModeChangedMessage => {
  return message?.type === 'MODE_CHANGED'
}

export const isTabChangedMessage = (message: any): message is TabChangedMessage => {
  return message?.type === 'TAB_CHANGED'
}

export const isAtomQueryMessage = (message: any): message is AtomQueryMessage => {
  return message?.type === 'ATOM_QUERY'
}
