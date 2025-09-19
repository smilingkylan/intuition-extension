import { MoonIcon, SunIcon, TrendingUpIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Toggle } from "~/components/ui/toggle"
import { useTheme } from "~/components/ThemeProvider"

export const Header = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <nav className="fixed top-0 w-full z-50 bg-background px-4 py-2 h-16 text-foreground flex items-center justify-end border-b border-zinc-200 dark:border-zinc-700 transition-[left,width] duration-200 ease-linear">
      <div className="flex items-center gap-3">
        <div className="theme-switcher">
          <Toggle
            aria-label={`Current theme: ${theme}. Click to switch`}
            pressed={isDark}
            onPressedChange={toggleTheme}
            className="data-[state=on]:bg-zinc-800 data-[state=off]:bg-zinc-200 hover:cursor-pointer">
            {isDark ? (
              <MoonIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            ) : (
              <SunIcon className="h-4 w-4 text-gray-700" />
            )}
          </Toggle>
        </div>
        <TrendingUpIcon className="h-5 w-5 text-muted-foreground" />
        <Button
          onClick={() => {}}
          variant="ghost"
          size="sm"
          className="text-foreground">
          Log in
        </Button>
      </div>
    </nav>
  )
}
