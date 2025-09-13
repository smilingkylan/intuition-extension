import { Link } from "@tanstack/react-router"
import { MenuIcon, MoonIcon } from "lucide-react"
import { useContext } from "react"
import { useAccount, useDisconnect } from "wagmi"

import { CurrencySwitcher } from "~/components/CurrencySwitcher"
import { Button } from "~/components/ui/button"
import { Toggle } from "~/components/ui/toggle"

// import { LoginDialog } from "./login-dialog"

// import { RootDialogContext } from "./providers"
// import { useTheme } from "./theme-provider"

export const Header = () => {
  // const { setDialogComponents, dialogComponents } =
  //   useContext(RootDialogContext)
  const { disconnect } = useDisconnect()
  const { theme, setTheme } = { theme: "dark", setTheme: () => {} }
  const { isConnected } = useAccount()
  const isDark = theme === "dark"

  const onClickLogin = () => {
    // setDialogComponents([...dialogComponents, <LoginDialog />])
  }

  return (
    <nav className="fixed top-0 z-50 bg-background px-4 py-2 h-16 text-foreground flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 transition-[left,width] duration-200 ease-linear">
      <div className="flex flex-1 max-w-2xl">
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-6 w-6" />
        </Button>
        <Link
          to="/"
          className="flex gap-1 items-center font-bold text-2xl flex-shrink-0 mr-12 ml-4">
          <img width="95" src="/revel8-white-text.png" alt="Revel8" />
        </Link>
      </div>
      <div className="text-white flex items-center flex-shrink-0">
        <div className="currency-switcher-wrap mr-4">
          <CurrencySwitcher />
        </div>
        <div className="theme-switcher flex flex-row gap-2 items-center">
          <Toggle
            aria-label="Toggle dark theme"
            pressed={isDark}
            onPressedChange={null}
            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-700 hover:cursor-pointer">
            <MoonIcon className="h-4 w-4 dark:text-white text-gray-700" />
          </Toggle>
        </div>
        {isConnected ? (
          <Button
            onClick={disconnect}
            variant="link"
            className="text-foreground">
            Log out
          </Button>
        ) : (
          <Button
            onClick={onClickLogin}
            variant="link"
            className="text-foreground">
            Log in
          </Button>
        )}
      </div>
    </nav>
  )
}
