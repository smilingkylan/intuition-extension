import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { toast } from '~/hooks/use-toast'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage } from '~/util/fetch'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/create-atom/image')({
  component: ImageStep,
})

function ImageStep() {
  const navigate = useNavigate()
  const { formData, setFormData } = useCreateAtom()
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!formData.imageName) {
      setFormData({ 
        imageName: `Image of ${formData.socialAtomName}`,
        imageDescription: `Profile image for ${formData.socialAtomName}`
      })
    }
    // Set initial preview if imageUrl exists
    if (formData.imageUrl && !preview) {
      setPreview(formData.imageUrl)
    }
  }, [formData.socialAtomName, formData.imageName, formData.imageUrl, preview, setFormData])

  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsed.pathname) ||
             parsed.hostname.includes('ipfs') ||
             parsed.pathname.includes('/image')
    } catch {
      return false
    }
  }

  const processImageFile = async (file: File) => {
    try {
      setIsUploading(true)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
      
      // Upload to IPFS
      const formData = new FormData()
      formData.append('image', file)
      const { ipfsHash } = await uploadImage(formData)
      const ipfsUrl = `ipfs://${ipfsHash}`
      
      setFormData({ imageUrl: ipfsUrl })
      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully to IPFS",
      })
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image to IPFS",
        variant: "destructive"
      })
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      await processImageFile(imageFile)
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop an image file",
        variant: "destructive"
      })
    }
  }, [])

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) {
          await processImageFile(blob)
        }
        return
      }
    }
    
    // Handle pasted URLs
    const text = e.clipboardData.getData('text')
    if (text && isValidImageUrl(text)) {
      setFormData({ imageUrl: text })
      setPreview(text)
    }
  }, [])

  const handleNext = () => {
    // Validate fields
    if (!formData.imageUrl || !formData.imageName || !formData.imageDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (formData.hasIdentity) {
      navigate({ to: '/create-atom/identity' })
    } else {
      navigate({ to: '/create-atom/review' })
    }
  }

  const handleBack = () => {
    navigate({ to: '/create-atom/' })
  }

  const clearImage = () => {
    setPreview(null)
    setFormData({ imageUrl: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Add Profile Image</CardTitle>
          <CardDescription>
            Add an image to represent this social media profile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Image Upload Zone */}
          <div
            ref={dropZoneRef}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 transition-colors",
              "flex flex-col items-center justify-center min-h-[200px]",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50",
              preview && "p-2"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : preview ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain max-h-[250px] rounded"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drag & drop an image here
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  or paste from clipboard
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) processImageFile(file)
            }}
          />

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Or enter image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl || ''}
              onChange={(e) => {
                const url = e.target.value
                setFormData({ imageUrl: url })
                if (isValidImageUrl(url)) {
                  setPreview(url)
                }
              }}
              onPaste={handlePaste}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Direct link to the profile image or paste an image
            </p>
          </div>

          {/* Image metadata fields */}
          <div className="space-y-2">
            <Label htmlFor="imageName">Image Name</Label>
            <Input
              id="imageName"
              value={formData.imageName || ''}
              onChange={(e) => setFormData({ imageName: e.target.value })}
              placeholder="Enter a name for this image"
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              rows={2}
              value={formData.imageDescription || ''}
              onChange={(e) => setFormData({ imageDescription: e.target.value })}
              placeholder="Describe what this image represents"
            />
            <p className="text-xs text-muted-foreground">
              Describe what this image represents
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!preview || isUploading}>
          Continue
        </Button>
      </div>
    </div>
  )
} 