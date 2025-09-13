import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useCurrency } from './CurrencyProvider'

export function CurrencySwitcher() {
  const { selectedCurrency, setCurrency, availableCurrencies } = useCurrency()
  const selectedCurrencyData =
    availableCurrencies.find((c) => c.code === selectedCurrency) ||
    availableCurrencies[0]

  return (
    <div className="w-16">
      <Select value={selectedCurrency} onValueChange={setCurrency}>
        <SelectTrigger className="h-8 w-16 justify-center px-2 bg-background hover:bg-accent transition-colors border-border">
          <SelectValue className="text-center">
            <span className="text-lg font-medium">
              {selectedCurrencyData.name}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="center" className="w-20 min-w-20">
          {availableCurrencies.map(({ code, name }) => (
            <SelectItem
              key={code}
              value={code}
              className="justify-center text-center py-2 cursor-pointer hover:bg-accent focus:bg-accent"
            >
              <span className="text-lg font-medium block w-full text-center">
                {name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
