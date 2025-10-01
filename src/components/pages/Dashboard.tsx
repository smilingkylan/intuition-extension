import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Progress } from '~/components/ui/progress'
import { toast } from '~/hooks/use-toast'
import { AtomQueueDisplay } from '../AtomQueue'
import { NetworkWarning } from '../NetworkWarning'
import { useAtomQueryListener } from '../../hooks/useAtomQueryListener'

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Listen for atom queries from content scripts
  useAtomQueryListener()
  
  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          toast({
            title: "Data refreshed",
            description: "Your dashboard has been updated with the latest data.",
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }
  
  return (
    <div className="px-6 pt-8 pb-6 space-y-6">
      {/* Network Warning - Shows when on wrong network */}
      <NetworkWarning />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your Intuition overview
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {isLoading && (
        <Progress value={progress} className="w-full" />
      )}

      {/* Atom Queue Display */}
      <AtomQueueDisplay />
    </div>
  )
}