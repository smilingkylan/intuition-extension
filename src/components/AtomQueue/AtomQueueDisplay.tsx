import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAtomQueue } from '../../hooks/useAtomQueue'
import { AtomQueueItem } from './AtomQueueItem'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { TrashIcon, PinIcon } from 'lucide-react'
import './atom-queue.css'

export function AtomQueueDisplay() {
  const { queue, stats, clearUnpinned, clearAll } = useAtomQueue()

  return (
    <div className="atom-queue-display">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4 p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Atom Queue</h2>
          <div className="flex items-center gap-2">
            {stats.total > 0 && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {stats.total} items
                </Badge>
                {stats.pinned > 0 && (
                  <Badge variant="default" className="text-xs">
                    <PinIcon className="h-3 w-3 mr-1" />
                    {stats.pinned}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
        
        {stats.total > 0 && (
          <div className="flex items-center gap-2">
            {stats.total > stats.pinned && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUnpinned}
                className="text-xs"
              >
                Clear unpinned
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Queue container */}
      <div className="queue-container relative">
        {queue.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground">
            <p className="text-sm">No atoms in queue</p>
            <p className="text-xs mt-1">Browse to see relevant atoms here</p>
          </div>
        ) : (
          <AnimatePresence mode="sync">
            {queue.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  y: { duration: 0.3, delay: index * 0.05 }
                }}
                className="queue-item-wrapper"
              >
                <AtomQueueItem item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
} 