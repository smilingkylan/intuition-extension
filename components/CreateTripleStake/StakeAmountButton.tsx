import { convertStakedBalance } from '@/common/util/intuition'
import { Button } from '~/components/ui/button'
import { Skeleton } from '../ui/skeleton'

export const StakeAmountButton = ({
  amount,
  exchangeRates,
  onClick,
}: {
  amount: number
  exchangeRates: any[]
  onClick: (amount: number) => void
}) => {
  const amountInfo = () => {
    const usdValue = convertStakedBalance(
      amount.toString(),
      exchangeRates,
      'ETH',
      'USD'
    )
    return (
      <div className="flex flex-col justify-between items-center">
        <span>{amount} ETH</span>
        <span className="text-sm text-muted-foreground">
          ${usdValue.formatted}
        </span>
      </div>
    )
  }
  return (
    <Button
      type="button"
      onClick={() => onClick(amount)}
      variant="outline"
      size="sm"
      className="h-20"
    >
      {exchangeRates ? amountInfo() : <Skeleton className="w-full h-20" />}
    </Button>
  )
}

export const StakeAmountGrid = ({
  amounts,
  exchangeRates,
  onClick,
}: {
  amounts: number[]
  exchangeRates: any[]
  onClick: (amount: number) => void
}) => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full gap-4">
      {amounts.map((amount) => (
        <StakeAmountButton
          key={amount}
          onClick={onClick}
          amount={amount}
          exchangeRates={exchangeRates}
        />
      ))}
    </div>
  )
}
