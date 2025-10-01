import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CreateSocialAtom } from '../components/CreateSocialAtom'

export const Route = createFileRoute('/create-atom')({
  component: CreateAtomRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      platform: (search.platform as string) || 'x.com',
      userID: (search.userID as string) || ''
    }
  }
})

function CreateAtomRoute() {
  const navigate = useNavigate()
  const { platform, username } = useSearch({ from: '/create-atom' })
  
  return (
    <CreateSocialAtom 
      initialPlatform={platform}
      initialUsername={username}
      onClose={() => navigate({ to: '/' })}
    />
  )
} 