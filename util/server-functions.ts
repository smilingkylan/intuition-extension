import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { parse } from 'cookie'

// Server function to get theme from cookies
export const getThemeFromCookies = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getWebRequest()
    if (!request) {
      return 'dark'
    }
    const cookieHeader = request.headers.get('Cookie')
    if (!cookieHeader) return 'dark'
    const cookies = parse(cookieHeader)
    const theme = cookies['shadcn-ui-theme']
    const validTheme =
      theme === 'dark' || theme === 'light' || theme === 'system'
        ? theme
        : 'dark'
    return validTheme
  }
)

// Server function to get currency from cookies
export const getCurrencyFromCookies = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getWebRequest()
    if (!request) {
      return 'usd'
    }
    const cookieHeader = request.headers.get('Cookie')
    if (!cookieHeader) return 'usd'
    const cookies = parse(cookieHeader)
    const currency = cookies['preferred-currency']
    const validCurrency =
      currency === 'usd' || currency === 'gbp' || currency === 'eur'
        ? currency
        : 'usd'
    return validCurrency
  }
) 