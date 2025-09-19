import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { ClockIcon, ActivityIcon, MousePointerIcon, CompassIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

export function History() {
  const [filterMode, setFilterMode] = useState<'all' | 'mouse' | 'explore'>('all')
  const [timeRange, setTimeRange] = useState('24h')

  // Mock history data
  const historyItems = [
    {
      id: 1,
      timestamp: '2 hours ago',
      mode: 'mouse',
      action: 'Viewed atom',
      target: 'Ethereum Foundation',
      type: 'Organization',
      change: '+0.5%'
    },
    {
      id: 2,
      timestamp: '3 hours ago',
      mode: 'explore',
      action: 'Staked on triple',
      target: 'Vitalik Buterin > created > Ethereum',
      type: 'Triple',
      amount: '0.01 ETH',
      change: '+2.1%'
    },
    {
      id: 3,
      timestamp: '5 hours ago',
      mode: 'mouse',
      action: 'Discovered connection',
      target: 'Layer 2 Scaling',
      type: 'Concept',
      change: '-0.3%'
    },
    {
      id: 4,
      timestamp: 'Yesterday',
      mode: 'explore',
      action: 'Created atom',
      target: 'DeFi Protocol X',
      type: 'Project',
      amount: '0.05 ETH'
    }
  ]

  const filteredHistory = filterMode === 'all' 
    ? historyItems 
    : historyItems.filter(item => item.mode === filterMode)

  const stats = {
    totalActions: 142,
    stakesPlaced: 23,
    atomsViewed: 89,
    triplesCreated: 7
  }

  return (
    <div className="p-6 space-y-6 page-content">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
        <p className="text-muted-foreground">
          Track your interactions and discoveries
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="stagger-item">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{stats.totalActions}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="stagger-item" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stakes Placed</p>
                <p className="text-2xl font-bold">{stats.stakesPlaced}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 stagger-item" style={{ animationDelay: '0.2s' }}>
        <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="mouse">
              <div className="flex items-center gap-2">
                <MousePointerIcon className="h-4 w-4" />
                Mouse Mode
              </div>
            </SelectItem>
            <SelectItem value="explore">
              <div className="flex items-center gap-2">
                <CompassIcon className="h-4 w-4" />
                Explore Mode
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History Timeline */}
      <Card className="stagger-item" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions with the Intuition network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredHistory.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-start gap-4 pb-4">
                <div className="mt-0.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    item.mode === 'mouse' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-purple-100 dark:bg-purple-900/20'
                  }`}>
                    {item.mode === 'mouse' ? (
                      <MousePointerIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CompassIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.target}
                        {item.type && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {item.type}
                          </Badge>
                        )}
                      </p>
                      {item.amount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount: {item.amount}
                        </p>
                      )}
                    </div>
                    {item.change && (
                      <div className="flex items-center gap-1">
                        {item.change.startsWith('+') ? (
                          <TrendingUpIcon className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDownIcon className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${
                          item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    {item.timestamp}
                  </div>
                </div>
              </div>
              {index < filteredHistory.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" className="stagger-item" style={{ animationDelay: '0.4s' }}>
          Load More History
        </Button>
      </div>
    </div>
  )
} 