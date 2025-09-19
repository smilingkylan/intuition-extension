import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/src/components/pages/Settings'

export const Route = createFileRoute('/settings')({
  component: Settings,
}) 