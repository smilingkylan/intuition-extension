import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { LoaderIcon } from 'lucide-react'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { sendToBackground } from "@plasmohq/messaging"
import { toast } from "sonner"
import { CONFIG } from '~/constants'

export const Route = createFileRoute('/create-atom/process')({
  component: ProcessStep,
})

function ProcessStep() {
  const navigate = useNavigate()
  const { formData, transactionData, setCreatedAtoms } = useCreateAtom()
  
  console.log('ProcessStep transactionData', transactionData)

  useEffect(() => {
    const executeTransactions = async () => {
      console.log('executeTransactions transactionData', transactionData)
      if (!transactionData) {
        navigate({ to: '/create-atom/' })
        return
      }

      try {
        // First, prepare the atoms to create
        const atomsToCreate = transactionData.atomsToCreate.map(atom => ({
          data: atom.uri,
          initialDeposit: atom.stake.toString()
        }))
        console.log('atomsToCreate', atomsToCreate)
        // Send to background for execution using generic web3 handler
        const response = await sendToBackground({
          name: "web3",
          body: {
            method: "createAtoms",
            params: [{
              atoms: atomsToCreate
            }]
          }
        })
        console.log('response', response)
        if (response.error) {
          throw new Error(response.error)
        }
        console.log('response', response)
        const atomIds = response.atomIds
        if (!atomIds || atomIds.length === 0) {
          throw new Error('No atom IDs returned from transaction')
        }
        console.log('atomIds', atomIds) 
        // Handle triple creation if needed
        if (formData.hasImage || formData.hasIdentity) {
          const triplesToCreate = []
          if (formData.hasImage && atomIds[1]) {
            triplesToCreate.push({
              subjectId: atomIds[0],
              predicateId: CONFIG.HAS_RELATED_IMAGE_VAULT_ID,
              objectId: atomIds[1],
              initialDeposit: '0.0004'
            })
          }
          console.log("triplesToCreate", triplesToCreate)

          if (formData.hasIdentity) {
            const identityAtomId = atomIds[atomIds.length - 1]
            triplesToCreate.push({
              subjectId: identityAtomId,
              predicateId: CONFIG.OWNS_ATOM_ID,
              objectId: atomIds[0],
              initialDeposit: '0.0004'
            })
          }

          if (triplesToCreate.length > 0) {
            const tripleResponse = await sendToBackground({
              name: "web3",
              body: {
                method: "createTriples",
                params: [{ triples: triplesToCreate }]
              }
            })

            if (tripleResponse.error) {
              throw new Error(tripleResponse.error)
            }
          }
        }

        // Map atom IDs to our structure
        const createdAtoms = {
          social: atomIds[0],
          image: formData.hasImage ? atomIds[1] : undefined,
          identity: formData.hasIdentity ? atomIds[atomIds.length - 1] : undefined
        }

        setCreatedAtoms(createdAtoms)
        navigate({ to: '/create-atom/success' })
      } catch (error: any) {
        console.error('Transaction failed:', error)
        toast.error('Failed to create atoms: ' + (error.message || 'Unknown error'))
        navigate({ to: '/create-atom/review' })
      }
    }

    executeTransactions()
  }, [transactionData, formData, setCreatedAtoms, navigate])

  console.log('ProcessStep rendering', transactionData, formData)
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Creating Your Atoms</CardTitle>
          <CardDescription>
            Please confirm the transactions in your wallet
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

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> You may need to approve up to 2 transactions in your wallet:
        </p>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Create atoms transaction</li>
          <li>Create relationships transaction (if applicable)</li>
        </ol>
      </div>
    </div>
  )
} 