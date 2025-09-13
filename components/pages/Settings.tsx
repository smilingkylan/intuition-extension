import React from 'react'
import { Card } from '~/common/components/ui/card'
import { Switch } from '~/common/components/ui/switch'
import { useTheme } from '~/common/components/ThemeProvider'

export function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your extension preferences
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Dark Mode</label>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Extension Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-connect Wallet</label>
              <p className="text-xs text-muted-foreground">Automatically connect wallet on startup</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Notifications</label>
              <p className="text-xs text-muted-foreground">Receive notifications for important events</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </Card>
    </div>
  )
}