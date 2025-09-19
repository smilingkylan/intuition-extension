// Main background script entry point for Plasmo
import backgroundService from './src/background/index'

// Export empty object to satisfy Plasmo's requirements
export {}

// The backgroundService is automatically initialized when this module loads
console.log('Background service initialized')

// Optional: Handle extension installation/update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed')
  } else if (details.reason === 'update') {
    console.log('Extension updated')
  }
}) 