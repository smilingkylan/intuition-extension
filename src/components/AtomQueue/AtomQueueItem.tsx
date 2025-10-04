import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { 
  PinIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  XIcon,
  AlertCircleIcon,
  SparklesIcon,
  DollarSignIcon,
  UsersIcon,
  RefreshCw
} from 'lucide-react'
import { AtomIcon } from '~/components/AtomIcon'
import { formatUnits } from 'viem'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAtomQueue } from '../../hooks/useAtomQueueWithQuery'
import type { QueueItem, AtomMatch } from '../../lib/atom-queue/types'
import { fetchRelatedImage } from '../../lib/atom-queue/atom-image-queries'
import { CONFIG } from '~/constants'

const { REVEL8_EXPLORER_DOMAIN } = CONFIG

interface AtomQueueItemProps {
  item: QueueItem
}

// Helper function to convert IPFS URLs to HTTP
const fixImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return url
}

// Separate component for each match to handle its own image fetching
interface MatchItemProps {
  match: AtomMatch
  index: number
  isExpanded: boolean
  isPinned: boolean
  formatStake: (stake: string) => string
}

function MatchItem({ match, index, isExpanded, isPinned, formatStake }: MatchItemProps) {
  // Now useQuery is called at the top level of a component
  const { data: relatedImage } = useQuery({
    queryKey: ['atom-image', match.termId],
    queryFn: () => fetchRelatedImage(match.termId),
    enabled: !!match.termId && (isExpanded || isPinned),
    staleTime: 10 * 60 * 1000,
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card match-item cursor-pointer"
      onClick={() => {
        window.open(`${REVEL8_EXPLORER_DOMAIN}/atoms/${match.termId}`, '_blank')
      }}
    >
      {relatedImage?.imageUrl ? (
        <img 
          src={fixImageUrl(relatedImage.imageUrl)}
          alt={match.label}
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'block'
          }}
        />
      ) : null}
      <AtomIcon 
        label={match.label}
        size={40}
        className={`rounded-full flex-shrink-0 ${
          relatedImage?.imageUrl ? 'hidden' : ''
        }`}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {match.label}
        </h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <DollarSignIcon className="h-3 w-3" />
            {formatStake(match.totalStaked)}
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3 w-3" />
            {match.totalPositions}
          </span>
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        #{index + 1}
      </Badge>
    </motion.div>
  )
}

export function AtomQueueItem({ item }: AtomQueueItemProps) {
  const navigate = useNavigate()
  const { removeQuery, toggleExpanded, togglePinned, refreshQuery } = useAtomQueue()
  const { query, result, isExpanded, isPinned } = item
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleCreateAtom = () => {
    // Check if this is a social atom (X.com/Twitter)
    if (query.creationData.type === 'social' && query.creationData.platform === 'x.com') {
      navigate({ 
        to: '/create-social-atom', 
        search: { creationData: query.creationData } 
      })
    } else {
      // For other types, we might still use the old navigation
      console.warn('Non-social atom creation not yet implemented with new flow')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshQuery(item.id)
    } finally {
      // Add a small delay for better UX
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  const formatStake = (stake: string) => {
    try {
      return Number(formatUnits(BigInt(stake), 18)).toFixed(2)
    } catch {
      return '0.00'
    }
  }

  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Status badge */}
            <Badge 
              variant={
                result.status === 'searching' ? 'secondary' :
                result.status === 'found' ? 'default' :
                result.status === 'not-found' ? 'outline' :
                'destructive'
              }
              className={`text-xs status-badge ${result.status}`}
            >
              {result.status === 'searching' && 'Searching...'}
              {result.status === 'found' && `Found ${result.summary?.totalMatches || 0}`}
              {result.status === 'not-found' && (
                <>
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  Not Found
                </>
              )}
              {result.status === 'error' && 'Error'}
            </Badge>

            {/* Query label */}
            <span className="text-sm font-medium truncate">
              {query.query}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-2">
            {!isRefreshing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className={`h-8 w-8 ${result.status === 'not-found' ? 'animate-pulse' : ''}`}
                title="Refresh atom data"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePinned(item.id)}
              className={`h-8 w-8 pin-button ${isPinned ? 'pinned' : ''}`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <PinIcon className={`h-3 w-3 ${isPinned ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleExpanded(item.id)}
              className="h-8 w-8 expand-button"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-3 w-3" />
              ) : (
                <ChevronDownIcon className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeQuery(item.id)}
              className="h-8 w-8 remove-button"
              title="Remove"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <CardContent className="pt-0">
          {result.status === 'searching' && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {result.status === 'error' && (
            <div className="text-sm text-destructive">
              {result.error || 'An error occurred'}
            </div>
          )}

          {result.status === 'not-found' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg border not-found-preview">
                <div className="flex items-start gap-3">
                  {query.creationData.metadata?.avatarUrl ? (
                    <img 
                      src={fixImageUrl(query.creationData.metadata.avatarUrl)}
                      alt={query.creationData.name}
                      className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <AtomIcon 
                    label={query.creationData.name}
                    size={48}
                    className={`rounded-full flex-shrink-0 ${
                      query.creationData.metadata?.avatarUrl ? 'hidden' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {query.creationData.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {query.creationData.description || 'No description'}
                    </p>
                    <Badge variant="outline" className="text-xs mt-2">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Preview
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateAtom}
                className="w-full create-atom-button"
                variant="outline"
              >
                Create Atom
              </Button>
            </div>
          )}

          {result.status === 'found' && result.summary && (
            <div className="space-y-4">
              {/* Summary stats */}
              {result.summary.totalMatches > 1 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded bg-muted/20 summary-stat">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-sm font-medium">{result.summary.totalMatches}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/20 summary-stat">
                    <p className="text-xs text-muted-foreground">Staked</p>
                    <p className="text-sm font-medium flex items-center justify-center gap-1">
                      <DollarSignIcon className="h-3 w-3" />
                      {formatStake(result.summary.totalStaked)}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/20 summary-stat">
                    <p className="text-xs text-muted-foreground">Positions</p>
                    <p className="text-sm font-medium flex items-center justify-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {result.summary.totalPositions}
                    </p>
                  </div>
                </div>
              )}

              {/* Top matches */}
              <div className="space-y-2">
                {result.matches.map((match, index) => (
                  <MatchItem
                    key={match.termId}
                    match={match}
                    index={index}
                    isExpanded={isExpanded}
                    isPinned={isPinned}
                    formatStake={formatStake}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </motion.div>
    </Card>
  )
}
