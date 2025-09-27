import React, { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { toast } from '~/hooks/use-toast'
import type { SocialAtomFormData } from '../types'

interface BasicInfoStepProps {
  data: Partial<SocialAtomFormData>
  onNext: (data: Partial<SocialAtomFormData>) => void
}

export function BasicInfoStep({ data, onNext }: BasicInfoStepProps) {
  const [localData, setLocalData] = useState<Partial<SocialAtomFormData>>({
    platform: data.platform || 'x.com',
    username: data.username || '',
    socialAtomName: data.socialAtomName || '',
    socialAtomDescription: data.socialAtomDescription || '',
    hasImage: data.hasImage || false,
    hasIdentity: data.hasIdentity || false,
  })
  
  // Set initial values based on platform and username
  useEffect(() => {
    if (!localData.socialAtomName && localData.username && localData.platform) {
      setLocalData(prev => ({
        ...prev,
        socialAtomName: `${localData.platform}:${localData.username}`,
        socialAtomDescription: `Social media profile for @${localData.username} on ${localData.platform}`
      }))
    }
  }, [])
  
  const handleNext = () => {
    // Validate required fields
    if (!localData.socialAtomName || !localData.socialAtomDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    onNext(localData)
  }
  
  const updateField = (field: keyof SocialAtomFormData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Social Media Atom</CardTitle>
          <CardDescription>
            Create an atom for the social media profile {localData.username ? `@${localData.username}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socialAtomName">Profile Name</Label>
            <Input 
              id="socialAtomName"
              value={localData.socialAtomName || ''}
              onChange={(e) => updateField('socialAtomName', e.target.value)}
              placeholder="e.g., x.com:elonmusk"
            />
            <p className="text-xs text-muted-foreground">
              The unique identifier for this social media profile
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialAtomDescription">Description</Label>
            <Textarea 
              id="socialAtomDescription"
              value={localData.socialAtomDescription || ''}
              onChange={(e) => updateField('socialAtomDescription', e.target.value)}
              rows={3}
              placeholder="Describe this social media profile"
            />
            <p className="text-xs text-muted-foreground">
              Describe this social media profile
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
          <CardDescription>
            Would you like to add more information?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasImage"
              checked={localData.hasImage}
              onCheckedChange={(checked) => updateField('hasImage', !!checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="hasImage" className="font-normal cursor-pointer">
                Add a profile image
              </Label>
              <p className="text-xs text-muted-foreground">
                Add an image atom and link it to this profile
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasIdentity"
              checked={localData.hasIdentity}
              onCheckedChange={(checked) => updateField('hasIdentity', !!checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="hasIdentity" className="font-normal cursor-pointer">
                I know the real-world identity
              </Label>
              <p className="text-xs text-muted-foreground">
                Create an atom for the person/organization behind this profile
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
} 