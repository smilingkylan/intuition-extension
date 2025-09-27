import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { LoaderIcon } from 'lucide-react'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { toast } from "~/hooks/use-toast"
import { INTUITION_TESTNET } from '~/constants/web3'
import { useTransactionProvider } from '../../providers/TransactionProvider'
import { 
  createAtomsEncode, 
  createTriplesEncode,
  eventParseAtomCreated,
  eventParseTripleCreated 
} from '@0xintuition/protocol'
import { 
  toHex, 
  parseEther, 
  encodeFunctionData, 
  parseEventLogs,
  type Address,
  type Hex 
} from 'viem'

export const Route = createFileRoute('/create-atom/process')({
  component: ProcessStep,
})

function ProcessStep() {
  const navigate = useNavigate()
  const { formData, transactionData, setCreatedAtoms } = useCreateAtom()
  const { sendTransaction, waitForTransactionReceipt, isReady, account } = useTransactionProvider()
  
  console.log('ProcessStep rendering with data:', { formData, transactionData })

  useEffect(() => {
    const executeTransactions = async () => {
      console.log('Starting transaction execution...')
      if (!transactionData) {
        console.log('No transaction data, redirecting to start')
        navigate({ to: '/create-atom/' })
        return
      }

      if (!isReady || !account) {
        console.log('TransactionProvider not ready')
        toast({
          title: "Wallet not ready",
          description: "Please ensure your wallet is connected",
          variant: "destructive"
        })
        navigate({ to: '/create-atom/' })
        return
      }

      try {
        // First, prepare the atoms to create
        const atomsData = transactionData.atomsToCreate.map(atom => toHex(atom.uri))
        const atomsDeposits = transactionData.atomsToCreate.map(atom => parseEther(atom.stake))
        
        console.log('Creating atoms:', { atomsData, atomsDeposits })
        
        // Calculate total value needed
        const atomCost = parseEther('0.003') // INTUITION_TESTNET.ATOM_COST
        let totalValue = BigInt(0)
        for (const deposit of atomsDeposits) {
          totalValue += atomCost + deposit
        }
        
        // Encode the createAtoms transaction
        const createAtomsData = encodeFunctionData({
          abi: INTUITION_TESTNET.CONTRACT_ABI,
          functionName: 'createAtoms',
          args: [atomsData, atomsDeposits]
        })
        
        // Send the transaction directly
        const atomTxHash = await sendTransaction({
          to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
          data: createAtomsData,
          value: totalValue,
          gas: 500000n
        })
        
        console.log('Create atoms transaction hash:', atomTxHash)
        
        // Wait for confirmation and parse events
        toast({
          title: "Atoms creating...",
          description: "Transaction submitted. Waiting for confirmation...",
        })
        
        const atomReceipt = await waitForTransactionReceipt(atomTxHash as Hex)
        console.log('Atom creation receipt:', atomReceipt)
        
        // Parse the created atom IDs from events
        const atomIds: string[] = []
        const parsedLogs = parseEventLogs({
          abi: INTUITION_TESTNET.CONTRACT_ABI,
          logs: atomReceipt.logs,
          eventName: 'AtomCreated'
        })

        for (const log of parsedLogs) {
          if (log.eventName === 'AtomCreated' && log.args) {
            const atomId = (log.args as any).atomId || (log.args as any).atom?.atomId
            if (atomId) {
              atomIds.push(atomId.toString())
            }
          }
        }

        if (atomIds.length === 0) {
          throw new Error('No atom IDs found in transaction receipt')
        }
        
        console.log('Created atom IDs:', atomIds)
        
        // Handle triple creation if needed
        if (formData.hasImage || formData.hasIdentity) {
          const tripleSubjects: bigint[] = []
          const triplePredicates: bigint[] = []
          const tripleObjects: bigint[] = []
          const tripleDeposits: bigint[] = []
          
          // Add image relationship
          if (formData.hasImage && atomIds[1]) {
            tripleSubjects.push(BigInt(atomIds[0]))
            triplePredicates.push(BigInt(INTUITION_TESTNET.HAS_RELATED_IMAGE_VAULT_ID))
            tripleObjects.push(BigInt(atomIds[1]))
            tripleDeposits.push(parseEther('0.0004'))
          }
          
          // Add identity ownership relationship
          if (formData.hasIdentity) {
            const identityAtomId = atomIds[atomIds.length - 1]
            tripleSubjects.push(BigInt(identityAtomId))
            triplePredicates.push(BigInt(INTUITION_TESTNET.OWNS_ATOM_ID))
            tripleObjects.push(BigInt(atomIds[0]))
            tripleDeposits.push(parseEther('0.0004'))
          }

          if (tripleSubjects.length > 0) {
            console.log('Creating triples with counts:', {
              subjects: tripleSubjects.length,
              predicates: triplePredicates.length,
              objects: tripleObjects.length,
              deposits: tripleDeposits.length
            })
            
            // Calculate total value for triples
            let tripleTotalValue = BigInt(0)
            for (const deposit of tripleDeposits) {
              tripleTotalValue += deposit
            }
            
            // Encode the createTriples transaction
            const createTriplesData = encodeFunctionData({
              abi: INTUITION_TESTNET.CONTRACT_ABI,
              functionName: 'createTriples',
              args: [tripleSubjects, triplePredicates, tripleObjects, tripleDeposits]
            })
            
            const tripleTxHash = await sendTransaction({
              to: INTUITION_TESTNET.I8N_CONTRACT_ADDRESS as Address,
              data: createTriplesData,
              value: tripleTotalValue,
              gas: 500000n
            })

            console.log('Create triples transaction hash:', tripleTxHash)
            
            toast({
              title: "Triples creating...",
              description: "Relationship transaction submitted...",
            })
            
            // Wait for triple confirmation
            const tripleReceipt = await waitForTransactionReceipt(tripleTxHash as Hex)
            console.log('Triple creation receipt:', tripleReceipt)
            
            // Parse triple IDs if needed
            const tripleParsedLogs = parseEventLogs({
              abi: INTUITION_TESTNET.CONTRACT_ABI,
              logs: tripleReceipt.logs,
              eventName: 'TripleCreated'
            })
            
            console.log('Created', tripleParsedLogs.length, 'triples')
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
  }, [transactionData, formData, setCreatedAtoms, navigate, sendTransaction, waitForTransactionReceipt, isReady, account])

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