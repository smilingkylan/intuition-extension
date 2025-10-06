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
      url?: string
      address?: string
      metadata: Record<string, any>
    }
  }
}

export interface UrlDataMessage extends MessageBase {
  type: 'URL_DATA'
  data: {
    url: string
    hostname: string
    domains: string[]  // e.g., ['api.twitter.com', 'twitter.com']
    pathname: string
    protocol: string
  }
}

export interface AddressDetectedMessage extends MessageBase {
  type: 'ADDRESS_DETECTED'
  data: {
    addresses: string[]  // Checksummed addresses
    context: {
      url: string
      elementText: string
      timestamp: number
    }
  }
}

export interface SocialAtomDetectedMessage extends MessageBase {
  type: 'SOCIAL_ATOM_DETECTED'
  data: {
    username: string
    platform: string
    detectedAt: number
    url: string
  }
}

export type ExtensionMessage = 
  | TweetHoveredMessage 
  | ModeChangedMessage 
  | TabChangedMessage
  | AtomQueryMessage
  | UrlDataMessage
  | AddressDetectedMessage
  | SocialAtomDetectedMessage

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

export const isUrlDataMessage = (message: any): message is UrlDataMessage => {
  return message?.type === 'URL_DATA'
}

export const isAddressDetectedMessage = (message: any): message is AddressDetectedMessage => {
  return message?.type === 'ADDRESS_DETECTED'
}

export const isSocialAtomDetectedMessage = (message: any): message is SocialAtomDetectedMessage => {
  return message?.type === 'SOCIAL_ATOM_DETECTED' && 
         message?.data?.username && 
         message?.data?.platform
}
