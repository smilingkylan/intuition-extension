import React, { useState } from 'react'
import { MousePointerIcon, CompassIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export type Mode = 'mouse' | 'explore'

interface ModeToggleProps {
  value?: Mode
  onValueChange?: (value: Mode) => void
  className?: string
}

export const ModeToggle = ({ 
  value = 'explore', 
  onValueChange,
  className 
}: ModeToggleProps) => {
  const [activeMode, setActiveMode] = useState<Mode>(value)

  // Sync local state with prop value
  React.useEffect(() => {
    setActiveMode(value)
  }, [value])

  const handleValueChange = (newValue: string) => {
    if (newValue && (newValue === 'mouse' || newValue === 'explore')) {
      setActiveMode(newValue)
      onValueChange?.(newValue)
    }
  }

  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={activeMode}
        onValueChange={handleValueChange}
        className={className}
        size="sm"
        variant="outline"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="mouse" 
              aria-label="Mouse mode - Track mouse movements"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                activeMode === 'mouse' 
                  ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <MousePointerIcon 
                className={`h-3.5 w-3.5 transition-all duration-200 ${
                  activeMode === 'mouse' ? 'scale-110' : ''
                }`} 
              />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Mouse Mode</p>
            <p className="text-xs text-muted-foreground">Track mouse movements</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="explore" 
              aria-label="Explore mode - Navigate and discover"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                activeMode === 'explore' 
                  ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <CompassIcon 
                className={`h-3.5 w-3.5 transition-all duration-200 ${
                  activeMode === 'explore' ? 'scale-110' : ''
                }`} 
              />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Explore Mode</p>
            <p className="text-xs text-muted-foreground">Navigate and discover</p>
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  )
} 