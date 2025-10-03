import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CreateSocialAtomFlow } from '../components/CreateSocialAtomFlow'
import type { AtomCreationData } from '../lib/atom-queue/types'

export const Route = createFileRoute('/create-social-atom')({
  component: CreateSocialAtomFlowRoute,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      creationData: search.creationData as AtomCreationData
    }
  }
})

function CreateSocialAtomFlowRoute() {
  const navigate = useNavigate()
  const { creationData } = useSearch({ from: '/create-social-atom' })
  
  if (!creationData) {
    // Redirect to home if no creation data
    navigate({ to: '/' })
    return null
  }
  
  return (
    <CreateSocialAtomFlow 
      creationData={creationData}
      onClose={() => navigate({ to: '/' })}
    />
  )
} 