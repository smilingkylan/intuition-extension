import Decimal from 'decimal.js'
import { formatUnits } from 'viem'

export const abbreviateNumber = (
  num: number | string | undefined | null
): string => {
  // Handle null, undefined, or NaN values safely
  if (num === undefined || num === null) return '0'

  // Convert to number if it's a string
  const numValue = typeof num === 'string' ? parseFloat(num) : num

  // Check if conversion resulted in NaN
  if (isNaN(numValue)) return '0'

  const absNum = Math.abs(numValue)

  if (absNum >= 1_000_000_000) {
    return (numValue / 1_000_000_000).toFixed(1) + 'B'
  }
  if (absNum >= 1_000_000) {
    return (numValue / 1_000_000).toFixed(1) + 'M'
  }
  if (absNum >= 1_000) {
    return (numValue / 1_000).toFixed(1) + 'K'
  }
  if (absNum < 0.0001 && absNum > 0) {
    return '<0.0001'
  }

  // For numbers less than 1000 but greater than 0.01, show at most 2 decimal places
  return absNum.toFixed(4).replace(/\.?0+$/, '')
}

export const bigIntToNumber = (bigInt: bigint, decimals: number) => {
  const stringValue = formatUnits(bigInt, decimals)
  const decimalValue = new Decimal(stringValue)
  return decimalValue.toNumber()
}
