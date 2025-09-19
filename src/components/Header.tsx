import { MoonIcon, SunIcon, TrendingUpIcon, MonitorIcon, UserIcon, WalletIcon, LogOutIcon, NetworkIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Badge } from "~/components/ui/badge"
import { useTheme } from "~/components/ThemeProvider"
import { useWeb3 } from "../hooks/useWeb3"
import { toast } from "~/hooks/use-toast"

export const Header = () => {
  const { theme, setTheme } = useTheme()
  const { 
    isConnected, 
    connectedAddress, 
    chainId, 
    isConnecting,
    error,
    connectWallet, 
    disconnectWallet,
    getShortAddress,
    getNetworkName
  } = useWeb3()

  // Cycle through themes: light -> dark -> system -> light
  const cycleTheme = () => {
    console.log('Current theme:', theme) // Debug log
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Get the current theme icon - only ONE icon should be selected
  const ThemeIcon = theme === 'light' 
    ? SunIcon 
    : theme === 'dark' 
      ? MoonIcon 
      : MonitorIcon

  console.log('Rendering theme icon for:', theme) // Debug log

  const handleConnect = async () => {
    try {
      await connectWallet()
      toast({
        title: "Wallet connected",
        description: `Connected to ${getNetworkName(chainId)}`,
      })
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err.message || "Failed to connect wallet",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-end px-4 gap-2">
        {/* Theme Selector - ONLY ONE ICON AT A TIME */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={cycleTheme}
          aria-label={`Current theme: ${theme}. Click to cycle.`}
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* User Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 px-3 h-8"
              disabled={isConnecting}
            >
              {isConnected ? (
                <>
                  <WalletIcon className="h-3.5 w-3.5" />
                  <span className="text-sm">{getShortAddress(connectedAddress)}</span>
                </>
              ) : (
                <>
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="text-sm">{isConnecting ? 'Connecting...' : 'Log in'}</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            <div className="flex flex-col gap-1">
              {isConnected ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">Connected Wallet</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {connectedAddress}
                    </p>
                  </div>
                  <Separator className="my-1" />
                  <div className="px-2 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <NetworkIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">Network</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getNetworkName(chainId)}
                    </Badge>
                  </div>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto py-1.5 px-2 font-normal"
                    onClick={handleDisconnect}
                  >
                    <LogOutIcon className="h-3.5 w-3.5" />
                    Disconnect
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto py-1.5 px-2 font-normal text-muted-foreground"
                    disabled
                  >
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">Guest User</p>
                    <p className="text-xs text-muted-foreground">Not connected</p>
                  </div>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto py-1.5 px-2 font-normal"
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start gap-2 h-auto py-1.5 px-2 font-normal text-muted-foreground"
                    disabled
                  >
                    Settings
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
