import { createFileRoute } from '@tanstack/react-router'
import { CreateAddressAtomFlow } from '../components/CreateAddressAtomFlow'
import { z } from 'zod'

const createAddressAtomSearchSchema = z.object({
  creationData: z.object({
    type: z.literal('address'),
    name: z.string(),
    description: z.string(),
    address: z.string(),
    metadata: z.any().optional()
  })
})

function CreateAddressAtomFlowRoute() {
  const navigate = Route.useNavigate()
  const { creationData } = Route.useSearch()
  
  const handleClose = () => {
    navigate({ to: '/' })
  }
  
  return (
    <CreateAddressAtomFlow 
      creationData={creationData} 
      onClose={handleClose}
    />
  )
}

export const Route = createFileRoute('/create-address-atom')({
  component: CreateAddressAtomFlowRoute,
  validateSearch: createAddressAtomSearchSchema
})
