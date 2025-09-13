import { Form } from '~/components/ui/form'
import { CreateAtomImage } from '~/components/CreateAtomImage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CreateTripleStakeAmount } from '../CreateTripleStake/CreateTripleStakeAmount'
import { AddRelatedImageSuccess } from './AddRelatedImageSuccess'
import { usePublicClient, useWalletClient } from 'wagmi'
import { Multivault } from '~/util/multivault'
import { parseUnits } from 'viem'
import { uploadJSONToIPFS } from '~/util'
import { CompleteTripleConfirm } from '../CompleteTriple/CompleteTripleConfirm'

const wait = async (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

const formSchema = z.object({
  associated_image_url: z.string().min(1).url(),
  associated_image_name: z.string().min(1),
  associated_image_description: z.string().min(1),
  stakeAmount: z.number().min(0.0004),
  shouldStake: z.boolean().default(false),
})

export enum AddRelatedImageFormSteps {
  Image = 'image',
  Stake = 'stake',
  Confirm = 'confirm',
  Success = 'success',
}

const getAtomJson = (form: any) => {
  return {
    '@type': 'Thing',
    '@context': 'https://schema.org',
    name: form.watch('associated_image_name'),
    description: form.watch('associated_image_description'),
    image: form.watch('associated_image_url'),
  }
}

export const AddRelatedImageForm = ({
  identityAtom,
  hasImageAtom,
  onSuccess,
  dismissDialog,
}: {
  identityAtom: any
  hasImageAtom: any
  onSuccess?: () => void
  dismissDialog: () => void
}) => {
  const [step, setStep] = useState(AddRelatedImageFormSteps.Image)
  const [finalData, setFinalData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const MultivaultInstance = new Multivault({
    publicClient,
    walletClient: walletClient as any,
  })
  const atomName = identityAtom?.label

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      associated_image_url: '',
      associated_image_name: '',
      associated_image_description: '',
      stakeAmount: 0.0004,
      shouldStake: false,
    },
  })

  useEffect(() => {
    if (identityAtom) {
      form.setValue('associated_image_name', `Image of ${atomName}`)
      form.setValue('associated_image_description', `${atomName} image`)
    }
  }, [identityAtom])

  const createAtom = async () => {
    const atomData = getAtomJson(form)
    const uploadResponse = await uploadJSONToIPFS([atomData])
    const uploadObject = uploadResponse[0]
    const { IpfsHash } = uploadObject

    const atomResponse = await MultivaultInstance.createAtom({
      uri: `ipfs://${IpfsHash}` as string,
      wait: true,
    })
    setFinalData({
      atomVaultId: atomResponse.vaultId,
      atomTxHash: atomResponse.hash,
    })
    await publicClient?.waitForTransactionReceipt({ hash: atomResponse.hash })
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
      subjectId: BigInt(identityAtom.term_id),
      predicateId: BigInt(hasImageAtom.term_id),
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
        console.error('AddRelatedImageForm->onSubmit->createAtom', err)
        toast.error('Failed to create atom')
        setIsProcessing(false)
        return
      }
    }

    try {
      wait(2000)
      await createTriple(atomVaultId)
    } catch (err) {
      console.error('AddRelatedImageForm->onSubmit->createTriple', err)
      toast.error('Failed to create triple')
      setIsProcessing(false)
      return
    }

    setStep(AddRelatedImageFormSteps.Success)
    setIsProcessing(false)
  }

  const onStakeClickNext = () => {
    form.setValue('shouldStake', true)
    setStep(AddRelatedImageFormSteps.Confirm)
  }

  let componentToShow
  switch (step) {
    case AddRelatedImageFormSteps.Image:
      componentToShow = (
        <CreateAtomImage
          form={form}
          atom={identityAtom}
          // fetchImage={fetchScreenshot}
          onClickCancel={dismissDialog}
          onClickNext={() => setStep(AddRelatedImageFormSteps.Stake)}
          // types={{ screenshot: false, url: true, dnd: true, blob: true }}
        />
      )
      break
    case AddRelatedImageFormSteps.Stake:
      componentToShow = (
        <CreateTripleStakeAmount
          form={form}
          onBack={() => setStep(AddRelatedImageFormSteps.Image)}
          onNext={onStakeClickNext}
          onSkip={() => setStep(AddRelatedImageFormSteps.Confirm)}
        />
      )
      break
    case AddRelatedImageFormSteps.Confirm:
      componentToShow = (
        <CompleteTripleConfirm
          form={form}
          onBack={() => setStep(AddRelatedImageFormSteps.Stake)}
          onNext={submit}
          finalData={finalData}
          isProcessing={isProcessing}
          adjustedAtomsData={[
            identityAtom,
            hasImageAtom,
            { label: form.watch('associated_image_name') },
          ]}
        />
      )
      break
    case AddRelatedImageFormSteps.Success:
      componentToShow = <AddRelatedImageSuccess finalData={finalData} />
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
