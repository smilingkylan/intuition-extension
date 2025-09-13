import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card'
import { cn } from '@/common/lib/utils'
import { GlobeIcon } from 'lucide-react'
import { CONFIG } from '~/constants/web3'

const { EXPLORER_DOMAIN, REVEL8_EXPLORER_DOMAIN } = CONFIG

type CreateTripleStakeSuccessProps = {
  summary: {
    txHash: `0x${string}`
    position: bigint
  }
}

export const CreateTripleStakeSuccess = ({
  summary,
}: CreateTripleStakeSuccessProps) => {
  const { txHash, tripleVaultId } = summary
  const txUrl = `${EXPLORER_DOMAIN}/tx/${txHash}`
  const tripleUrl = `${REVEL8_EXPLORER_DOMAIN}/triples/${tripleVaultId}`

  return (
    <div className="flex flex-col gap-4 justify-between">
      <CardHeader>
        <CardTitle>Success</CardTitle>
        <CardDescription>
          You have successfully staked to a triple!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="gap-8">
          <h3>
            1. Stake triple:{' '}
            <a href={txUrl} target="_blank" rel="noopener noreferrer">
              <GlobeIcon className="w-4 h-4 inline" />
            </a>
          </h3>
          <ul className={cn('ml-8')}>
            <li className={'custom-check'}>
              Triple{' '}
              <a href={tripleUrl} target="_blank" rel="noopener noreferrer">
                <GlobeIcon className="w-4 h-4 inline" />
              </a>
            </li>
          </ul>
        </div>
      </CardContent>
    </div>
  )
}
