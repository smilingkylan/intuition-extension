import { MenuIcon, MoonIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Toggle } from "~/components/ui/toggle"

export const Header = () => {

  return (
    <nav className="fixed top-0 z-50 bg-background px-4 py-2 h-16 text-foreground flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 transition-[left,width] duration-200 ease-linear">
      <div className="flex flex-1 max-w-2xl">
        <Button variant="ghost" size="icon">
          <MenuIcon className="h-6 w-6" />
        </Button>
      </div>
      <div className="text-white flex items-center flex-shrink-0">
        <div className="theme-switcher flex flex-row gap-2 items-center">
          <Toggle
            aria-label="Toggle dark theme"
            pressed={false}
            onPressedChange={null}
            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-700 hover:cursor-pointer">
            <MoonIcon className="h-4 w-4 dark:text-white text-gray-700" />
          </Toggle>
        </div>
          <Button
            onClick={null}
            variant="link"
            className="text-foreground">
            Log in
          </Button>
      </div>
    </nav>
  )
}
