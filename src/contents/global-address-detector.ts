import type { PlasmoCSConfig } from "plasmo"
import { isAddress, getAddress } from 'viem'

/**
 * Global content script that detects EVM addresses when users hover over text.
 * 
 * This script runs on all pages and looks for Ethereum/EVM addresses
 * in the format 0x followed by 40 hexadecimal characters.
 * 
 * ONLY detects the address directly under the mouse cursor, not all addresses
 * in the containing element.
 * 
 * Addresses are validated and checksummed before being sent to the sidepanel.
 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

// Regex for potential Ethereum addresses (0x + 40 hex chars)
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g

let hoveredElement: Element | null = null
let hoverTimeout: NodeJS.Timeout | null = null
let lastSentAddresses: Set<string> = new Set()
let lastSentTime = 0

/**
 * Validate and checksum an Ethereum address
 */
function validateAndChecksumAddress(address: string): string | null {
  try {
    if (!isAddress(address)) {
      return null
    }
    // getAddress returns the checksummed version
    return getAddress(address)
  } catch {
    return null
  }
}

/**
 * Extract valid Ethereum addresses from text
 */
function extractAddresses(text: string): string[] {
  const matches = text.match(ETH_ADDRESS_REGEX) || []
  const validAddresses: string[] = []
  
  for (const match of matches) {
    const checksummed = validateAndChecksumAddress(match)
    if (checksummed) {
      validAddresses.push(checksummed)
    }
  }
  
  return validAddresses
}

/**
 * Check if we should throttle sending addresses
 * (don't send same addresses within 5 seconds)
 */
function shouldThrottle(addresses: string[]): boolean {
  const now = Date.now()
  
  // If less than 5 seconds since last send, check if addresses are same
  if (now - lastSentTime < 5000) {
    const addressSet = new Set(addresses)
    if (addressSet.size === lastSentAddresses.size && 
        [...addressSet].every(addr => lastSentAddresses.has(addr))) {
      return true
    }
  }
  
  return false
}

/**
 * Get the text node and position at a specific point
 */
function getTextNodeAtPoint(x: number, y: number): { node: Text | null, text: string } {
  // Use caretRangeFromPoint to find the exact text node under cursor
  let range: Range | null = null
  
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y)
  } else if ((document as any).caretPositionFromPoint) {
    // Firefox alternative
    const position = (document as any).caretPositionFromPoint(x, y)
    if (position) {
      range = document.createRange()
      range.setStart(position.offsetNode, position.offset)
    }
  }
  
  if (!range) {
    return { node: null, text: '' }
  }
  
  const node = range.startContainer
  
  // We want text nodes, not element nodes
  if (node.nodeType === Node.TEXT_NODE) {
    return { node: node as Text, text: node.textContent || '' }
  }
  
  // If it's an element, try to get its first text node
  if (node.nodeType === Node.ELEMENT_NODE) {
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    )
    const textNode = walker.nextNode() as Text | null
    return { 
      node: textNode, 
      text: textNode?.textContent || node.textContent || '' 
    }
  }
  
  return { node: null, text: '' }
}

/**
 * Find the address at a specific cursor position within text
 */
function findAddressAtCursor(text: string, cursorOffset: number): string | null {
  const matches = Array.from(text.matchAll(new RegExp(ETH_ADDRESS_REGEX, 'g')))
  
  for (const match of matches) {
    const start = match.index!
    const end = start + match[0].length
    
    // Check if cursor is within this address (or very close to it)
    // Allow a small margin (2 chars) for easier hovering
    if (cursorOffset >= start - 2 && cursorOffset <= end + 2) {
      const checksummed = validateAndChecksumAddress(match[0])
      return checksummed
    }
  }
  
  return null
}

/**
 * Handle mouse over events to detect addresses
 */
function handleMouseOver(event: MouseEvent) {
  const element = event.target as Element
  
  // Skip if we're hovering over input fields or contenteditable
  if (element.tagName === 'INPUT' || 
      element.tagName === 'TEXTAREA' ||
      element.getAttribute('contenteditable') === 'true') {
    return
  }
  
  // Clear previous timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  
  hoveredElement = element
  
  // Store cursor position for precise detection
  const cursorX = event.clientX
  const cursorY = event.clientY
  
  // Wait 500ms before checking for addresses (debounce)
  hoverTimeout = setTimeout(() => {
    if (hoveredElement !== element) return
    
    // Get the exact text node under the cursor
    const { node, text } = getTextNodeAtPoint(cursorX, cursorY)
    
    if (!text || text.trim().length === 0) {
      return
    }
    
    // Try to find the exact address at cursor position
    let addressAtCursor: string | null = null
    
    if (node && node.nodeType === Node.TEXT_NODE) {
      // Find cursor offset within the text node
      const caretRange = document.caretRangeFromPoint 
        ? document.caretRangeFromPoint(cursorX, cursorY)
        : null
      
      if (caretRange && caretRange.startContainer === node) {
        addressAtCursor = findAddressAtCursor(text, caretRange.startOffset)
      }
    }
    
    // Fallback: extract all addresses from the text node and take first
    if (!addressAtCursor) {
      const addresses = extractAddresses(text)
      if (addresses.length > 0) {
        // If multiple addresses in same text node, only take first as fallback
        // This is rare but possible
        addressAtCursor = addresses[0]
        console.debug('[Address Detector] Using fallback, found', addresses.length, 'addresses in text node')
      }
    }
    
    if (addressAtCursor) {
      // Check throttling
      if (shouldThrottle([addressAtCursor])) {
        console.debug('[Address Detector] Throttled, same address sent recently')
        return
      }
      
      console.log('[Address Detector] Found address at cursor:', addressAtCursor)
      
      // Update throttle tracking
      lastSentAddresses = new Set([addressAtCursor])
      lastSentTime = Date.now()
      
      chrome.runtime.sendMessage({
        type: 'ADDRESS_DETECTED',
        data: {
          addresses: [addressAtCursor], // Only send the one address at cursor
          context: {
            url: window.location.href,
            elementText: text.substring(0, 200), // Limit context
            timestamp: Date.now()
          }
        },
        source: 'address-detector'
      }).catch(error => {
        // Sidepanel might not be open, that's okay
        console.debug('[Address Detector] Could not send message:', error.message)
      })
    }
  }, 500)
}

/**
 * Handle mouse out events
 */
function handleMouseOut() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  hoveredElement = null
}

// Attach event listeners
document.addEventListener('mouseover', handleMouseOver, { passive: true })
document.addEventListener('mouseout', handleMouseOut, { passive: true })

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
  }
  document.removeEventListener('mouseover', handleMouseOver)
  document.removeEventListener('mouseout', handleMouseOut)
})

console.log('[Address Detector] Initialized on:', window.location.hostname)