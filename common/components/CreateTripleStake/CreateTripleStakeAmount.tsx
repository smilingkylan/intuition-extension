import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { CONFIG } from '~/constants/web3'
import { CardHeader, CardTitle } from '../ui/card'
import { StakeAmountGrid } from './StakeAmountButton'
import { Separator } from '../ui/separator'
import { useExchangeRates } from '@/common/hooks/use-exchange-rates'
import { useCurrency } from '../CurrencyProvider'
import { convertStakedBalance } from '@/common/util/intuition'

// Function to fetch exchange rates
const fetchExchangeRates = async () => {
  const { data } = await axios.get(`${CONFIG.REVEL8_API_ORIGIN}/exchange-rates`)
  return data
}

// move handling of form submission to the parent component
export const CreateTripleStakeAmount = ({
  onNext,
  onBack,
  cancelSyntax = 'Back',
  nextSyntax = 'Next',
  form,
  onSkip,
}: {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  cancelSyntax?: string
  nextSyntax?: string
  form: any
}) => {
  // Fetch exchange rates using React Query
  const { data: exchangeRates, isLoading } = useExchangeRates()
  const { selectedCurrency } = useCurrency()

  const fiatValue = convertStakedBalance(
    form.watch('stakeAmount').toString(),
    exchangeRates?.rate
  )

  const onClickAmount = (amount: number) => {
    form.setValue('shouldStake', true)
    form.setValue('stakeAmount', amount)
    onNext()
  }

  return (
    <CardHeader className="w-full mx-auto p-4 gap-y-4">
      <CardTitle className="mb-8">Stake Amount</CardTitle>

      <div className="flex flex-row">
        <div className="flex flex-1">
          <StakeAmountGrid
            amounts={[0.0004, 0.0012, 0.0036, 0.0108]}
            onClick={onClickAmount}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Separator
            orientation="vertical"
            className="h-[60px] w-[1px] bg-gray-200 mx-12"
          />
          <div className="w-full flex flex-row justify-center items-center">
            <span className="text-sm text-muted-foreground">or</span>
          </div>
          <Separator
            orientation="vertical"
            className="h-[60px] w-[1px] bg-gray-200 mx-12"
          />
        </div>
        <div className="flex flex-1 mt-8">
          <FormField
            control={form.control}
            name="stakeAmount"
            render={({ field }) => (
              <FormItem className="w-full">
                <div className="flex justify-between items-center">
                  <FormLabel>Stake Amount</FormLabel>
                  {!isLoading && (
                    <span className="text-sm text-muted-foreground">
                      {selectedCurrency.toUpperCase()} {fiatValue.formatted}
                    </span>
                  )}
                </div>
                <FormControl>
                  <Input
                    type="number"
                    min={0.0004}
                    step={0.0001}
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value)
                      field.onChange(isNaN(value) ? 0 : value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" color="gray" onClick={onBack}>
          {cancelSyntax}
        </Button>
        <Button type="button" variant="secondary" color="gray" onClick={onSkip}>
          Skip
        </Button>
        <Button
          type="button"
          disabled={form.formState.isSubmitting}
          className="w-[80px]"
          onClick={onNext}
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            nextSyntax
          )}
        </Button>
      </div>
    </CardHeader>
  )
}
