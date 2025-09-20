import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { z } from 'zod'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { i7nAxios } from '../util/fetch'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { useGetTripleQuery } from '@/lib/graphql/dist'
import { cn, getUserPositionOnTripleQuery } from '../util'
import { Skeleton } from './ui/skeleton'
import { useExchangeRates } from '../hooks/use-exchange-rates'
import { useWeb3Config } from '@/components/multivault-provider'
import { deposit, eventParseDeposited, multiCallIntuitionConfigs } from '@0xintuition/protocol'
import { useCurrency } from './CurrencyProvider'

const formSchema = z.object({
  stakeAmount: z
    .number()
    .min(0.003, 'Stake amount must be at least 0.003 ETH')
    .positive('Stake amount must be positive'),
})

// need to decouple this from context / environment
export const StakeTripleDialogContent = ({
  tripleId,
  onSuccess,
}: {
  tripleId: string
  onSuccess?: (hash: string) => void
}) => {
  const { address } = useAccount()
  const { selectedCurrency } = useCurrency()
  const [error, setError] = useState<string | null>(null)
  const { config } = useWeb3Config()
  const { data: exchangeRates } = useExchangeRates()
  const [isProcessing, setIsProcessing] = useState(false)
  const [tab, setTab] = useState('support')
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: async () => await multiCallIntuitionConfigs(config),
  })

  const { data: tripleData } = useGetTripleQuery({ tripleId })

  const { data: positionsData } = useQuery({
    queryKey: ['positions', tripleId],
    queryFn: async () =>
      await i7nAxios.post('', {
        query: getUserPositionOnTripleQuery,
        variables: {
          address: address,
          tripleId,
        },
      }),
    select: (data) => data.data.data.triple,
    enabled: !!tripleData && !!address,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stakeAmount: 0.001,
    },
  })

  const getPossibleActions = () => {
    let possibleActions = ['support', 'oppose']
    if (positionsData?.[0]) {
      if (positionsData[0].user_positions.length > 0) {
        possibleActions = ['support']
      } // cannot have both
      if (positionsData[0].user_counter_positions.length > 0) {
        possibleActions = ['oppose']
      }
    }
    return possibleActions
  }

  useEffect(() => {
    if (!getPossibleActions().includes(tab)) {
      const newTab = tab === 'support' ? 'oppose' : 'support'
      setTab(newTab)
    }
  }, [positionsData])

  if (!tripleData)
    return (
      <DialogContent className="">
        <Skeleton className="h-full w-full" />
      </DialogContent>
    )

  const handleTabChange = (value: string) => {
    if (!getPossibleActions().includes(value)) {
      setError('You must first unstake your current position')
      return
    }
    setTab(value)
  }

  const handleSubmit = async () => {
    const {
      triple: { counter_term_id, term_id },
    } = tripleData
    const data = form.getValues()
    const vaultIdToStake: string = tab === 'support' ? term_id : counter_term_id
    try {
      setIsProcessing(true)
      const amount = parseEther(data.stakeAmount.toString())
      // Use deposit instead of depositBatch for single deposits
      const transactionHash = await deposit(config, {
        args: [
          address, // receiver (the user's address)
          vaultIdToStake, // termId (the vault to deposit into)
          1n, // curveId (likely 0 for default curve)
          0n, // minShares (0 to accept any amount of shares)
        ],
        value: amount,
      })
      
      await eventParseDeposited(config?.publicClient, transactionHash)
      toast.success('Stake successful')
      onSuccess && onSuccess(transactionHash)
    } catch (err) {
      console.error(err)
      toast.error('Error staking')
    } finally {
      setIsProcessing(false)
    }
  }

  // fix exchange rates
  let fiatValue = '--.--'

  if (exchangeRates?.rate) {
    // safe to multiply because two numbers and not many decimals?
    fiatValue = (form.watch('stakeAmount') * exchangeRates.rate).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <DialogContent className="flex flex-col gap-y-8">
      <DialogHeader>
        <DialogTitle>Stake Triple</DialogTitle>
        <DialogDescription>
          Choose to either support or oppose the claim
        </DialogDescription>
      </DialogHeader>
      <div className="dialogContent">
        <Tabs
          onValueChange={handleTabChange}
          defaultValue="support"
          className="gap-y-8"
          value={tab}
        >
          <TabsList className="w-full grid grid-cols-2 hover:cursor-pointer">
            <TabsTrigger value="oppose" className="hover:cursor-pointer">
              Oppose
            </TabsTrigger>
            <TabsTrigger value="support" className="hover:cursor-pointer">
              Support
            </TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="stakeAmount"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Stake Amount</FormLabel>
                      <span className="text-sm text-muted-foreground">
                        {selectedCurrency.toUpperCase()} {fiatValue}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min={0.0001}
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
            </form>
          </Form>
        </Tabs>
      </div>
      <p className={cn('text-red-500 text-sm', !error && 'invisible')}>
        {error}
      </p>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleSubmit}
          type="submit"
          disabled={isProcessing || !tripleData}
          className="min-w-[75px]"
        >
          {isProcessing ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            'Stake'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
