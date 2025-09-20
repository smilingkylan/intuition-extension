import { cn, convertStakedBalance } from '~/util'
import { Button } from '../ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { VerticalTriple } from '../VerticalTriple'
import { ArrowDownIcon, Loader2Icon } from 'lucide-react'
import { Progress } from '../ui/progress'
import { useExchangeRates } from '~/hooks/use-exchange-rates'
import { CONFIG } from '~/constants/web3'
import { useCurrency } from '../CurrencyProvider'

const { CURRENCY_SYMBOL } = CONFIG

const PROGRESS_VALUES = {
  COMPLETE: { text: 'Success!', value: 100 },
  ATOM_CREATED: { text: 'Atom created', value: 60 },
  UPLOADING: { text: 'Uploading data...', value: 15 },
  WAITING: { text: '', value: 0 },
}

export const CompleteTripleConfirm = ({
  form,
  onBack,
  onNext,
  adjustedAtomsData,
  isProcessing,
  finalData,
}: {
  form: any
  dismissDialog: () => void
  onBack: () => void
  onNext: () => void
  adjustedAtomsData: any[]
  isProcessing: boolean
  finalData: any
}) => {
  const { data: exchangeRates } = useExchangeRates()
  const { selectedCurrency } = useCurrency()

  let fiatValue
  if (exchangeRates) {
    const { fiat } = convertStakedBalance(
      form.watch('stakeAmount').toString(),
      exchangeRates?.rate
    )
    fiatValue = fiat
  }

  let progressKey
  if (!isProcessing) {
    progressKey = 'WAITING'
  } else {
    if (!finalData?.atomVaultId) progressKey = 'UPLOADING'
    if (finalData?.atomVaultId && !finalData?.tripleVaultId)
      progressKey = 'ATOM_CREATED'
    if (finalData?.tripleVaultId) progressKey = 'COMPLETE'
  }
  const onClickNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onNext()
  }

  return (
    <div className="flex flex-col justify-between">
      <CardHeader id="complete-triple-basic">
        <CardTitle>Complete Triple Confirm</CardTitle>
        <CardDescription>
          Verify the following information before submitting the{' '}
          <strong>two</strong> transactions
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col w-full">
        <h3 className="text-center text-lg font-bold mb-0">
          {form.watch('stakeAmount')} {CURRENCY_SYMBOL}
        </h3>
        <p className="text-center text-sm text-muted-foreground">
          ({selectedCurrency.toUpperCase()} {fiatValue})
        </p>
      </CardContent>
      <div className="w-full flex justify-center items-center">
        <ArrowDownIcon className="w-8 h-8 mb-6" />
      </div>
      <VerticalTriple atomsData={adjustedAtomsData} />

      <CardFooter className="flex flex-col gap-2 mt-12">
        <div className="content flex flex-row items-center justify-center mb-8 w-full relative">
          <div className="buttons absolute right-0 flex flex-row gap-2">
            <Button onClick={onBack} variant="secondary">
              Back
            </Button>
            <Button
              disabled={isProcessing}
              onClick={onClickNext}
              className="min-w-[90px]"
            >
              {isProcessing ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : finalData?.atomVaultId ? (
                'Continue'
              ) : (
                'Submit'
              )}
            </Button>
          </div>
        </div>
        <Progress
          value={PROGRESS_VALUES[progressKey].value}
          className={cn('absolute bottom-0', !isProcessing && 'invisible')}
        />
        <p className="text-sm text-muted-foreground absolute bottom-4">
          {PROGRESS_VALUES[progressKey].text}
        </p>
      </CardFooter>
    </div>
  )
}
