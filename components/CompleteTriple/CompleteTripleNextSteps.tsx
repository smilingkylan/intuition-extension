import { Link } from '@tanstack/react-router'
import { Button } from '@/common/components/ui/button'
import { ImageIcon, UserIcon } from 'lucide-react'

export const CompleteTripleNextSteps = ({
  atomId,
  pop,
}: {
  atomId: string
  pop?: () => void
}) => {
  // to close the modal
  const handleClick = () => {
    pop?.()
  }

  return (
    <div className="next-steps">
      <h1 className="text-lg font-bold text-center mb-4">Next steps</h1>
      <div className="button-wrap gap-2 flex flex-row justify-center">
        <Button onClick={handleClick} asChild variant="default">
          <Link
            to="/atoms/$atomId"
            params={{ atomId }}
            search={{ modal: 'add_nickname', atom_id: atomId }}
          >
            <UserIcon className="size-4" />
            Add nickname
          </Link>
        </Button>
        <Button onClick={handleClick} asChild variant="default">
          <Link
            to="/atoms/$atomId"
            params={{ atomId }}
            search={{ modal: 'add_image', atom_id: atomId }}
          >
            <ImageIcon className="size-4" />
            Add image
          </Link>
        </Button>
      </div>
    </div>
  )
}