import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AddNicknameBasic } from "./AddNicknameBasic"
import { fetchAtomsByIds, getAtomById, graphQLQuery, Multivault, uploadJSONToIPFS } from "~/util"
import { Form } from "~/components/ui/form"
import { CreateTripleStakeAmount } from "../CreateTripleStake/CreateTripleStakeAmount"
import { CompleteTripleConfirm, CompleteTripleSuccess } from "../CompleteTriple"
import { useQuery } from "@tanstack/react-query"
import { CONFIG } from "~/constants/web3"
import { toast } from "sonner"
import { usePublicClient, useWalletClient } from "wagmi"
import { parseUnits } from "viem"

const { HAS_NICKNAME_ATOM_ID } = CONFIG

const thingJsonSchema = {
  '@type': 'Thing',
  '@context': 'https://schema.org',
}

export enum AddNicknameFormSteps {
  Basic = 'basic',
  Stake = 'stake',
  Confirm = 'confirm',
  Success = 'success',
}

const formSchema = z.object({
  nickname: z.string().min(1),
  stakeAmount: z.number().min(0.0004),
  shouldStake: z.boolean().default(false),
})

export const AddNicknameForm = ({ atomId, dismissDialog }: { atomId: string, dismissDialog: () => void }) => {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const MultivaultInstance = new Multivault({
    publicClient,
    walletClient: walletClient as any,
  })
  const [step, setStep] = useState(AddNicknameFormSteps.Basic)
  const [finalData, setFinalData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [atom, setAtom] = useState<any>(null)
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      stakeAmount: 0.0004,
      shouldStake: false,
    },
  })

  const { data: atoms } = useQuery({
    queryKey: ['atoms', atomId],
    queryFn: async () =>
      await graphQLQuery(fetchAtomsByIds, {
        atomIds: [Number(atomId), Number(HAS_NICKNAME_ATOM_ID)],
      }),
    enabled: !!atomId && !!HAS_NICKNAME_ATOM_ID,
    staleTime: 60000,
    select: ({ data: { atoms } }) => {
      console.log('multiple atoms query atoms', atoms)
      const hasNicknameAtom = atoms.find(
        (atom) => atom.term_id === HAS_NICKNAME_ATOM_ID
      )
      const identityAtom = atoms.find((atom) => atom.term_id === atomId)
      return { identityAtom, hasNicknameAtom }
    },
  })

  useEffect(() => {
    const fetchAtom = async () => {
      const {
        data: { atoms },
      } = await graphQLQuery(getAtomById, { atomId: Number(atomId) })
      setAtom(atoms[0])
    }
    fetchAtom()
  }, [])

  const createAtom = async () => {
    const nicknameAtomData = {
      ...thingJsonSchema,
      name: form.watch('nickname'),
    }
    const uploadResponse = await uploadJSONToIPFS([nicknameAtomData])
    const uploadObject = uploadResponse[0]
    const { IpfsHash } = uploadObject
    const atomResponse = await MultivaultInstance.createAtom({
      uri: `ipfs://${IpfsHash}` as string,
      wait: true,
    })
    await publicClient?.waitForTransactionReceipt({ hash: atomResponse.hash })
    setFinalData({
      atomVaultId: atomResponse.vaultId,
      atomTxHash: atomResponse.hash,
    })
    return {
      atomVaultId: atomResponse.vaultId,
    }
  }

  const createTriple = async (atomVaultId: bigint) => {
    const stakeAmountBigInt = parseUnits(
      form.watch('stakeAmount').toString(),
      18
    )
    const createTripleParams = {
      subjectId: atoms?.identityAtom.term_id,
      predicateId: HAS_NICKNAME_ATOM_ID,
      objectId: atomVaultId,
      wait: true,
      initialDeposit: form.watch('shouldStake') && stakeAmountBigInt,
    }
    const response = await MultivaultInstance.createTriple(createTripleParams)
    const { vaultId: tripleVaultId, hash: tripleTxHash } = response
    setFinalData((prev) => {
      return {
        ...prev,
        tripleVaultId,
        tripleTxHash,
      }
    })
  }

  const submit = async () => {
    setIsProcessing(true)
    let atomVaultId: null | bigint = finalData?.atomVaultId || null
    if (!atomVaultId) {
      try {
        const atomResponse = await createAtom()
        atomVaultId = atomResponse.atomVaultId
      } catch (err) {
        console.error('AddNicknameForm->onSubmit->createAtom', err)
        toast.error('Failed to create atom')
        setIsProcessing(false)
        return
      }
    }

    try {
      await createTriple(atomVaultId)
    } catch (err) {
      console.error('AddNicknameForm->onSubmit->createTriple', err)
      toast.error('Failed to create triple')
      setIsProcessing(false)
      return
    }

    setStep(AddNicknameFormSteps.Success)
    setIsProcessing(false)
  }

  let componentToShow = null

  switch (step) {
    case AddNicknameFormSteps.Basic:
      componentToShow = (
        <AddNicknameBasic
          dismissDialog={dismissDialog}
          form={form}
          atom={atom}
          onNext={() => setStep(AddNicknameFormSteps.Stake)}
        />
      )
      break
    case AddNicknameFormSteps.Stake:
      componentToShow = (
        <CreateTripleStakeAmount
          onBack={() => setStep(AddNicknameFormSteps.Basic)}
          onNext={() => setStep(AddNicknameFormSteps.Confirm)}
          form={form}
        />
      )
      break
    case AddNicknameFormSteps.Confirm:
      componentToShow = (
        <CompleteTripleConfirm
          form={form}
          onBack={() => setStep(AddNicknameFormSteps.Stake)}
          onNext={submit}
          finalData={finalData}
          isProcessing={isProcessing}
          adjustedAtomsData={[
            atoms?.identityAtom,
            atoms?.hasNicknameAtom,
            { label: form.watch('nickname') },
          ]}
        />
      )
      break
    case AddNicknameFormSteps.Success:
      componentToShow = (
        <CompleteTripleSuccess finalData={finalData} nextSteps={null} />
      )
      break
  }
  return (
    <div className="min-w-[500px] flex flex-col gap-4">
      <Form {...form}>
        <form>{componentToShow}</form>
      </Form>
    </div>    
  )
}