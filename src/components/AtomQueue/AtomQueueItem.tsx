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
import { useAtomQueue } from '../../hooks/useAtomQueueWithQuery'
import type { QueueItem } from '../../lib/atom-queue/types'

interface AtomQueueItemProps {
  item: QueueItem
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
        to: '/create-social-atom-flow', 
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
              {result.status === 'not-found' && 'Not Found'}
              {result.status === 'error' && 'Error'}
            </Badge>

            {/* Query label */}
            <span className="text-sm font-medium truncate">
              {query.query}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Refresh button - only show for not-found or error states */}
            {(result.status === 'not-found' || result.status === 'error') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || result.status === 'searching'}
                className="h-8 w-8 p-0"
                title="Refresh search"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(item.id)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePinned(item.id)}
              className={`h-8 w-8 p-0 pin-button ${isPinned ? 'pinned' : ''}`}
            >
              <PinIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeQuery(item.id)}
              className="h-8 w-8 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <CardContent className="pt-0">
          {result.status === 'searching' && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-full skeleton-loader" />
              <Skeleton className="h-4 w-full skeleton-loader" />
              <Skeleton className="h-4 w-3/4 skeleton-loader" />
            </div>
          )}

          {result.status === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <p className="text-sm">{result.error || 'Failed to search atoms'}</p>
            </div>
          )}

          {result.status === 'not-found' && (
            <div className="space-y-4">
              {/* Preview of what would be created */}
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-start gap-3">
                  <AtomIcon 
                    label={query.creationData.name}
                    size={48}
                    className="rounded-full flex-shrink-0 opacity-60"
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
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card match-item cursor-pointer"
                    onClick={() => {
                      window.open(`https://dev.portal.intuition.systems/app/atoms/${match.termId}`, '_blank')
                    }}
                  >
                    <AtomIcon 
                      label={match.label}
                      size={40}
                      className="rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {match.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <DollarSignIcon className="h-3 w-3" />
                          {formatStake(match.stake)}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {match.positionCount}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </motion.div>
    </Card>
  )
} 