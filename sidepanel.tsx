import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
import { WagmiProvider } from "wagmi"

import "./sidepanel.css"

import { Header } from "@/components/Header"
import { Navigation } from "@/components/Navigation"
import { Dashboard } from "@/components/pages/Dashboard"
import { Explore } from "@/components/pages/Explore"
import { Profile } from "@/components/pages/Profile"
import { Settings } from "@/components/pages/Settings"
import { wagmiConfig } from "@/lib/wagmi" // You'll need to create this

import { ThemeProvider } from "~/components/ThemeProvider"

const queryClient = new QueryClient()

function SidePanel() {
  const [activeRoute, setActiveRoute] = useState("dashboard")
  const [isWeb3Connected, setIsWeb3Connected] = useState(false)

  const handleWeb3Login = () => {
    // This will now work properly with wagmi hooks
    setIsWeb3Connected(!isWeb3Connected)
  }

  const renderCurrentPage = () => {
    switch (activeRoute) {
      case "dashboard":
        return <Dashboard />
      case "explore":
        return <Explore />
      case "profile":
        return <Profile />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="intuition-ui-theme">
          <div className="flex flex-col h-screen bg-background text-foreground">
            <Header
              onWeb3Login={handleWeb3Login}
              isWeb3Connected={isWeb3Connected}
            />

            <Navigation
              activeRoute={activeRoute}
              onRouteChange={setActiveRoute}
            />

            <main className="flex-1 overflow-auto">{renderCurrentPage()}</main>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default SidePanel
