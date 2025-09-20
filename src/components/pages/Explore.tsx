import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { SearchIcon, TrendingUpIcon, CompassIcon, HashIcon, UsersIcon } from 'lucide-react'

export function Explore() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for demonstration
  const trendingTopics = [
    { id: 1, name: 'DeFi', count: '12.5K', trend: '+5%' },
    { id: 2, name: 'AI Agents', count: '8.2K', trend: '+12%' },
    { id: 3, name: 'zkRollups', count: '6.8K', trend: '+3%' },
    { id: 4, name: 'Governance', count: '5.1K', trend: '-2%' },
  ]

  const recommendedAtoms = [
    { id: 1, title: 'Vitalik Buterin', type: 'Person', stakes: 245 },
    { id: 2, title: 'Ethereum Foundation', type: 'Organization', stakes: 189 },
    { id: 3, title: 'Layer 2 Scaling', type: 'Concept', stakes: 156 },
  ]

  return (
    <div className="px-6 pt-8 pb-6 space-y-6 page-content">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">
          Discover atoms, triples, and connections
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative stagger-item">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search atoms, triples, or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="atoms">Atoms</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <div className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <Card key={topic.id} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HashIcon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{topic.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{topic.count}</span>
                      <Badge 
                        variant={topic.trend.startsWith('+') ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {topic.trend}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Trending in DeFi and Infrastructure
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="atoms" className="space-y-4">
          <Card className="stagger-item">
            <CardHeader>
              <CardTitle>Recommended Atoms</CardTitle>
              <CardDescription>
                Based on your recent activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedAtoms.map((atom, index) => (
                <div 
                  key={atom.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CompassIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{atom.title}</p>
                      <p className="text-sm text-muted-foreground">{atom.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{atom.stakes}</p>
                    <p className="text-xs text-muted-foreground">stakes</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card className="stagger-item">
            <CardHeader>
              <CardTitle>Active Communities</CardTitle>
              <CardDescription>
                Join conversations and contribute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center space-y-2">
                  <UsersIcon className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-sm">Communities coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 stagger-item">
        <Button variant="outline" className="h-auto flex-col py-4 gap-2">
          <CompassIcon className="h-5 w-5" />
          <span className="text-sm">Browse All</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col py-4 gap-2">
          <SearchIcon className="h-5 w-5" />
          <span className="text-sm">Advanced Search</span>
        </Button>
      </div>
    </div>
  )
} 