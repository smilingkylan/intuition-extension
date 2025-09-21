import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/create-atom/identity')({
  component: IdentityStep,
})

function IdentityStep() {
  const navigate = useNavigate()
  const { formData, setFormData } = useCreateAtom()

  const handleNext = () => {
    // Validate fields
    if (!formData.identityName || !formData.identityDescription || !formData.identityType) {
      toast.error('Please fill in all fields')
      return
    }

    navigate({ to: '/create-atom/review' })
  }

  const handleBack = () => {
    if (formData.hasImage) {
      navigate({ to: '/create-atom/image' })
    } else {
      navigate({ to: '/create-atom/' })
    }
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
              value={formData.identityType}
              onValueChange={(value) => setFormData({ identityType: value as 'person' | 'organization' })}
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
              value={formData.identityName || ''}
              onChange={(e) => setFormData({ identityName: e.target.value })}
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
              value={formData.identityDescription || ''}
              onChange={(e) => setFormData({ identityDescription: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Provide context about this identity
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