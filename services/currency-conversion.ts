import { formatUnits, parseUnits } from 'viem'

export interface CryptoAmount {
  value: string | bigint
  decimals?: number
}

export interface ConversionResult {
  native: {
    value: string
    formatted: string
  }
  fiat: {
    value: number
    formatted: string
  }
  raw: {
    nativeBigInt: bigint
    fiatBigInt: bigint
  }
}

export class CurrencyConverter {
  private exchangeRate: number
  private formatCurrency: (value: number) => string
  private nativeCurrency: string

  constructor(
    exchangeRate: number, 
    formatCurrency: (value: number) => string,
    nativeCurrency = 'trust'
  ) {
    this.exchangeRate = exchangeRate
    this.formatCurrency = formatCurrency
    this.nativeCurrency = nativeCurrency
  }

  // Main conversion method - handles both string and bigint inputs
  convert(crypto: CryptoAmount): ConversionResult {
    const { value, decimals = 18 } = crypto
    
    // Normalize to BigInt
    const cryptoBigInt = typeof value === 'string' ? BigInt(value) : value
    
    // Convert to native (readable) format
    const nativeValue = formatUnits(cryptoBigInt, decimals)
    const nativeNumber = Number(nativeValue)
    
    // Calculate fiat value with BigInt precision for large numbers
    if (cryptoBigInt > BigInt('1000000000000000000000')) { // > 1000 ETH
      // Use BigInt math for large values
      const exchangeRateBigInt = parseUnits(this.exchangeRate.toString(), decimals)
      const fiatBigInt = (cryptoBigInt * exchangeRateBigInt) / parseUnits('1', decimals)
      const fiatValue = Number(formatUnits(fiatBigInt, decimals))
      
      return {
        native: {
          value: nativeValue,
          formatted: `${nativeNumber.toFixed(6)} ${this.nativeCurrency.toUpperCase()}`
        },
        fiat: {
          value: fiatValue,
          formatted: this.formatCurrency(fiatValue)
        },
        raw: {
          nativeBigInt: cryptoBigInt,
          fiatBigInt
        }
      }
    } else {
      // Use regular math for smaller values (more readable)
      const fiatValue = nativeNumber * this.exchangeRate
      
      return {
        native: {
          value: nativeValue,
          formatted: `${nativeNumber.toFixed(6)} ${this.nativeCurrency.toUpperCase()}`
        },
        fiat: {
          value: fiatValue,
          formatted: this.formatCurrency(fiatValue)
        },
        raw: {
          nativeBigInt: cryptoBigInt,
          fiatBigInt: parseUnits(fiatValue.toFixed(decimals), decimals)
        }
      }
    }
  }

  // Batch conversion for multiple values (efficient for tables)
  convertMany(cryptoAmounts: CryptoAmount[]): ConversionResult[] {
    return cryptoAmounts.map(amount => this.convert(amount))
  }

  // Utility methods for common calculations
  convertMarketCap(marketCap: string): ConversionResult {
    return this.convert({ value: marketCap, decimals: 18 })
  }

  convertPosition(shares: string, sharePrice: string): ConversionResult {
    const sharesBigInt = BigInt(shares)
    const priceBigInt = BigInt(sharePrice)
    const valueBigInt = sharesBigInt * priceBigInt
    
    return this.convert({ value: valueBigInt, decimals: 36 }) // 18 + 18
  }
} 