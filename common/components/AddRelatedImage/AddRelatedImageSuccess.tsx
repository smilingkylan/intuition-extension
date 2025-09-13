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

type AddRelatedImageSuccessProps = {
  finalData: {
    atomVaultId: bigint
    tripleVaultId: bigint
    tripleHash: `0x${string}`
    atomHash: `0x${string}`
  }
}

export const AddRelatedImageSuccess = ({
  finalData,
}: AddRelatedImageSuccessProps) => {
  const { atomHash, tripleHash, atomVaultId, tripleVaultId } = finalData
  const atomTxUrl = `${EXPLORER_DOMAIN}/tx/${atomHash}`
  const tripleTxUrl = `${EXPLORER_DOMAIN}/tx/${tripleHash}`
  const imageAtomUrl = `${REVEL8_EXPLORER_DOMAIN}/atoms/${atomVaultId}`
  const hasImageTripleUrl = `${REVEL8_EXPLORER_DOMAIN}/triples/${tripleVaultId}` // todo: remove REVEL8_EXPLORER_DOMAIN references

  return (
    <div className="flex flex-col gap-4 justify-between">
      <CardHeader>
        <CardTitle>Success!</CardTitle>
        <CardDescription>Your atom now has an associated image</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="gap-8">
          <h3>
            1. Create atoms:{' '}
            <a href={atomTxUrl} target="_blank" rel="noopener noreferrer">
              <GlobeIcon className="w-4 h-4 inline" />
            </a>
          </h3>
          <ul className={cn('ml-8')}>
            <li className={'custom-check'}>
              <a href={imageAtomUrl} target="_blank" rel="noopener noreferrer">
                Image <GlobeIcon className="w-4 h-4 inline" />
              </a>
            </li>
          </ul>
          <br />
          <h3>
            2. Create triples:{' '}
            <a href={tripleTxUrl} target="_blank" rel="noopener noreferrer">
              <GlobeIcon className="w-4 h-4 inline" />
            </a>
          </h3>
          <ul className={cn('ml-8')}>
            <li className={'custom-check'}>
              <a
                href={hasImageTripleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Atom has related Image <GlobeIcon className="w-4 h-4 inline" />
              </a>
            </li>
          </ul>
        </div>
      </CardContent>
    </div>
  )
}
