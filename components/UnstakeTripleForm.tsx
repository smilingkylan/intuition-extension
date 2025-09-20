import { Button } from '@/common/components/ui/button'
import { CardContent, CardFooter } from '@/common/components/ui/card'
import { RootDialogContext } from '@/components/providers'
import { Loader2Icon } from 'lucide-react'
import { useContext } from 'react'
import { formatUnits } from 'viem'
import { CONFIG } from '~/constants/web3'

const { CURRENCY_SYMBOL } = CONFIG

export const UnstakeTripleForm = ({
  triple,
  isProcessing,
  unstake,
  position,
}) => {
  const { pop } = useContext(RootDialogContext)
  const { shares } = position
  const direction = triple.term_id === position.id ? 'for' : 'against'
  // convert shares and currentSharePrice to BigInt
  const sharesBigInt = BigInt(shares)
  const positionVaultId = position.vault.term_id
  const termKey = positionVaultId === triple.term_id ? 'term' : 'counter_term'
  const relevantVault = triple[termKey].vaults[0]
  const currentSharePrice = relevantVault.current_share_price
  const currentSharePriceBigInt = BigInt(currentSharePrice)

  const unstakeAmount = sharesBigInt * currentSharePriceBigInt
  const unstakeAmountString = formatUnits(unstakeAmount, 36)
  // convert to number and limit to 10 decimal places
  const unstakeAmountNumber = Number(unstakeAmountString)
  const unstakeAmountFormatted = unstakeAmountNumber.toFixed(18)

  const onClickUnstake = () => {
    unstake(positionVaultId, shares)
  }

  return (
    <>
      <CardContent>
        <p>
          You currently have <strong>{unstakeAmountFormatted} {CURRENCY_SYMBOL}</strong> {' '}
          staked <strong>{direction}</strong> this triple.
        </p>
        <br />
        <p>Are you sure you want to unstake this amount?</p>
      </CardContent>
      <CardFooter className="flex flex-row justify-end gap-2 pb-0 px-0">
        <Button variant="secondary" onClick={pop}>
          Cancel
        </Button>
        <Button className="min-w-[90px]" onClick={onClickUnstake}>
          {isProcessing ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            'Unstake'
          )}
        </Button>
      </CardFooter>
    </>
  )
}
