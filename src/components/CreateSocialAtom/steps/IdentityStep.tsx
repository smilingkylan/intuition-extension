import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { toast } from '~/hooks/use-toast'
import type { SocialAtomFormData } from '../types'

interface IdentityStepProps {
  data: Partial<SocialAtomFormData>
  onNext: (data: Partial<SocialAtomFormData>) => void
  onBack: () => void
}

export function IdentityStep({ data, onNext, onBack }: IdentityStepProps) {
  const [localData, setLocalData] = useState<Partial<SocialAtomFormData>>({
    ...data,
    identityType: data.identityType || 'person',
    identityName: data.identityName || '',
    identityDescription: data.identityDescription || '',
  })
  
  const updateField = (field: keyof SocialAtomFormData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleNext = () => {
    // Validate fields
    if (!localData.identityName || !localData.identityDescription || !localData.identityType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    onNext(localData)
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-World Identity</CardTitle>
          <CardDescription>
            Create an atom for the person or organization behind this profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Identity Type</Label>
            <RadioGroup
              value={localData.identityType}
              onValueChange={(value) => updateField('identityType', value as 'person' | 'organization')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="person" id="person" />
                <Label htmlFor="person" className="font-normal cursor-pointer">
                  Person
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization" className="font-normal cursor-pointer">
                  Organization
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityName">Name</Label>
            <Input
              id="identityName"
              placeholder="John Doe or Acme Corp"
              value={localData.identityName || ''}
              onChange={(e) => updateField('identityName', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The real name of the person or organization
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identityDescription">Description</Label>
            <Textarea
              id="identityDescription"
              rows={3}
              placeholder="Brief description of the person or organization"
              value={localData.identityDescription || ''}
              onChange={(e) => updateField('identityDescription', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide context about this identity
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
} 