import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { parseUnits } from 'viem'
import { z } from 'zod'
import { sendToBackground } from '@plasmohq/messaging'
import { Form } from '../ui/form'
import { StakeAtomAmount } from './StakeAtomAmount'
import { StakeAtomSuccess } from './StakeAtomSuccess'

enum StakeAtomSteps {
  Amount = 'amount',
  Success = 'success',
}

const formSchema = z.object({
  stakeAmount: z
    .number()
    .min(0.0004, 'Stake amount must be at least 0.0004 ETH')
    .positive('Stake amount must be positive'),
})

export const StakeAtomForm = ({
  dialogComponents,
  setDialogComponents,
  atom,
  getAtoms,
  ...props
}) => {
  const [step, setStep] = useState(StakeAtomSteps.Amount)
  const [stakeAmount, setStakeAmount] = useState(0.0004)
  const [finalData, setFinalData] = useState(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stakeAmount: 0.0004,
    },
  })

  const onClickCancel = () => {
    const newDialogComponents = [...dialogComponents]
    newDialogComponents.pop()
    setDialogComponents(newDialogComponents)
  }
  const handleStakeAmountChange = (amount: number) => {
    setStakeAmount(amount)
  }

  const handleSubmit = async () => {
    const serializedAmount = stakeAmount.toString()
    const bigIntAmount = parseUnits(serializedAmount, 18)
    try {
      const response = await sendToBackground({
        name: 'web3',
        body: {
          method: 'depositAtom',
          params: [atom.id, bigIntAmount.toString()],
        },
      })
      console.log(
        'StakeAtomForm depositAtom response',
        JSON.stringify(response)
      )
      if (response.error) throw new Error(response.error)
      setStep(StakeAtomSteps.Success)
      setFinalData({
        txHash: response.hash,
        atomVaultId: atom.id,
      })
      toast.success('Atom staked successfully')
      getAtoms()
      setTimeout(getAtoms, 3000)
      setTimeout(getAtoms, 7000)
      setTimeout(getAtoms, 12000)
    } catch (err) {
      toast.error('Error staking atom')
      console.error('StakeAtomForm err', err)
    }
  }

  let componentToShow = null
  switch (step) {
    case StakeAtomSteps.Amount:
      componentToShow = (
        <StakeAtomAmount
          {...props}
          form={form}
          setStep={onClickCancel}
          onStakeAmountChange={handleStakeAmountChange}
          cancelSyntax="Cancel"
        />
      )
      break
    case StakeAtomSteps.Success:
      componentToShow = <StakeAtomSuccess {...props} summary={finalData} />
      break
  }

  // Form and form is self-contained in Amount step
  return (
    <div className="min-w-[500px] flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {componentToShow}
        </form>
      </Form>
    </div>
  )
}
