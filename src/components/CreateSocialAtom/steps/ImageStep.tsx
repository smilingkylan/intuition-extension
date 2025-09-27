import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { toast } from '~/hooks/use-toast'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage } from '~/util/fetch'
import { cn } from '~/lib/utils'
import type { SocialAtomFormData } from '../types'

interface ImageStepProps {
  data: Partial<SocialAtomFormData>
  onNext: (data: Partial<SocialAtomFormData>) => void
  onBack: () => void
}

export function ImageStep({ data, onNext, onBack }: ImageStepProps) {
  const [localData, setLocalData] = useState<Partial<SocialAtomFormData>>({
    ...data,
    imageName: data.imageName || `Image of ${data.socialAtomName}`,
    imageDescription: data.imageDescription || `Profile image for ${data.socialAtomName}`,
    imageUrl: data.imageUrl || '',
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial preview if imageUrl exists
    if (localData.imageUrl && !preview) {
      setPreview(localData.imageUrl)
    }
  }, [localData.imageUrl, preview])

  const updateField = (field: keyof SocialAtomFormData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }

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
      
      updateField('imageUrl', ipfsUrl)
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
      updateField('imageUrl', text)
      setPreview(text)
    }
  }, [])

  const handleNext = () => {
    // Validate fields
    if (!localData.imageUrl || !localData.imageName || !localData.imageDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    onNext(localData)
  }

  const clearImage = () => {
    setPreview(null)
    updateField('imageUrl', '')
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading to IPFS...</p>
              </div>
            ) : preview ? (
              <div className="relative w-full h-full">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-contain max-h-[300px]"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  You can also paste an image or URL
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
            
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
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Or enter image URL</Label>
            <Input
              id="imageUrl"
              value={localData.imageUrl || ''}
              onChange={(e) => {
                const url = e.target.value
                updateField('imageUrl', url)
                if (isValidImageUrl(url)) {
                  setPreview(url)
                } else if (!url) {
                  setPreview(null)
                }
              }}
              onPaste={handlePaste}
              placeholder="https://example.com/image.jpg or ipfs://..."
            />
          </div>

          {/* Image Details */}
          <div className="space-y-2">
            <Label htmlFor="imageName">Image Name</Label>
            <Input
              id="imageName"
              value={localData.imageName || ''}
              onChange={(e) => updateField('imageName', e.target.value)}
              placeholder="e.g., Profile picture of @username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              value={localData.imageDescription || ''}
              onChange={(e) => updateField('imageDescription', e.target.value)}
              rows={3}
              placeholder="Describe this image"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={isUploading}>
          Continue
        </Button>
      </div>
    </div>
  )
} 