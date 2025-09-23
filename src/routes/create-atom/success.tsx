import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { INTUITION_TESTNET } from '../../../common/constants/web3'

export const Route = createFileRoute('/create-atom/success')({
  component: SuccessStep,
})

function SuccessStep() {
  const navigate = useNavigate()
  const { createdAtoms } = useCreateAtom()
  const explorerUrl = INTUITION_TESTNET.I8N_EXPLORER_DOMAIN

  const handleDone = () => {
    navigate({ to: '/' })
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Success!</CardTitle>
          <CardDescription>
            Your atoms have been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">All atoms created successfully!</p>
              <p className="text-sm text-muted-foreground">
                Your social media profile atom and any additional atoms have been created on-chain.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-sm">Created Atoms:</h4>
            
            {createdAtoms.social && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Social Media Profile</p>
                  <p className="text-xs text-muted-foreground truncate">ID: {createdAtoms.social}</p>
                </div>
                <a
                  href={`${explorerUrl}/atoms/${createdAtoms.social}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {createdAtoms.image && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Profile Image</p>
                  <p className="text-xs text-muted-foreground truncate">ID: {createdAtoms.image}</p>
                </div>
                <a
                  href={`${explorerUrl}/atoms/${createdAtoms.image}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {createdAtoms.identity && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Real-World Identity</p>
                  <p className="text-xs text-muted-foreground truncate">ID: {createdAtoms.identity}</p>
                </div>
                <a
                  href={`${explorerUrl}/atoms/${createdAtoms.identity}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleDone} className="w-full max-w-xs">
          Done
        </Button>
      </div>
    </div>
  )
} 