import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { toast } from '~/hooks/use-toast'
import { useTheme } from '~/components/ThemeProvider'
import { useMode } from '../../hooks/useModeContext'
import { TrendingUpIcon, ActivityIcon, LayersIcon, UsersIcon } from 'lucide-react'

export function Dashboard() {
  const { theme } = useTheme()
  const { currentMode, isMouseMode, isExploreMode } = useMode()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  
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
    <div className="p-6 space-y-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUpIcon, label: 'Total Atoms', value: '0', color: 'blue' },
          { icon: ActivityIcon, label: 'Active Triples', value: '0', color: 'green' },
          { icon: UsersIcon, label: 'Connections', value: '0', color: 'purple' },
          { icon: LayersIcon, label: 'Total Staked', value: '0 ETH', color: 'orange' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Theme Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Test</CardTitle>
              <CardDescription>Current theme settings and color palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Theme:</span>
                <Badge variant="secondary">{theme}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Mode:</span>
                <Badge variant={isMouseMode ? "default" : "outline"}>
                  {currentMode === 'mouse' ? '🖱️ Mouse' : '🧭 Explore'}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm font-medium">Background</p>
                  <p className="text-xs text-muted-foreground">bg-background</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium">Muted</p>
                  <p className="text-xs text-muted-foreground">bg-muted</p>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm font-medium text-card-foreground">Card</p>
                  <p className="text-xs text-muted-foreground">bg-card</p>
                </div>
                <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs opacity-90">bg-primary</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm">Default</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions on the Intuition network</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent activity found. Start by creating your first atom!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>Customize your dashboard experience</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings will be available here soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}