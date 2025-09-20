import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useTheme } from '~/components/ThemeProvider'
import { useMode } from '../../hooks/useModeContext'
import { MoonIcon, SunIcon, MonitorIcon, MousePointerIcon, CompassIcon } from 'lucide-react'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { currentMode, setMode } = useMode()

  return (
    <div className="px-6 pt-8 pb-6 space-y-6 page-content">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your Intuition experience
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="modes">Modes</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="stagger-item">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose how Intuition looks to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <SunIcon className="h-5 w-5" />
                  <span>Light</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <MoonIcon className="h-5 w-5" />
                  <span>Dark</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <MonitorIcon className="h-5 w-5" />
                  <span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <Card className="stagger-item">
            <CardHeader>
              <CardTitle>Default Mode</CardTitle>
              <CardDescription>
                Choose your preferred interaction mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentMode === 'mouse' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setMode('mouse')}
                >
                  <div className="flex items-center gap-3">
                    <MousePointerIcon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Mouse Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Track mouse movements to detect content focus
                      </p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentMode === 'explore' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setMode('explore')}
                >
                  <div className="flex items-center gap-3">
                    <CompassIcon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">Explore Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Navigate and discover content manually
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="stagger-item">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Fine-tune your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoDetect">Auto-detect content</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically analyze page content
                  </p>
                </div>
                <Switch id="autoDetect" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 