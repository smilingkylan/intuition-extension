import { TooltipContent as TContent } from '@radix-ui/react-tooltip'
import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'

export const TooltipContent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <TContent>
      <Card className="w-[300px] p-4">
        <ScrollArea className="w-[300px]">{children}</ScrollArea>
      </Card>
    </TContent>
  )
}
