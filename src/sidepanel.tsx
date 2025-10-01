import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from '@tanstack/react-router'
import React from "react"
// import { WagmiProvider } from "wagmi"

import "./sidepanel.css"

// import { wagmiConfig } from "@/lib/wagmi"
import { router } from './router'
import { ThemeProvider } from "~/components/ThemeProvider"
import { Toaster } from "~/components/ui/toaster"
import { ModeProvider } from "./hooks/useModeContext"
import { TransactionProvider } from "./providers/TransactionProvider"
import { AtomQueueProvider } from "./hooks/useAtomQueue"

const queryClient = new QueryClient()

function SidePanel() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="intuition-theme">
      <ModeProvider defaultMode="explore">
        <QueryClientProvider client={queryClient}>
          <TransactionProvider>
            <AtomQueueProvider>
              <RouterProvider router={router} />
              <Toaster />
            </AtomQueueProvider>
          </TransactionProvider>
        </QueryClientProvider>
      </ModeProvider>
    </ThemeProvider>
  )
}

export default SidePanel
