import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Separator } from '~/components/ui/separator'
import { ExternalLinkIcon, DollarSignIcon, UsersIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { formatUnits } from 'viem'
import { useAtomByLabel } from '../hooks/useAtomByName'
import { AtomIcon } from '~/components/AtomIcon'
import { formatSocialAtomLabel } from '~/util/api'

interface AtomDisplayProps {
  // The identifier to search for
  identifier?: string | null
  // Optional prefix for the identifier (e.g., "twitter-username")
  identifierPrefix?: string
  // Title for the card
  title?: string
  // Description when atom not found
  notFoundMessage?: string
  // Custom label formatter
  formatLabel?: (identifier: string) => string
}

export function AtomDisplay({ 
  identifier, 
  identifierPrefix,
  title = "Intuition Atom",
  notFoundMessage = "No atom found",
  formatLabel
}: AtomDisplayProps) {
  // Format the search query
  const searchQuery = React.useMemo(() => {
    if (!identifier) return null
    if (formatLabel) return formatLabel(identifier)
    if (identifierPrefix) return `${identifierPrefix}:${identifier}`
    return identifier
  }, [identifier, identifierPrefix, formatLabel])

  const { data: atom, isLoading, error } = useAtomByLabel(searchQuery)

  if (!identifier) {
    return null
  }

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-4 border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <XCircleIcon className="h-4 w-4" />
            <p className="text-sm">Failed to load atom data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getVaultInfo = () => {
    const vault = atom?.term?.vaults?.[0]
    if (!vault) return null
    
    return {
      sharePrice: vault.current_share_price ? 
        Number(formatUnits(BigInt(vault.current_share_price), 18)).toFixed(6) : '0',
      totalShares: vault.total_shares ?
        Number(formatUnits(BigInt(vault.total_shares), 18)).toFixed(2) : '0',
      positions: vault.position_count || 0
    }
  }

  const vaultInfo = atom ? getVaultInfo() : null

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {atom ? (
            <Badge variant="default" className="text-xs">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Exists
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Not Found
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {atom ? (
          <div className="space-y-4">
            {/* Atom Info */}
            <div className="flex items-start gap-3">
              <AtomIcon 
                label={atom.label || identifier}
                size={48}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {atom.data || atom.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Atom #{atom.term_id}
                </p>
                {atom.creator && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Created by {atom.creator.label || `${atom.creator.id.slice(0, 6)}...${atom.creator.id.slice(-4)}`}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Vault Info */}
            {vaultInfo && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Share Price</p>
                    <p className="text-sm font-medium flex items-center justify-center gap-1 mt-1">
                      <DollarSignIcon className="h-3 w-3" />
                      {vaultInfo.sharePrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Shares</p>
                    <p className="text-sm font-medium mt-1">{vaultInfo.totalShares}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Positions</p>
                    <p className="text-sm font-medium flex items-center justify-center gap-1 mt-1">
                      <UsersIcon className="h-3 w-3" />
                      {vaultInfo.positions}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Created Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>Created {formatDate(atom.created_at)}</span>
            </div>

            {/* Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                window.open(`https://dev.portal.intuition.systems/app/atoms/${atom.term_id}`, '_blank')
              }}
            >
              View in Intuition Portal
              <ExternalLinkIcon className="h-3 w-3 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {notFoundMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const createUrl = searchQuery 
                  ? `https://dev.portal.intuition.systems/app/create?data=${encodeURIComponent(searchQuery)}`
                  : 'https://dev.portal.intuition.systems/app/create'
                window.open(createUrl, '_blank')
              }}
            >
              Create Atom
              <ExternalLinkIcon className="h-3 w-3 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 