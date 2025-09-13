// todo: delete?
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CONFIG } from '~/constants'

const { EXPLORER_DOMAIN } = CONFIG

export const CompleteTripleSuccess = ({
  finalData,
  nextSteps,
}: {
  finalData: any
  nextSteps?: React.ReactNode
}) => {
  console.log('CompleteTripleSuccess', finalData)
  const { atomHash, atomVaultId, tripleHash, tripleVaultId } = finalData
  const atomTxUrl = `${EXPLORER_DOMAIN}/tx/${atomHash}`
  const atomExplorerUrl = `/atoms/${atomVaultId}`
  const tripleTxUrl = `${EXPLORER_DOMAIN}/tx/${tripleHash}`
  const tripleExplorerUrl = `/triples/${tripleVaultId}`

  return (
    <div className="flex flex-col gap-4 justify-between">
      <CardHeader id="complete-triple-sucess">
        <CardTitle>Success!</CardTitle>
        <CardDescription>
          Your triple has been created and should now be visible
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col w-full">
        <div className="gap-8">
          <ol className={'ml-4'}>
            {atomVaultId && (
              <li className={'custom-check pl-2'}>
                <a
                  href={atomExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Atom #{atomVaultId} created
                </a>{' '}
                <a
                  href={atomTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500"
                >
                  &nbsp;(View transaction)
                </a>
              </li>
            )}
            <li className={'custom-check pl-2'}>
              <a
                href={tripleExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Triple #{tripleVaultId} created
              </a>{' '}
              <a
                href={tripleTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500"
              >
                &nbsp;(View transaction)
              </a>
            </li>
          </ol>
        </div>
        {nextSteps && <div className="next-steps mt-4">{nextSteps}</div>}
      </CardContent>
    </div>
  )
}
