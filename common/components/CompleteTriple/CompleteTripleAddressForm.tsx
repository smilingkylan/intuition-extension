import { useEffect, useState } from 'react'
import { Form } from '@/common/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  fetchContractCode,
  getAtomBoilerplateAtomByType,
  graphQLQuery,
  fetchAtomsByIds,
  checkTripleExistsByEvmAddress,
} from '~/util'
import { toast } from 'sonner'
import {
  CompleteTripleConfirm,
  CompleteTripleSuccess,
} from '~/components/CompleteTriple'
import { CreateTripleStakeAmount } from '~/components/CreateTripleStake/CreateTripleStakeAmount'
import { usePublicClient, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { Multivault } from '~/util/multivault'
import { CompleteTripleAddressBasic } from './CreateTripleAddressBasic'
import { CompleteTripleNextSteps } from './CompleteTripleNextSteps'
import { useQuery } from '@tanstack/react-query'

const wait = async (delayMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

export enum CompleteTripleSteps {
  Address = 'address',
  Staking = 'staking',
  Confirm = 'confirm',
  Success = 'success',
}

const formSchema = z.object({
  name: z.string().trim().min(1),
  stakeAmount: z.number().min(0.0004),
  shouldStake: z.boolean().default(false),
})

// todo: should check for existence of missing address atom first
// since it will error if it already exists
export const CompleteTripleAddressForm = ({
  atomType,
  preChosenAtomIds,
  pop,
  chain_id,
  onTripleExists,
  ...rest
}: {
  chain_id?: string
  atomType: string
  onTripleExists: (tripleId: string) => void
  preChosenAtomIds: string[]
  pop?: () => void
}) => {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const MultivaultInstance = new Multivault({
    publicClient,
    walletClient: walletClient as any,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [finalData, setFinalData] = useState<any>({})
  const [atomsData, setAtomsData] = useState<any[]>([])
  const [adjustedAtomsData, setAdjustedAtomsData] = useState<any[]>([])
  const [step, setStep] = useState<CompleteTripleSteps>(
    CompleteTripleSteps.Address
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stakeAmount: 0.0004,
      shouldStake: false,
    },
  })

  // check if triple already exists
  const { data: tripleData, refetch } = useQuery({
    queryKey: ['checkTripleExistsByEvmAddress', rest.atom_type, chain_id],
    queryFn: () => {
      return graphQLQuery(checkTripleExistsByEvmAddress, {
        label: rest[rest.atom_type],
        predicateId: preChosenAtomIds[1],
        objectId: preChosenAtomIds[2],
      })
    },
    select: (data) => {
      return data.data.triples[0]
    },
  })

  const fetchAtomsData = async (atomIds: string[]) => {
    try {
      const adjustedAtomIds = atomIds.filter((id) => !!id)
      const {
        data: { atoms },
      } = await graphQLQuery(fetchAtomsByIds, {
        atomIds: adjustedAtomIds,
      })
      const orderedAtomsData = atomIds.map((id) =>
        atoms.find((atom) => atom.term_id === id)
      )
      return orderedAtomsData
    } catch (err) {
      console.error('Error fetching atoms data', err)
      toast.error('Error fetching atoms data')
    }
  }

  const getContractCode = async (
    address: `caip10:eip155:${string}:0x${string}` | `0x${string}`,
    chain_id?: string
  ) => {
    const isCaipAddress = address.startsWith('caip10:')
    let addressToUse = address
    if (isCaipAddress) {
      addressToUse = address.split(':')[3] as `0x${string}`
    }
    const contractCode = await fetchContractCode(addressToUse, chain_id)
    const isContract = contractCode !== '0x'
    return isContract
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    let atomVaultId = finalData.atomVaultId
    let atomHash = finalData.atomHash
    // Check if we need to create an atom (missing from DB AND not already created)
    if (atomsData.some((atom) => !atom) && !finalData.atomVaultId) {
      const response = await createAtom(form.watch('name'))
      atomVaultId = response?.vaultId?.toString()
      atomHash = response?.hash?.toString()
      setFinalData({ atomVaultId, atomHash })
    }
    // pass in all three atomIds here
    const finalAtomIds = preChosenAtomIds.map((id) =>
      id ? BigInt(id) : BigInt(atomVaultId)
    )
    await wait(2000)
    const { vaultId: tripleVaultId, hash: tripleHash } =
      await createTripleAndStake(finalAtomIds)
    setFinalData({ atomVaultId, atomHash, tripleVaultId, tripleHash })
    setIsProcessing(false)
    setStep(CompleteTripleSteps.Success)
  }

  const createAtom = async (uri: string) => {
    try {
      const atomResponse = await MultivaultInstance?.createAtom({
        uri,
        wait: true,
      })
      return atomResponse
    } catch (err) {
      console.error('Error creating atom or triple and staking', err)
      toast.error(
        // todo: need more specific error message(s)
        'Error creating atom.'
      )
      setFinalData({})
      setIsProcessing(false)
    }
  }

  const createTripleAndStake = async (finalAtomIds: string[]) => {
    try {
      const stakeAmountBigInt = parseEther(form.watch('stakeAmount').toString())
      const payload = {
        subjectId: finalAtomIds[0],
        predicateId: finalAtomIds[1],
        objectId: finalAtomIds[2],
        initialDeposit: form.watch('shouldStake') && stakeAmountBigInt,
        wait: true,
      }
      const tripleResponse = await MultivaultInstance?.createTriple(payload)
      return tripleResponse
    } catch (err) {
      console.error('Error creating triple and staking', err)
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (tripleData) {
      onTripleExists(tripleData.term_id)
    }
  }, [tripleData])

  useEffect(() => {
    const queryAtomIds = rest.atomIds?.split(',')
    const fetchData = async () => {
      setIsProcessing(true)
      try {
        const atomsPromise = fetchAtomsData(queryAtomIds || preChosenAtomIds)
        const isContractPromise = getContractCode(
          rest[rest.atom_type],
          chain_id
        )
        const [atomsData, isContract] = await Promise.all([
          atomsPromise,
          isContractPromise,
        ])
        setAtomsData(atomsData)
        let addressToUse = rest[rest.atom_type]
        if (!isContract) {
          if (addressToUse.startsWith('caip10:')) {
            const addressParts = addressToUse.split(':')
            const lastIndex = addressParts.length - 1
            addressToUse = addressParts[lastIndex]
          }
        }
        form.setValue('name', addressToUse)
        const newAdjustedAtomsData = atomsData.map((atom) => {
          if (!atom) {
            return getAtomBoilerplateAtomByType(rest.atom_type, {
              evm_address: addressToUse,
            })
          }
          return atom
        })
        setAdjustedAtomsData(newAdjustedAtomsData)
      } catch (err) {
        console.error('Error fetching data', err)
        toast.error('Error fetching data')
      } finally {
        setIsProcessing(false)
      }
    }
    fetchData()
  }, [preChosenAtomIds])

  let componentToShow = null

  switch (step) {
    case CompleteTripleSteps.Address:
      componentToShow = (
        <CompleteTripleAddressBasic
          adjustedAtomsData={adjustedAtomsData}
          dismissDialog={pop}
          onNext={() => setStep(CompleteTripleSteps.Staking)}
          {...rest}
        />
      )
      break
    case CompleteTripleSteps.Staking:
      componentToShow = (
        <CreateTripleStakeAmount
          onNext={() => setStep(CompleteTripleSteps.Confirm)}
          onBack={() => setStep(CompleteTripleSteps.Address)}
          onSkip={() => setStep(CompleteTripleSteps.Confirm)}
          cancelSyntax={'Back'}
          nextSyntax={'Next'}
          form={form}
        />
      )
      break
    case CompleteTripleSteps.Confirm:
      componentToShow = (
        <CompleteTripleConfirm
          form={form}
          adjustedAtomsData={adjustedAtomsData}
          dismissDialog={pop}
          onBack={() => setStep(CompleteTripleSteps.Staking)}
          onNext={handleSubmit}
          isProcessing={isProcessing}
          finalData={finalData}
        />
      )
      break
    case CompleteTripleSteps.Success:
      componentToShow = (
        <CompleteTripleSuccess
          finalData={finalData}
          nextSteps={
            <CompleteTripleNextSteps atomId={finalData.atomVaultId} pop={pop} />
          }
        />
      )
      break
    default:
      throw new Error(`Unknown step: ${step}`)
  }

  return (
    <div className="min-w-[500px] flex flex-col gap-4">
      <Form {...form}>
        <form>{componentToShow}</form>
      </Form>
    </div>
  )
}
