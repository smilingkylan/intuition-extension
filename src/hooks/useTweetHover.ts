import { useState, useEffect } from 'react'
import { TweetData, isTweetHoveredMessage } from '../types/messages'

export function useTweetHover() {
  const [currentTweet, setCurrentTweet] = useState<TweetData | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (isTweetHoveredMessage(message)) {
        // Update hovering state based on whether we're actively hovering
        setIsHovering(message.data !== null)
        
        // Only update currentTweet when we have new data (not when clearing)
        // This keeps the last tweet visible until a new one is hovered
        if (message.data !== null) {
          setCurrentTweet(message.data)
        }
        // Note: We DON'T clear currentTweet when message.data is null
      }
    }

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return {
    currentTweet,
    isHovering,
    clearTweet: () => setCurrentTweet(null)
  }
}