import React from 'react'
import { Card } from '~/common/components/ui/card'
import { Button } from '~/common/components/ui/button'

export function Explore() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">
          Discover new insights and connections
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Featured Content</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explore trending topics and popular discussions
          </p>
          <Button size="sm">Learn More</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-2">Search</h3>
          <p className="text-sm text-muted-foreground">
            Search functionality will be implemented here
          </p>
        </Card>
      </div>
    </div>
  )
}