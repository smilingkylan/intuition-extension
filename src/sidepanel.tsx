import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
// import { WagmiProvider } from "wagmi"

import "./sidepanel.css"

import { Header } from "@/src/components/Header"
import { Dashboard } from "@/src/components/pages/Dashboard"
// import { wagmiConfig } from "@/lib/wagmi"

import { ThemeProvider } from "~/components/ThemeProvider"
import { Toaster } from "~/components/ui/toaster"
import { ModeProvider } from "./hooks/useModeContext"

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
      <ModeProvider defaultMode="explore">
        <QueryClientProvider client={queryClient}>
          <div className="h-screen bg-background text-foreground">
            <Header />
            <div className="pt-14 h-full flex flex-col">
              <main className="flex-1 overflow-auto">{renderCurrentPage()}</main>
            </div>
            <Toaster />
          </div>
        </QueryClientProvider>
      </ModeProvider>
    </ThemeProvider>
  )
}

export default SidePanel
