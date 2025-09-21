import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/create-atom/image')({
  component: ImageStep,
})

function ImageStep() {
  const navigate = useNavigate()
  const { formData, setFormData } = useCreateAtom()

  useEffect(() => {
    if (!formData.imageName) {
      setFormData({ 
        imageName: `Image of ${formData.socialAtomName}`,
        imageDescription: `Profile image for ${formData.socialAtomName}`
      })
    }
  }, [formData.socialAtomName, formData.imageName, setFormData])

  const handleNext = () => {
    // Validate fields
    if (!formData.imageUrl || !formData.imageName || !formData.imageDescription) {
      toast.error('Please fill in all fields')
      return
    }

    // Validate URL
    try {
      new URL(formData.imageUrl)
    } catch {
      toast.error('Please enter a valid URL')
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

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Profile Image</CardTitle>
          <CardDescription>
            Add an image to represent this social media profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ imageUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Direct link to the profile image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageName">Image Name</Label>
            <Input
              id="imageName"
              value={formData.imageName || ''}
              onChange={(e) => setFormData({ imageName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this image
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageDescription">Image Description</Label>
            <Textarea
              id="imageDescription"
              rows={3}
              value={formData.imageDescription || ''}
              onChange={(e) => setFormData({ imageDescription: e.target.value })}
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
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
} 