import { Button } from '../ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { VerticalTriple } from '../VerticalTriple'
import { useEffect } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { emulateIncompleteTriple } from '@/common/util/intuition'

export const CompleteTripleBasic = ({
  atomsData,
  form,
  preChosenAtomIds,
  atomType,
  onNext,
  dismissDialog,
  setAdjustedAtomsData,
  adjustedAtomsData,
  ...rest
}: {
  atomsData: any[]
  form: any
  preChosenAtomIds: string[]
  atomType: string
  onNext: () => void
  dismissDialog: () => void
  setAdjustedAtomsData: (atomsData: any[]) => void
  adjustedAtomsData: any[]
}) => {
  const onClickCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dismissDialog()
  }

  const onClickNext = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (preChosenAtomIds.length === 3) return onNext()
    const isValid = await form.trigger(['name', 'description'])
    if (isValid) {
      onNext() // go to next step
    }
  }

  useEffect(() => {
    // there may not be a missing atom
    let missingAtomName = ''
    const { atomsData: adjustedAtomsData, missingAtom } =
      emulateIncompleteTriple(atomsData, atomType, rest)
    setAdjustedAtomsData(adjustedAtomsData)
    missingAtomName = missingAtom?.atomIpfsData?.contents?.name || ''
    form.setValue('name', missingAtomName)
  }, [atomsData])

  return (
    <div className="flex flex-col justify-between">
      <CardHeader id="complete-triple-basic1">
        <CardTitle>Complete Triple Basic Info</CardTitle>
        <CardDescription>
          Add a name and description for this atom to complete the triple
        </CardDescription>
      </CardHeader>

      <VerticalTriple atomsData={adjustedAtomsData} />
      {preChosenAtomIds.some((id) => !id) && (
        <CardContent className="flex flex-col w-full gap-4 mt-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="0x..." {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a description for this atom"
                    {...field}
                    disabled={false}
                  />
                </FormControl>
                <FormDescription>
                  Try to be objective and concise
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      )}

      <CardFooter className="flex flex-row justify-end gap-2 pb-0 pt-8 pr-0">
        <Button onClick={onClickCancel} variant="secondary">
          Cancel
        </Button>
        <Button onClick={onClickNext} className="min-w-[90px]">
          Next
        </Button>
      </CardFooter>
    </div>
  )
}
