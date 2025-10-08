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
  RefreshCw,
  CheckCircleIcon,
  GitBranchIcon
} from 'lucide-react'
import { AtomIcon } from '~/components/AtomIcon'
import { formatUnits } from 'viem'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAtomQueue } from '../../hooks/useAtomQueueWithQuery'
import type { QueueItem, AtomMatch } from '../../lib/atom-queue/types'
import { fetchRelatedImage } from '../../lib/atom-queue/atom-image-queries'
import { CONFIG } from '~/constants'
import { useCreateTripleModal } from '../../providers/ModalProvider'

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
  const createTripleModal = useCreateTripleModal()
  
  // Now useQuery is called at the top level of a component
  const { data: relatedImage } = useQuery({
    queryKey: ['atom-image', match.termId],
    queryFn: () => fetchRelatedImage(match.termId),
    enabled: !!match.termId && (isExpanded || isPinned),
    staleTime: 10 * 60 * 1000,
  })

  const handleMatchClick = (e: React.MouseEvent) => {
    // Don't open explorer if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    window.open(`${REVEL8_EXPLORER_DOMAIN}/atoms/${match.termId}`, '_blank')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card match-item cursor-pointer"
        onClick={handleMatchClick}
      >
      {relatedImage?.imageUrl || match.displayInfo?.avatarUrl ? (
        <img 
          src={fixImageUrl(relatedImage?.imageUrl || match.displayInfo?.avatarUrl)}
          alt={match.displayLabel || match.label}
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
          (relatedImage?.imageUrl || match.displayInfo?.avatarUrl) ? 'hidden' : ''
        }`}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {match.displayLabel || match.label}
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
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            createTripleModal({
              termId: match.termId,
              label: match.label,
              displayLabel: match.displayLabel
            })
          }}
          className="h-7 px-2"
          title="Create Triple"
        >
          <GitBranchIcon className="h-3.5 w-3.5" />
        </Button>
        <Badge variant="outline" className="text-xs">
          #{index + 1}
        </Badge>
      </div>
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
    } else if (query.creationData.type === 'url') {
      // Handle URL atom creation
      navigate({ 
        to: '/create-url-atom', 
        search: { creationData: query.creationData } 
      })
      } else if (query.creationData.type === 'address') {
        // Handle address atom creation
        navigate({ 
          to: '/create-address-atom', 
          search: { creationData: query.creationData } 
        })
    } else {
      // For other types, log a warning
      console.warn(`Atom creation for type '${query.creationData.type}' not yet implemented`)
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

  // Handle clicks on the header to expand/collapse (except on action buttons)
  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only toggle if clicking on the header itself, not on buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) {
      return
    }
    toggleExpanded(item.id)
  }

  const statusConfig = {
    searching: {
      icon: '...',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    found: {
      icon: result.summary?.totalMatches || 0,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    'not-found': {
      icon: '0',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    error: {
      icon: '!',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  }

  const config = statusConfig[result.status]

  return (
    <Card className={`mb-3 overflow-hidden queue-item ${isPinned ? 'pinned' : ''}`}>
      <CardHeader 
        className="px-4 py-2.5 cursor-pointer hover:bg-accent/5 transition-colors min-h-[52px]"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left side: Status icon and query */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Compact status indicator */}
            <div 
              className={`h-7 w-7 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
              title={
                result.status === 'searching' ? 'Searching...' :
                result.status === 'found' ? `Found ${result.summary?.totalMatches || 0} atoms` :
                result.status === 'not-found' ? 'Not found' :
                'Error'
              }
            >
              <span className={`text-xs font-semibold ${config.color}`}>
                {config.icon}
              </span>
            </div>

            {/* Query label - takes remaining space */}
            <span className="text-sm font-medium truncate flex-1">
              {query.query}
            </span>
          </div>

          {/* Right side: Action buttons (only visible on hover or when pinned) */}
          <div className="flex items-center gap-1 action-buttons flex-shrink-0">
            {!isRefreshing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRefresh()
                }}
                className="h-7 w-7 opacity-0 transition-opacity"
                title="Refresh"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-7 w-7"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                togglePinned(item.id)
              }}
              className={`h-7 w-7 pin-button ${isPinned ? 'pinned' : ''}`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <PinIcon className={`h-3 w-3 ${isPinned ? 'fill-current' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                removeQuery(item.id)
              }}
              className="h-7 w-7 remove-button"
              title="Remove"
            >
              <XIcon className="h-3 w-3" />
            </Button>
            
            {/* Visual expand indicator */}
            <div className="ml-1">
              {isExpanded ? (
                <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <CardContent className="px-4 pt-0 pb-3">
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
