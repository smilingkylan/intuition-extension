import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { LoaderIcon } from 'lucide-react'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { sendToBackground } from "@plasmohq/messaging"
import { toast } from "~/hooks/use-toast"
import { INTUITION_TESTNET } from '~/constants/web3'

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
        // First, prepare the atoms to create
        const atomsToCreate = transactionData.atomsToCreate.map(atom => ({
          data: atom.uri,
          initialDeposit: atom.stake
        }))
        
        
        // Send to background for execution using our web3 handler
        const response = await sendToBackground({
          name: "web3",
          body: {
            method: "createAtoms",
            params: [{
              atoms: atomsToCreate
            }]
          }
        })
        
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        const atomIds = response.atomIds
        if (!atomIds || atomIds.length === 0) {
          throw new Error('No atom IDs returned from transaction')
        }
        
        
        // Handle triple creation if needed
        if (formData.hasImage || formData.hasIdentity) {
          const triplesToCreate = []
          
          // Add image relationship
          if (formData.hasImage && atomIds[1]) {
            triplesToCreate.push({
              subjectId: atomIds[0],
              predicateId: INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID,
              objectId: atomIds[1],
              initialDeposit: '0.0004'
            })
          }
          
          // Add identity ownership relationship
          if (formData.hasIdentity) {
            const identityAtomId = atomIds[atomIds.length - 1]
            triplesToCreate.push({
              subjectId: identityAtomId,
              predicateId: INTUITION_TESTNET.OWNS_ATOM_ID,
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
        
        toast({
          title: "Success!",
          description: "Atoms created successfully on-chain",
        })
        
        navigate({ to: '/create-atom/success' })
      } catch (error: any) {
        console.error('Transaction failed:', error)
        toast({
          title: "Transaction failed",
          description: error.message || 'Failed to create atoms',
          variant: "destructive"
        })
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