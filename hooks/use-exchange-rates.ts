// hooks/useExchangeRates.ts
import { useQuery } from '@tanstack/react-query'
import { useCurrency } from '../components/CurrencyProvider'

const MOCK_EXCHANGE_RATES = {
  eth_usd: 4310.0,
  eth_gbp: 3500.0,
  eth_eur: 4000.0,
  btc_usd: 100000.0,
  btc_eur: 5000.0,
  btc_gbp: 4000.0,
  trust_usd: 4300.0,
  trust_gbp: 3000.0,
  trust_eur: 3500.0,
}

export const useExchangeRates = (nativeCurrencyCode: string = 'trust') => {
  const currency = useCurrency()
  const { selectedCurrency } = currency

  return useQuery({
    queryKey: ['exchange-rates', selectedCurrency],
    queryFn: () => MOCK_EXCHANGE_RATES,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
    select: (_data) => {
      const rateKey = `${nativeCurrencyCode.toLowerCase()}_${selectedCurrency}`
      const rate = MOCK_EXCHANGE_RATES[rateKey] || 0

      return {
        rate,
        rates: MOCK_EXCHANGE_RATES,
        currency,
      }
    },
  })
}