import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { GlobeIcon } from 'lucide-react'
import { CONFIG } from '~/constants/web3'

const { EXPLORER_DOMAIN, REVEL8_EXPLORER_DOMAIN } = CONFIG

type StakeAtomSuccessProps = {
  summary: {
    txHash: `0x${string}`
    atomVaultId: bigint
  }
}

export const StakeAtomSuccess = ({ summary }: StakeAtomSuccessProps) => {
  const { txHash, atomVaultId } = summary
  const txUrl = `${EXPLORER_DOMAIN}/tx/${txHash}`
  const atomUrl = `${REVEL8_EXPLORER_DOMAIN}/atoms/${atomVaultId}`

  return (
    <div className="flex flex-col gap-4 justify-between">
      <CardHeader>
        <CardTitle>Success!</CardTitle>
        <CardDescription>You have increased your stake</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="gap-8">
          <h3>
            Stake on atom:{' '}
            <a href={txUrl} target="_blank" rel="noopener noreferrer">
              <GlobeIcon className="w-4 h-4 inline" />
            </a>
          </h3>
          <ul className={cn('ml-8')}>
            <li className={'custom-check'}>
              Atom{' '}
              <a href={atomUrl} target="_blank" rel="noopener noreferrer">
                <GlobeIcon className="w-4 h-4 inline" />
              </a>
            </li>
          </ul>
        </div>
      </CardContent>
    </div>
  )
}