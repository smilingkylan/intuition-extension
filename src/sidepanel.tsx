import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
// import { WagmiProvider } from "wagmi"

import "./sidepanel.css"

import { Header } from "@/src/components/Header"
import { Navigation } from "@/src/components/Navigation"
import { Dashboard } from "@/src/components/pages/Dashboard"
// import { wagmiConfig } from "@/lib/wagmi"

import { ThemeProvider } from "~/components/ThemeProvider"

const queryClient = new QueryClient()

function SidePanel() {
  const [activeRoute, setActiveRoute] = useState("dashboard")

  
  const renderCurrentPage = () => {
    switch (activeRoute) {
      case "dashboard":
        return <Dashboard />
      default:
        return <Dashboard />
    }
  }

  return  (
    <ThemeProvider defaultTheme="system" storageKey="intuition-theme">
      <QueryClientProvider client={queryClient}>
        <div className="h-screen bg-background text-foreground">
          <Header />
          <div className="pt-16 h-full flex flex-col">
            <Navigation
              activeRoute={activeRoute}
              onRouteChange={setActiveRoute}
            />
            <main className="flex-1 overflow-auto">{renderCurrentPage()}</main>
          </div>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default SidePanel
