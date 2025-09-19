import { createFileRoute } from '@tanstack/react-router'
import { Explore } from '@/src/components/pages/Explore'

export const Route = createFileRoute('/explore')({
  component: Explore,
}) 