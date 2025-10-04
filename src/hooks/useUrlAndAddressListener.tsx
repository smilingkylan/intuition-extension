import { useEffect } from 'react'
import { useAtomQueue } from './useAtomQueueWithQuery'
import { isUrlDataMessage, isAddressDetectedMessage } from '../types/messages'
import type { AtomQuery } from '../lib/atom-queue/types'

/**
 * Hook that listens for URL and address detection messages from content scripts
 * and converts them into atom queries.
 * 
 * This hook handles:
 * 1. URL_DATA: Creates queries for each domain variant (subdomain, main domain, etc.)
 * 2. ADDRESS_DETECTED: Creates queries for each detected Ethereum address
 */
export function useUrlAndAddressListener() {
  const { addQuery } = useAtomQueue()

  useEffect(() => {
    const handleMessage = (message: any) => {
      // Handle URL data from global URL detector
      if (isUrlDataMessage(message) && message.data) {
        console.log('[useUrlAndAddressListener] Received URL data:', message.data)
        
        const { domains, hostname, url, pathname } = message.data
        
        // Create queries for each domain variant
        // This allows finding atoms for both 'api.twitter.com' and 'twitter.com'
        const queries: AtomQuery[] = domains.map(domain => ({
          id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          query: domain,
          source: 'url',
          creationData: {
            type: 'url',
            name: domain,
            description: `Website: ${domain}`,
            url: `https://${domain}`,
            metadata: {
              fullUrl: url,
              hostname: hostname,
              pathname: pathname,
              detectedAt: Date.now(),
              allDomains: domains
            }
          },
          timestamp: Date.now()
        }))
        
        // Add all domain queries
        console.log(`[useUrlAndAddressListener] Adding ${queries.length} URL queries`)
        queries.forEach(query => {
          try {
            addQuery(query)
          } catch (error) {
            console.error('[useUrlAndAddressListener] Error adding URL query:', error)
          }
        })
      }
      
      // Handle address detection from global address detector
      if (isAddressDetectedMessage(message) && message.data) {
        console.log('[useUrlAndAddressListener] Received address data:', message.data)
        
        const { addresses, context } = message.data
        
        // Create queries for each detected address
        // Addresses are already checksummed from the content script
        const queries: AtomQuery[] = addresses.map(address => ({
          id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          query: address,
          source: 'hover',
          creationData: {
            type: 'address',
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            description: `Ethereum address: ${address}`,
            address: address,
            metadata: {
              fullAddress: address,
              detectedUrl: context.url,
              contextText: context.elementText,
              detectedAt: context.timestamp,
              format: 'checksummed' // Using EIP-55 checksummed format
            }
          },
          timestamp: Date.now()
        }))
        
        // Add all address queries
        console.log(`[useUrlAndAddressListener] Adding ${queries.length} address queries`)
        queries.forEach(query => {
          try {
            addQuery(query)
          } catch (error) {
            console.error('[useUrlAndAddressListener] Error adding address query:', error)
          }
        })
      }
    }

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [addQuery])
}

