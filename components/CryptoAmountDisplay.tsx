import { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '~/components/ui/tooltip'
import { Skeleton } from '~/components/ui/skeleton'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'
import { cn } from '~/lib/utils'

interface CryptoAmountDisplayProps {
  value: string | bigint
  decimals?: number
  nativeCurrency?: string
  type?: 'market-cap' | 'position' | 'shares' | 'price' | 'generic'
  showAs?: 'fiat' | 'native' | 'both'
  className?: string
  children?: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showPopover?: boolean
}

export function CryptoAmountDisplay({
  value,
  decimals = 18,
  nativeCurrency = 'trust',
  type = 'generic',
  showAs = 'fiat',
  className,
  children,
  side = 'top',
  align = 'center',
  showPopover = true
}: CryptoAmountDisplayProps) {
  const { converter, isReady, exchangeRate } = useCurrencyConverter(nativeCurrency)

  // Loading state
  if (!isReady || !converter) {
    return <Skeleton className={cn('h-4 w-12', className)} />
  }

  // Convert the crypto amount
  const result = converter.convert({ value, decimals })

  // Get compact display content
  const getDisplayContent = () => {
    switch (showAs) {
      case 'native':
        return result.native.formatted
      case 'both':
        return (
          <div className="text-xs">
            <div className="font-medium">{result.fiat.formatted}</div>
            <div className="text-muted-foreground">{result.native.formatted}</div>
          </div>
        )
      case 'fiat':
      default:
        return result.fiat.formatted
    }
  }

  // Compact popover content
  const getPopoverContent = () => {
    const rate = exchangeRate?.toLocaleString() || 'Unknown'
    
    return (
      <div className="space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Fiat:</span>
          <span className="font-mono">{result.fiat.formatted}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Native:</span>
          <span className="font-mono text-xs">{result.native.formatted}</span>
        </div>
        <div className="border-t pt-1 text-muted-foreground">
          <div className="flex justify-between gap-2">
            <span>Rate:</span>
            <span className="text-xs">1 {nativeCurrency.toUpperCase()} = {rate}</span>
          </div>
        </div>
      </div>
    )
  }

  // If no popover requested, return simple display
  if (!showPopover) {
    return (
      <span className={cn('font-mono text-sm', className)}>
        {getDisplayContent()}
      </span>
    )
  }

  // Default display element
  const displayElement = children || (
    <span className={cn(
      'font-mono text-sm cursor-help hover:underline decoration-dotted underline-offset-2',
      className
    )}>
      {getDisplayContent()}
    </span>
  )

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children ? (
            <div className="cursor-help">
              {children}
            </div>
          ) : (
            displayElement
          )}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          {getPopoverContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Preset variants for your specific use cases
export function MarketCapDisplay({ 
  value, 
  className, 
  ...props 
}: Omit<CryptoAmountDisplayProps, 'type' | 'showAs'>) {
  return (
    <CryptoAmountDisplay 
      value={value}
      type="market-cap"
      showAs="fiat"
      className={cn('text-right', className)}
      {...props}
    />
  )
}

export function PositionDisplay({ 
  value, 
  direction,
  className, 
  ...props 
}: Omit<CryptoAmountDisplayProps, 'type'> & { direction?: 'positive' | 'negative' }) {
  return (
    <CryptoAmountDisplay 
      value={value}
      type="position"
      className={cn(
        'text-center',
        direction === 'positive' && 'text-green-600 dark:text-green-400',
        direction === 'negative' && 'text-red-600 dark:text-red-400',
        className
      )}
      {...props}
    />
  )
}

export function CompactAmountDisplay({ 
  value, 
  className, 
  ...props 
}: Omit<CryptoAmountDisplayProps, 'showAs'>) {
  return (
    <CryptoAmountDisplay 
      value={value}
      showAs="fiat"
      showPopover={false}
      className={cn('text-xs', className)}
      {...props}
    />
  )
}

export function PositionValueDisplay({ 
  shares, 
  sharePrice, 
  className, 
  ...props 
}: {
  shares: string
  sharePrice: string
  className?: string
}) {
  const { converter } = useCurrencyConverter()

  const marketCap = BigInt(shares) * BigInt(sharePrice)

  return (
    <CryptoAmountDisplay 
      value={marketCap}
      decimals={36}
      showAs="fiat"
      showPopover={false}
      {...props}
    />
  )
}