import type { PlasmoCSConfig } from "plasmo"

/**
 * Global content script that monitors URL changes and sends domain information
 * to the sidepanel for atom queries.
 * 
 * This script runs on all pages and detects:
 * - Full hostname (e.g., api.twitter.com)
 * - Main domain (e.g., twitter.com)
 * - Variants without www prefix
 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle",
  all_frames: false
}

let lastUrl: string | null = null

/**
 * Parse URL and extract relevant domain information
 */
function parseUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    const hostname = url.hostname
    
    // Extract domain parts
    const parts = hostname.split('.')
    const domains: string[] = []
    
    // Add full hostname
    domains.push(hostname)
    
    // Add main domain (e.g., twitter.com from api.twitter.com)
    if (parts.length > 2) {
      const mainDomain = parts.slice(-2).join('.')
      domains.push(mainDomain)
    }
    
    // Remove www prefix if present and add variant without it
    const withoutWww = hostname.replace(/^www\./, '')
    if (withoutWww !== hostname) {
      domains.push(withoutWww)
    }
    
    return {
      url: urlString,
      hostname,
      domains: [...new Set(domains)], // Remove duplicates
      pathname: url.pathname,
      protocol: url.protocol
    }
  } catch {
    return null
  }
}

/**
 * Send URL data to sidepanel for atom queries
 */
function sendUrlData() {
  const currentUrl = window.location.href.split('?')[0] // Remove query params
  const currentHash = window.location.href.split('#')[0] // Remove hash
  
  if (currentHash === lastUrl) return
  lastUrl = currentHash
  
  const urlData = parseUrl(currentUrl)
  if (!urlData) return
  
  // Skip extension pages and chrome:// URLs
  if (urlData.protocol === 'chrome-extension:' || urlData.protocol === 'chrome:') {
    return
  }
  
  console.log('[URL Detector] Sending URL data:', urlData)
  
  chrome.runtime.sendMessage({
    type: 'URL_DATA',
    data: urlData,
    source: 'url-detector'
  }).catch(error => {
    // Sidepanel might not be open, that's okay
    console.debug('[URL Detector] Could not send message:', error.message)
  })
}

// Monitor URL changes
sendUrlData() // Initial send on load

// Listen for navigation events (popstate is for back/forward)
window.addEventListener('popstate', sendUrlData)

// For SPAs that use pushState/replaceState
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  originalPushState.apply(history, args)
  sendUrlData()
}

history.replaceState = function(...args) {
  originalReplaceState.apply(history, args)
  sendUrlData()
}

// Also monitor for SPAs that might change URL without proper history events
let urlCheckInterval = setInterval(() => {
  const currentUrl = window.location.href.split('#')[0]
  if (currentUrl !== lastUrl) {
    sendUrlData()
  }
}, 1000) // Check every second

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (urlCheckInterval) {
    clearInterval(urlCheckInterval)
  }
})

console.log('[URL Detector] Initialized on:', window.location.hostname)

