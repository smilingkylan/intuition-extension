import { createFileRoute, useSearch } from '@tanstack/react-router'
import { CreateSocialAtom } from '../components/CreateSocialAtom/CreateSocialAtom'

export const Route = createFileRoute('/create-atom')({
  component: CreateAtomRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      platform: (search.platform as string) || 'x.com',
      username: (search.username as string) || ''
    }
  }
})

function CreateAtomRoute() {
  const { platform, username } = useSearch({ from: '/create-atom' })
  
  return (
    <CreateSocialAtom 
      initialData={{ platform, username }}
    />
  )
} 