import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { X } from 'lucide-react'
import { CreateAtomProvider } from '../components/CreateSocialAtom/CreateAtomContext'

export const Route = createFileRoute('/create-atom')({
  component: CreateAtomLayout,
})

function CreateAtomLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  
  const getProgress = () => {
    const { pathname } = location
    if (pathname.includes('/success')) return 100
    if (pathname.includes('/process')) return 90
    if (pathname.includes('/review')) return 80
    if (pathname.includes('/identity')) return 60
    if (pathname.includes('/image')) return 40
    return 20
  }

  return (
    <CreateAtomProvider>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3 mt-8">
            <h2 className="text-lg font-semibold">Create Social Atom</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate({ to: '/' })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </CreateAtomProvider>
  )
} 