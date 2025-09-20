import { createContext, useContext, useState, ReactNode } from 'react'
import { formatUnits, parseUnits } from 'viem'

const CURRENCIES = [
  { code: 'usd', name: '$' },
  { code: 'gbp', name: '£' },
  { code: 'eur', name: '€' },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']

type CurrencyContextType = {
  selectedCurrency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  availableCurrencies: typeof CURRENCIES
  formatCurrency: (
    value: string | number,
    currency?: CurrencyCode,
    locale?: string
  ) => string
  calculateFiatValue: (
    cryptoAmount: string,
    exchangeRate: number,
    cryptoDecimals?: number
  ) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
  serverCurrency: CurrencyCode
}

export function CurrencyProvider({ children, serverCurrency }: CurrencyProviderProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') {
      return serverCurrency
    }

    try {
      const stored = localStorage.getItem('preferred-currency') as CurrencyCode
      const finalCurrency =
        stored && CURRENCIES.find((c) => c.code === stored)
          ? stored
          : serverCurrency
      return finalCurrency
    } catch {
      return serverCurrency
    }
  })

  const setCurrency = (currency: CurrencyCode) => {
    setSelectedCurrency(currency)

    // Save to localStorage
    try {
      localStorage.setItem('preferred-currency', currency)
    } catch (error) {
      console.warn('Failed to save currency to localStorage:', error)
    }

    // Save to cookie for server-side rendering
    const cookieString = `preferred-currency=${currency}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    document.cookie = cookieString
  }

  const calculateFiatValue = (
    cryptoAmount: string, // BigInt string
    exchangeRate: number,
    cryptoDecimals = 18
  ): number => {
    const cryptoBigInt = parseUnits(cryptoAmount, cryptoDecimals)
    const rateBigInt = parseUnits(exchangeRate.toString(), 18)
    const fiatBigInt = cryptoBigInt * rateBigInt
    return Number(formatUnits(fiatBigInt, 36))
  }

  const formatCurrency = (
    value: string | number,
    currency?: CurrencyCode,
    locale?: string
  ) => {
    const userLocale =
      locale || (typeof window !== 'undefined' ? navigator.language : 'en-US')
    const currencyToUse = currency || selectedCurrency

    return new Intl.NumberFormat(userLocale, {
      style: 'currency',
      currency: currencyToUse.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value))
  }

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setCurrency,
        availableCurrencies: CURRENCIES,
        formatCurrency,
        calculateFiatValue,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
} 