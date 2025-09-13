import { CardDescription, CardFooter, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CardHeader } from "../ui/card"
import { Separator } from "../ui/separator"
import { FormDescription, FormMessage } from "../ui/form"
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"
import { FetchedAtomSummaryCard } from "../AtomSummary"

type AddNicknameBasicProps = {
  dismissDialog: () => void
  form: any
  onNext: () => void
  atom: any
}

export const AddNicknameBasic = ({ dismissDialog, form, onNext, atom }: AddNicknameBasicProps) => {
  console.log('AddNicknameBasic atom', atom)
  // 26813 = has nickname
  return (
    <div className="flex flex-col justify-between">
      <CardHeader id="add-nickname-basic" className="mb-6">
        <CardTitle>Add nickname</CardTitle>
        <CardDescription>
          Choose a nickname for this atom:
        </CardDescription>
      </CardHeader>

      <div className='form-content flex flex-row gap-8'>
        <div className='form-input-container flex-1'>
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a nickname or alias" {...field} />
                </FormControl>
                <FormDescription>
                  Short nicknames work best
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator orientation="vertical" className="h-auto" />
        <div className="form-output flex-1">
          {atom ? (
            <FetchedAtomSummaryCard atomData={atom} nickname={form.watch('nickname')} isEditable />
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      </div>

      <CardFooter className="flex flex-row justify-end gap-2 mt-12 pb-0 pr-0">
        <Button onClick={dismissDialog} variant="secondary">
          Cancel
        </Button>
        <Button onClick={onNext} className="min-w-[90px]">
          Next
        </Button>
      </CardFooter>
    </div>
  )
}