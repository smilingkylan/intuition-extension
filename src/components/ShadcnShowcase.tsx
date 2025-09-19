import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/common/components/ui/card'
import { Button } from '~/common/components/ui/button'
import { Badge } from '~/common/components/ui/badge'
import { Input } from '~/common/components/ui/input'
import { Label } from '~/common/components/ui/label'
import { Textarea } from '~/common/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/common/components/ui/select'
import { Switch } from '~/common/components/ui/switch'
import { Separator } from '~/common/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/common/components/ui/tabs'
import { Progress } from '~/common/components/ui/progress'
import { Skeleton } from '~/common/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '~/common/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/common/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '~/common/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/common/components/ui/tooltip'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/common/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '~/common/components/ui/popover'
import { ScrollArea } from '~/common/components/ui/scroll-area'
import { Toggle } from '~/common/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '~/common/components/ui/toggle-group'
import { Spinner } from '~/common/components/ui/spinner'
import { toast } from '~/hooks/use-toast'

export function ShadcnShowcase() {
  const [switchOn, setSwitchOn] = React.useState(false)
  const [progress, setProgress] = React.useState(33)
  const [selectedValue, setSelectedValue] = React.useState('')

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Shadcn UI Components Showcase</h1>
      
      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎯</Button>
        </CardContent>
      </Card>

      {/* Form Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
          <CardDescription>Input fields and form elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Input</Label>
            <Input id="input" placeholder="Type something..." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="textarea">Textarea</Label>
            <Textarea id="textarea" placeholder="Type your message..." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="select">Select</Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger id="select">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="switch" checked={switchOn} onCheckedChange={setSwitchOn} />
            <Label htmlFor="switch">Toggle this switch</Label>
          </div>
        </CardContent>
      </Card>

      {/* Display Components */}
      <Card>
        <CardHeader>
          <CardTitle>Display Components</CardTitle>
          <CardDescription>Various display elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">shadcn</p>
              <p className="text-sm text-muted-foreground">UI Components</p>
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
          
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <Spinner size="default" />
        </CardContent>
      </Card>

      {/* Overlays */}
      <Card>
        <CardHeader>
          <CardTitle>Overlays & Modals</CardTitle>
          <CardDescription>Dialog, Sheet, Popover, and Tooltip components</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. You can add any content here.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetDescription>
                  This is a sheet that slides in from the side.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p>This is a popover content.</p>
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Toast notification",
                description: "This is a toast message!",
              })
            }}
          >
            Show Toast
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Components */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Components</CardTitle>
          <CardDescription>Tabs, Command, Toggle Group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for tab 1</TabsContent>
            <TabsContent value="tab2">Content for tab 2</TabsContent>
            <TabsContent value="tab3">Content for tab 3</TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label>Toggle Group</Label>
            <ToggleGroup type="single">
              <ToggleGroupItem value="a">A</ToggleGroupItem>
              <ToggleGroupItem value="b">B</ToggleGroupItem>
              <ToggleGroupItem value="c">C</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Toggle</Label>
            <Toggle>Toggle me</Toggle>
          </div>
          
          <ScrollArea className="h-32 w-full rounded-md border p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="py-2">
                Scrollable content line {i + 1}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 