import { useState, useEffect } from 'react'
import { TweetData, isTweetHoveredMessage } from '../types/messages'

export function useTweetHover() {
  const [currentTweet, setCurrentTweet] = useState<TweetData | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (isTweetHoveredMessage(message)) {
        setCurrentTweet(message.data)
        setIsHovering(message.data !== null)
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
