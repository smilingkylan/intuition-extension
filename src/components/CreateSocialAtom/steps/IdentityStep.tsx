import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { toast } from '~/hooks/use-toast'
import type { SocialAtomFormData } from '../types'

interface IdentityStepProps {
  formData: Partial<SocialAtomFormData>
  onNext: (data: Partial<SocialAtomFormData>) => void
  onBack: () => void
}

export function IdentityStep({ formData, onNext, onBack }: IdentityStepProps) {
  const [localData, setLocalData] = useState<Partial<SocialAtomFormData>>({
    identityType: formData.identityType || 'Person',
    identityName: formData.identityName || '',
    identityDescription: formData.identityDescription || '',
  })

  const handleNext = () => {
    if (!localData.identityName || !localData.identityDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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
          <CardTitle>Real-World Identity</CardTitle>
          <CardDescription>
            Who is the real person or organization behind this profile?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Identity Type</Label>
            <RadioGroup
              value={localData.identityType}
              onValueChange={(value) => setLocalData(prev => ({ ...prev, identityType: value as 'Person' | 'Organization' }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Person" id="person" />
                <Label htmlFor="person" className="font-normal cursor-pointer">
                  Person
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Organization" id="organization" />
                <Label htmlFor="organization" className="font-normal cursor-pointer">
                  Organization
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityName">
              {localData.identityType === 'Person' ? 'Person Name' : 'Organization Name'}
            </Label>
            <Input
              id="identityName"
              value={localData.identityName || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, identityName: e.target.value }))}
              placeholder={localData.identityType === 'Person' ? 'John Doe' : 'Acme Corporation'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityDescription">Description</Label>
            <Textarea
              id="identityDescription"
              value={localData.identityDescription || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, identityDescription: e.target.value }))}
              rows={3}
              placeholder={`Describe this ${localData.identityType.toLowerCase()}`}
            />
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