import { revel8Axios } from '@/common/util'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '~/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'

// Function to fetch exchange rates
const fetchExchangeRates = async () => {
  const { data } = await revel8Axios.get(`/exchange-rates`)
  return data
}

export const StakeAtomAmount = ({
  setStep,
  onStakeAmountChange,
  cancelSyntax = 'Back',
  form,
}: {
  setStep: (step: number) => void
  onStakeAmountChange: (amount: number) => void
  cancelSyntax?: string
  form
}) => {
  // Get current stake amount from form
  const stakeAmount = form.watch('stakeAmount') || 0

  // Call the onStakeAmountChange prop whenever stakeAmount changes
  const prevAmountRef = useRef(stakeAmount)
  useEffect(() => {
    // Store previous amount in a ref to compare
    if (prevAmountRef.current !== stakeAmount) {
      onStakeAmountChange(stakeAmount)
      prevAmountRef.current = stakeAmount
    }
  }, [stakeAmount, onStakeAmountChange])

  // Fetch exchange rates using React Query
  const { data: exchangeRates, isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 60000, // Refetch every minute
  })

  // Calculate USD value
  const usdValue = exchangeRates?.eth_usd?.usd
    ? (exchangeRates.eth_usd.usd * stakeAmount).toFixed(2)
    : '0.00'

  return (
    <>
      <CardHeader>
        <CardTitle>Stake on Atom</CardTitle>
      </CardHeader>

      <CardContent>
        <FormField
          control={form.control}
          name="stakeAmount"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Stake Amount (ETH)</FormLabel>
                {!isLoading && (
                  <span className="text-sm text-muted-foreground">
                    ${usdValue} USD
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
      </CardContent>

      <CardFooter className="flex flex-row justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          color="gray"
          onClick={() => setStep(0)}
        >
          {cancelSyntax}
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-[80px]"
        >
          {form.formState.isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            'Submit'
          )}
        </Button>
      </CardFooter>
    </>
  )
}
