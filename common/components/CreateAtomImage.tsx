import { Button } from '@/common/components/ui/button'
import { debounce, uploadImage } from '@/common/util'
import { CircleXIcon, Loader2Icon, PlusIcon, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'

// way to submit image
// server scrape, text input, pasted blob, drag + drop, 'upload' button
export const CreateAtomImage = ({
  atom,
  form,
  onClickCancel,
  onClickBack,
  onClickNext,
  fetchImage,
  onClickSkip,

}: {
  atom: any
  form: any
  onClickCancel?: () => void
  onClickBack?: () => void
  onClickNext: () => void
  onClickSkip?: () => void
  fetchImage?: () => Promise<string>
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [urlToFetch, setUrlToFetch] = useState<string | null>(
    form.watch('associated_image_url')
  )

  const onClickUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setIsProcessing(true)
    if (file) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        const { ipfsHash } = await uploadImage(formData)
        const url = `https://ipfs.io/ipfs/${ipfsHash}`
        form.setValue('associated_image_url', url)
        setUrlToFetch(url)
      } catch (error) {
        console.error('Error uploading file:', error)
        toast.error('Error uploading file')
      } finally {
        setIsProcessing(false)
      }
    }
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!fetchImage) return
    const fethImageAndSetUrl = async () => {
      const url = await fetchImage()
      setUrlToFetch(url)
    }
    fethImageAndSetUrl()
  }, [])

  const updateUrlToFetch = useCallback(
    debounce((url: string) => {
      setUrlToFetch(url)
    }, 1000),
    [] // Empty dependency array since setUrlToFetch is stable
  )

  const onImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const input = e.target.value
    form.setValue('associated_image_url', input)
    // make sure input is valid URL
    try {
      new URL(input)
      updateUrlToFetch(input)
    } catch (error) {
      console.error('Invalid URL:', error)
      toast.error('Invalid URL')
      return
    }
  }

  const isUploadTextInputDisabled = isProcessing
  const isUploadDisabled = false

  const onImageUrlPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsProcessing(true)
    try {
      const items = e.clipboardData.items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            // get file extension
            const extension = blob.name.split('.').pop()
            // create local temp file and upload
            const tempFile = new File([blob], `temp.${extension}`, {
              type: `image/${extension}`,
            })
            const formData = new FormData()
            formData.append('image', tempFile)
            const { ipfsHash } = await uploadImage(formData)
            const url = `https://ipfs.io/ipfs/${ipfsHash}`
            form.setValue('associated_image_url', url)
            setUrlToFetch(url)
          }
          break // Assuming you only want to handle the first image found
        }
      }
    } catch (err) {
      console.error('Error onImageUrlPaste', err)
      toast.error('Error pasting image')
    } finally {
      setIsProcessing(false)
    }
  }

  const isNextDisabled = isProcessing || !form.watch('associated_image_url')

  return (
    <CardContent className="flex flex-col gap-4 justify-between">
      <CardHeader className="px-0 pb-0">
        <CardTitle className="">Add Image</CardTitle>
        <CardDescription>
          Give this image a title and description
        </CardDescription>
      </CardHeader>
      <div className="flex flex-row gap-8">
        <div className="flex-1 space-y-4">
          <FormField
            control={form.control}
            name="associated_image_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a title for this image"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is how users will identify this image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="associated_image_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a description"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use concise and neutral language
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="associated_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div className="file-input flex flex-row items-center gap-2">
                    <Input
                      placeholder="Add an image"
                      {...field}
                      disabled={isUploadTextInputDisabled}
                      onChange={onImageUrlChange}
                      onPaste={onImageUrlPaste}
                    />
                    <Button
                      onClick={onClickUpload}
                      variant="ghost"
                      color="gray"
                      size="icon"
                      disabled={isUploadDisabled}
                    >
                      <UploadIcon className="size-4" />
                    </Button>
                    {form.watch('associated_image_url') && (
                      <Button
                        onClick={() =>
                          form.setValue('associated_image_url', '')
                        }
                        variant="ghost"
                        color="gray"
                        size="icon"
                      >
                        <CircleXIcon className="size-4" />
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter an image URL, upload, or paste an image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="image flex flex-1 justify-center items-center">
          {isProcessing ? (
            <div className="w-[200px] h-[200px] dark:bg-gray-900 bg-gray-200 flex items-center justify-center">
              <Loader2Icon className="size-8 animate-spin" />
            </div>
          ) : form.watch('associated_image_url') ? (
            <img
              src={urlToFetch}
              alt={form.watch('associated_image_name')}
              className="w-[200px] h-[200px] object-contain"
            />
          ) : (
            <div>
              <Button
                onClick={onClickUpload}
                variant="ghost"
                className="w-[200px] h-[200px] dark:bg-gray-900 bg-gray-200 flex items-center justify-center"
              >
                <PlusIcon color="gray" size={64} />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-row items-stretch justify-end gap-2 pt-4">
        {onClickCancel && (
          <Button
            onClick={onClickCancel}
            type="button"
            variant="secondary"
            color="gray"
          >
            Cancel
          </Button>
        )}
        {onClickBack && (
          <Button
            onClick={onClickBack}
            type="button"
            variant="secondary"
            color="gray"
          >
            Back
          </Button>
        )}
        <Button onClick={onClickNext} type="button" disabled={isNextDisabled}>
          Next
        </Button>
        {onClickSkip && (
          <Button
            onClick={onClickSkip}
            type="button"
            variant="ghost"
            color="gray"
            disabled={isProcessing}
          >
            Skip
          </Button>
        )}
      </div>
    </CardContent>
  )
}
