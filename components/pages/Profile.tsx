import React from 'react'
import { Card } from '~/common/components/ui/card'
import { Button } from '~/common/components/ui/button'

export function Profile() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Account Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Wallet Address</label>
            <p className="text-sm text-muted-foreground">Not connected</p>
          </div>
          <div>
            <label className="text-sm font-medium">Username</label>
            <p className="text-sm text-muted-foreground">Not set</p>
          </div>
        </div>
        <div className="mt-4">
          <Button size="sm">Edit Profile</Button>
        </div>
      </Card>
    </div>
  )
}