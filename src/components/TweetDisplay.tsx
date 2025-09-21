import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import { TweetData } from '../types/messages'
import { MessageSquareIcon, RepeatIcon, HeartIcon, BookmarkIcon, ImageIcon, VerifiedIcon } from 'lucide-react'

interface TweetDisplayProps {
  tweet: TweetData | null
  isHovering: boolean
}

export function TweetDisplay({ tweet, isHovering }: TweetDisplayProps) {
  if (!tweet) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MessageSquareIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {isHovering ? 'Hovering over a tweet...' : 'Hover over a tweet to see details'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={`https://unavatar.io/twitter/${tweet.username}`} />
              <AvatarFallback>{tweet.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{tweet.displayName}</CardTitle>
                {tweet.isVerified && (
                  <VerifiedIcon className="h-4 w-4 text-blue-500" />
                )}
                {isHovering && (
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">@{tweet.username}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {formatTime(tweet.timestamp)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Tweet Content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {tweet.content}
          </p>
          
          {/* Media Indicator */}
          {tweet.mediaCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ImageIcon className="h-4 w-4" />
              <span>{tweet.mediaCount} {tweet.mediaCount === 1 ? 'image' : 'images'}</span>
            </div>
          )}
          
          <Separator />
          
          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquareIcon className="h-4 w-4" />
              <span>{formatCount(tweet.replyCount)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <RepeatIcon className="h-4 w-4" />
              <span>{formatCount(tweet.retweetCount)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              <span>{formatCount(tweet.likeCount)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <BookmarkIcon className="h-4 w-4" />
              <span>Save</span>
            </div>
          </div>
          
          {/* Tweet ID for debugging */}
          <div className="text-xs text-muted-foreground/50 font-mono">
            ID: {tweet.tweetId}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
