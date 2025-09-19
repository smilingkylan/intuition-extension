import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/src/components/pages/Dashboard'

export const Route = createFileRoute('/')({
  component: Dashboard,
}) 