import { convertStakedBalance } from '@/common/util/intuition'
import { Button } from '~/components/ui/button'
import { Skeleton } from '../ui/skeleton'
import { CONFIG } from '~/constants/web3'
import { useExchangeRates } from '@/common/hooks/use-exchange-rates'
import { useCurrency } from '../CurrencyProvider'

const { CURRENCY_SYMBOL } = CONFIG

export const StakeAmountButton = ({
  amount,
  onClick,
}: {
  amount: number
  onClick: (amount: number) => void
}) => {
  const { data } = useExchangeRates()
  const { selectedCurrency } = useCurrency()
  const amountInfo = () => {
    const fiatValue = convertStakedBalance(
      amount.toString(),
      data?.rate
    )
    return (
      <div className="flex flex-col justify-between items-center">
        <span>{amount} {CURRENCY_SYMBOL}</span>
        <span className="text-sm text-muted-foreground">
          {selectedCurrency.toUpperCase()} {fiatValue.formatted}
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
      {data?.rate ? amountInfo() : <Skeleton className="w-full h-20" />}
    </Button>
  )
}

export const StakeAmountGrid = ({
  amounts,
  onClick,
}: {
  amounts: number[]
  onClick: (amount: number) => void
}) => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full gap-4">
      {amounts.map((amount) => (
        <StakeAmountButton
          key={amount}
          onClick={onClick}
          amount={amount}
        />
      ))}
    </div>
  )
}
