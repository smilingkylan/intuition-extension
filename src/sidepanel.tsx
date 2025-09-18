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
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header
        />

        <Navigation
          activeRoute={activeRoute}
          onRouteChange={setActiveRoute}
        />

        <main className="flex-1 overflow-auto">{renderCurrentPage()}</main>
      </div>
    </QueryClientProvider>
  )
}

export default SidePanel
