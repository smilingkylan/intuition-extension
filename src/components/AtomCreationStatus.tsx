import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import { CheckCircleIcon, LoaderIcon, XCircleIcon, UploadIcon, LinkIcon } from 'lucide-react'

interface AtomCreationEvent {
  username: string
  status: 'pending' | 'uploading' | 'creating' | 'completed' | 'failed'
  ipfsHash?: string
  atomVaultId?: string
  transactionHash?: string
  error?: string
  timestamp: number
}

export function AtomCreationStatus() {
  const [events, setEvents] = useState<AtomCreationEvent[]>([])

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'ATOM_CREATION_STATUS') {
        setEvents(prev => {
          const existing = prev.findIndex(e => e.username === message.data.username)
          const newEvent = { ...message.data, timestamp: Date.now() }
          
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newEvent
            return updated
          } else {
            return [...prev, newEvent]
          }
        })
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  const activeEvents = events.filter(e => 
    e.status !== 'completed' || (Date.now() - e.timestamp) < 10000
  )

  if (activeEvents.length === 0) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <LoaderIcon className="h-3 w-3 animate-pulse" />
      case 'uploading':
        return <UploadIcon className="h-3 w-3 animate-pulse" />
      case 'creating':
        return <LinkIcon className="h-3 w-3 animate-spin" />
      case 'completed':
        return <CheckCircleIcon className="h-3 w-3" />
      case 'failed':
        return <XCircleIcon className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium mb-3">Atom Creation Status</h4>
        <div className="space-y-2">
          {activeEvents.map((event, idx) => (
            <div key={`${event.username}-${idx}`} className="flex items-center justify-between">
              <span className="text-xs truncate flex-1">@{event.username}</span>
              <Badge variant={getStatusColor(event.status)} className="text-xs">
                {getStatusIcon(event.status)}
                <span className="ml-1">{event.status}</span>
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 