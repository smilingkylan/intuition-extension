import { createFileRoute } from '@tanstack/react-router'
import { History } from '@/src/components/pages/History'

export const Route = createFileRoute('/history')({
  component: History,
}) 