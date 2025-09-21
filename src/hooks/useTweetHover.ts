import { useState, useEffect } from 'react'
import { TweetData, isTweetHoveredMessage } from '../types/messages'

export function useTweetHover() {
  const [currentTweet, setCurrentTweet] = useState<TweetData | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (isTweetHoveredMessage(message)) {
        if (message.data !== null) {
          // New tweet data - update both tweet and hovering state
          setCurrentTweet(message.data)
          setIsHovering(true)
        } else {
          // Mouse left tweet - only update hovering state, keep the tweet data
          setIsHovering(false)
        }
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
    clearTweet: () => {
      setCurrentTweet(null)
      setIsHovering(false)
    }
  }
}
