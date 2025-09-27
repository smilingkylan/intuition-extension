import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { toast } from '~/hooks/use-toast'
import type { SocialAtomFormData } from '../types'

interface ImageStepProps {
  formData: Partial<SocialAtomFormData>
  onNext: (data: Partial<SocialAtomFormData>) => void
  onBack: () => void
}

export function ImageStep({ formData, onNext, onBack }: ImageStepProps) {
  const [localData, setLocalData] = useState<Partial<SocialAtomFormData>>({
    imageUrl: formData.imageUrl || '',
    imageDescription: formData.imageDescription || '',
  })

  const handleNext = () => {
    if (!localData.imageUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide an image URL",
        variant: "destructive"
      })
      return
    }

    onNext({
      ...formData,
      ...localData,
    })
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Profile Image</CardTitle>
          <CardDescription>
            Add an image to associate with this social media profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={localData.imageUrl || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of the profile image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              value={localData.imageDescription || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, imageDescription: e.target.value }))}
              rows={3}
              placeholder="Describe this image"
            />
            <p className="text-xs text-muted-foreground">
              Optional description for the image
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
} 