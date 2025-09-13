import { formatUnits, parseUnits } from 'viem'
import { abbreviateNumber } from './web3'

export interface VaultData {
  totalShares?: string
  currentSharePrice?: string
  total_shares?: string
  current_share_price?: string
}

export interface AtomWithVault {
  id: string
  vault?: VaultData
  vaultData?: VaultData
}

/**
 * Normalizes vault data to handle both camelCase and snake_case properties
 */
export const normalizeVaultData = (vault: VaultData | undefined): VaultData => {
  if (!vault) {
    return {
      totalShares: '0',
      currentSharePrice: '0',
    }
  }

  return {
    totalShares: vault.totalShares || '0',
    currentSharePrice: vault.currentSharePrice || '0',
  }
}

/**
 * Gets vault data from an atom, handling different possible structures
 */
export const getVaultData = (atom: AtomWithVault): VaultData => {
  if (atom.vault && typeof atom.vault === 'object') {
    return normalizeVaultData(atom.vault)
  } else if (atom.vaultData && typeof atom.vaultData === 'object') {
    return normalizeVaultData(atom.vaultData)
  }

  return normalizeVaultData(undefined)
}

/**
 * Calculates precise ETH value using BigInt to avoid floating point issues
 */
export const calculatePreciseETHValue = (
  totalShares: string,
  sharePrice: string
): string => {
  try {
    // Clean the values - remove any non-numeric characters
    const cleanShares = String(totalShares).replace(/[^0-9]/g, '')
    const cleanPrice = String(sharePrice).replace(/[^0-9]/g, '')

    // Validate cleaned values
    if (
      !cleanShares ||
      !cleanPrice ||
      cleanShares === '0' ||
      cleanPrice === '0'
    ) {
      return '0'
    }

    // Convert to BigInt for precise multiplication
    const sharesBigInt = BigInt(cleanShares)
    const priceBigInt = BigInt(cleanPrice)

    // Perform the multiplication
    const productBigInt = sharesBigInt * priceBigInt
    const productStr = productBigInt.toString()

    // Handle division by 10^36 (18 decimals twice)
    if (productStr.length <= 36) {
      // Result is less than 1 ETH
      const decimalValue = '0.' + productStr.padStart(36, '0')
      return parseFloat(decimalValue).toString()
    } else {
      // Result is at least 1 ETH
      const integerPart = productStr.slice(0, productStr.length - 36)
      const decimalPart = productStr
        .slice(productStr.length - 36)
        .substring(0, 18)
      const ethValue = integerPart + '.' + decimalPart
      return parseFloat(ethValue).toString()
    }
  } catch (error) {
    console.error('Error in precise ETH calculation:', error)
    return '0'
  }
}

/**
 * Formats ETH value for display with appropriate abbreviations
 */
export const formatETHDisplay = (ethValue: string): string => {
  try {
    const numValue = parseFloat(ethValue)

    if (isNaN(numValue) || numValue === 0) {
      return '0Ξ'
    }

    return abbreviateNumber(numValue) + 'Ξ'
  } catch (error) {
    console.error('Error formatting ETH display:', error)
    return '0Ξ'
  }
}

/**
 * Calculates ETH value for an atom and returns formatted display string
 */
export const calculateAtomETHValue = (atom: AtomWithVault): string => {
  try {
    const vaultData = getVaultData(atom)
    const ethValue = calculatePreciseETHValue(
      vaultData.totalShares,
      vaultData.currentSharePrice
    )
    return formatETHDisplay(ethValue)
  } catch (error) {
    console.error(`Error calculating ETH value for atom ${atom.id}:`, error)
    return '0Ξ'
  }
}

/**
 * Calculates the value bar height percentage
 */
export const calculateValueBarHeight = (
  atom: AtomWithVault,
  maxAtomValue: number
): number => {
  try {
    const vaultData = getVaultData(atom)
    const ethValue = parseFloat(
      calculatePreciseETHValue(
        vaultData.totalShares,
        vaultData.currentSharePrice
      )
    )

    if (isNaN(ethValue) || ethValue === 0) {
      return 0
    }

    const actualMaxValue = maxAtomValue > 0 ? maxAtomValue : 1000000
    return Math.min(100, Math.max(0, (ethValue / actualMaxValue) * 100))
  } catch (error) {
    console.error(
      `Error calculating value bar height for atom ${atom.id}:`,
      error
    )
    return 0
  }
}

export const calculateFiatValue = (
  cryptoAmount: string, // BigInt string
  exchangeRate: number,
  cryptoDecimals = 18
): number => {
  const cryptoBigInt = parseUnits(cryptoAmount, cryptoDecimals)
  const rateBigInt = parseUnits(exchangeRate.toString(), 18)
  const fiatBigInt = cryptoBigInt * rateBigInt
  return Number(formatUnits(fiatBigInt, 36))
}
