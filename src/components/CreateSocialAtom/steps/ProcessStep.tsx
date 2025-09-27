import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { LoaderIcon, AlertCircle } from 'lucide-react'

interface ProcessStepProps {
  isExecuting: boolean
  error: Error | null
  currentAction: string
  onRetry: () => void
  onBack: () => void
}

export function ProcessStep({ isExecuting, error, currentAction, onRetry, onBack }: ProcessStepProps) {
  // Error state
  if (error && !isExecuting) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Failed</CardTitle>
            <CardDescription>
              There was an error creating your atoms
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-center text-muted-foreground max-w-md">
                {error.message}
              </p>
              <div className="flex gap-2">
                <Button onClick={onRetry} variant="default">
                  Retry Transaction
                </Button>
                <Button onClick={onBack} variant="outline">
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Loading state
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Creating Your Atoms</CardTitle>
          <CardDescription>
            {currentAction || "Please confirm the transactions in your wallet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="font-semibold">Processing Transactions...</p>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Important:</strong> You may need to approve up to 2 transactions in your wallet:
        </p>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>Create atoms transaction</li>
          <li>Create relationships transaction (if applicable)</li>
        </ol>
      </div>
    </div>
  )
} 