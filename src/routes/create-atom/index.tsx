import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components//ui/checkbox'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { useCreateAtom } from '../../components/CreateSocialAtom/CreateAtomContext'
import { toast } from '~/hooks/use-toast'

export const Route = createFileRoute('/create-atom/')({
  component: ConfirmStep,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      platform: (search.platform as string) || 'x.com',
      username: (search.username as string) || ''
    }
  }
})

function ConfirmStep() {
  const navigate = useNavigate()
  const { platform, username } = useSearch({ from: '/create-atom/' })
  const { formData, setFormData, setPlatform, setUsername } = useCreateAtom()

  useEffect(() => {
    if (platform) setPlatform(platform)
    if (username) setUsername(username)
    
    // Set initial values if not already set
    if (!formData.socialAtomName && username) {
      setFormData({
        socialAtomName: `${platform}:${username}`,
        socialAtomDescription: `Social media profile for @${username} on ${platform}`
      })
    }
  }, [platform, username, setPlatform, setUsername, setFormData, formData.socialAtomName])

  const handleNext = () => {
    // Validate required fields
    if (!formData.socialAtomName || !formData.socialAtomDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (formData.hasImage) {
      navigate({ to: '/create-atom/image' })
    } else if (formData.hasIdentity) {
      navigate({ to: '/create-atom/identity' })
    } else {
      navigate({ to: '/create-atom/review' })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Social Media Atom</CardTitle>
          <CardDescription>
            Create an atom for the social media profile {username ? `@${username}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="socialAtomName">Profile Name</Label>
            <Input 
              id="socialAtomName"
              value={formData.socialAtomName || ''}
              onChange={(e) => setFormData({ socialAtomName: e.target.value })}
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
              value={formData.socialAtomDescription || ''}
              onChange={(e) => setFormData({ socialAtomDescription: e.target.value })}
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
              checked={formData.hasImage}
              onCheckedChange={(checked) => setFormData({ hasImage: !!checked })}
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
              checked={formData.hasIdentity}
              onCheckedChange={(checked) => setFormData({ hasIdentity: !!checked })}
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