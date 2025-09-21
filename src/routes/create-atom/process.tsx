import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { LoaderIcon } from 'lucide-react'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { sendToBackground } from "@plasmohq/messaging"
import { toast } from "sonner"

export const Route = createFileRoute('/create-atom/process')({
  component: ProcessStep,
})

function ProcessStep() {
  const navigate = useNavigate()
  const { formData, transactionData, setCreatedAtoms } = useCreateAtom()

  useEffect(() => {
    const executeTransactions = async () => {
      if (!transactionData) {
        navigate({ to: '/create-atom/' })
        return
      }

      try {
        // Send request to background service to create atoms
        const response = await sendToBackground({
          name: "create-social-atoms",
          body: {
            atomsToCreate: transactionData.atomsToCreate.map(atom => ({
              uri: atom.uri,
              stake: atom.stake.toString() // Convert bigint to string for messaging
            })),
            formData: {
              hasImage: formData.hasImage || false,
              hasIdentity: formData.hasIdentity || false
            }
          }
        })

        if (response.success) {
          setCreatedAtoms(response.createdAtoms)
          navigate({ to: '/create-atom/success' })
        } else {
          throw new Error(response.error || 'Failed to create atoms')
        }
      } catch (error: any) {
        console.error('Transaction failed:', error)
        toast.error('Failed to create atoms: ' + (error.message || 'Unknown error'))
        navigate({ to: '/create-atom/review' })
      }
    }

    executeTransactions()
  }, [transactionData, formData, setCreatedAtoms, navigate])

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Creating Your Atoms</CardTitle>
          <CardDescription>
            Please wait while we create your atoms on-chain
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="font-semibold">Processing Transactions...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> The transactions are being signed with a hardcoded private key for development purposes.
        </p>
      </div>
    </div>
  )
} 