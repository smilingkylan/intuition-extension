import { Button } from '../ui/button'
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { VerticalTriple } from '../VerticalTriple'

export const CompleteTripleAddressBasic = ({
  onNext,
  dismissDialog,
  adjustedAtomsData,
}: {
  onNext: () => void
  dismissDialog: () => void
  adjustedAtomsData: any[]
}) => {

  const onClickCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dismissDialog()
  }

  return (
    <div className="flex flex-col justify-between">
      <CardHeader id="complete-triple-basic" className="mb-6">
        <CardTitle>Complete Address Triple</CardTitle>
        <CardDescription>
          You are about to create a triple with the following atoms:
        </CardDescription>
      </CardHeader>

      <VerticalTriple atomsData={adjustedAtomsData} />

      <CardFooter className="flex flex-row justify-end gap-2 pt-4">
        <Button onClick={onClickCancel} variant="secondary">
          Cancel
        </Button>
        <Button onClick={onNext} className="min-w-[90px]">
          Next
        </Button>
      </CardFooter>
    </div>
  )
}
