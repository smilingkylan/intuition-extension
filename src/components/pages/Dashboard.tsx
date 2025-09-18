import React from 'react'
import { Card } from '~/common/components/ui/card'

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your Intuition overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            No recent activity found
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Your stats will appear here
          </p>
        </Card>
      </div>
    </div>
  )
}