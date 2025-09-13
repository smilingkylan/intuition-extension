import { formatUnits, parseUnits } from 'viem'
import {
  type AtomContents,
  type AtomWithContents,
  type Vault,
} from '~/types/intuition'
import { CONFIG } from '../constants/web3'
import { ellipsizeHex, ellipsizeString } from './syntax'

const { DECIMAL_PRECISION, CURRENCY_SYMBOL } = CONFIG

type NormalizedAtomContents = {
  type?: string
  name?: string
  description?: string
  image?: string
  url?: string
}

export const getAtomContents = (atom: any) => {
  const { thing, organization, person } = atom.value
  const contents = thing || organization || person
  return contents
}

export const ellipsizeLabel = (
  label: string,
  length: number,
  truncate = false
) => {
  if (label.length < length) return label
  if (label.startsWith('bafkrei')) {
    return ellipsizeString(label, 30)
  }
  if (label.startsWith('0x')) {
    return ellipsizeHex(label, 14)
  }
  if (label.startsWith('http')) {
    const adjustedLabel = label.replace('https://', '').replace('http://', '')
    if (adjustedLabel.length < length) return adjustedLabel
    return ellipsizeString(adjustedLabel, length)
  }
  if (truncate) {
    return label.slice(0, length) + '...'
  }
  return label
}

export const composeTriplePhrase = (atoms: AtomWithContents[]) => {
  const phrases = atoms.map((atom) => {
    return atom?.atomIpfsData?.contents?.name || ''
  })
  return phrases.join(' ')
}

export type StakedBalance = {
  whole: string
  decimal: string
  formatted: string
  amount: string
}

export const calculateStakedBalance = (vault: Vault): StakedBalance => {
  if (!vault)
    return {
      whole: '0',
      decimal: '0',
      formatted: `0 ${CURRENCY_SYMBOL}`,
      amount: '0',
    }
  const shares = parseUnits(
    vault.totalShares || vault.total_shares, // todo: remove camelCase
    DECIMAL_PRECISION * -1
  )
  const price = parseUnits(
    vault.currentSharePrice || vault.current_share_price, // todo: remove camelCase
    DECIMAL_PRECISION * -1
  )
  const totalStakedBalance = formatUnits(
    shares * price,
    DECIMAL_PRECISION * 2
  ) as string
  // only show 6 decimal places
  const [whole, decimal] = totalStakedBalance.split('.')
  const totalStakedBalanceFormatted = `${whole}.${decimal.slice(0, 6)}`
  return {
    whole,
    decimal,
    formatted: totalStakedBalanceFormatted,
    amount: totalStakedBalance,
  }
}

export const convertValueBigInt = (
  amount: bigint,
  exchangeRates,
  sourceCurrency: string,
  targetCurrency: string
) => {
  const exchangeRate =
    exchangeRates[
      `${sourceCurrency.toLowerCase()}_${targetCurrency.toLowerCase()}`
    ]
  if (!exchangeRate) {
    return {
      whole: 0n,
      decimal: 0n,
      formatted: `0 ${targetCurrency}`,
      amount: 0n,
    }
  }
  const exchangeRateFormatted = `${exchangeRate[targetCurrency.toLowerCase()].toLocaleString()}/${sourceCurrency.toUpperCase()}`
  const exchangeRateString =
    exchangeRate[targetCurrency.toLowerCase()].toString()
  const exchangeRateBigInt = parseUnits(exchangeRateString, 2)
  const targetAmountBigInt = amount * exchangeRateBigInt
  const output = {
    exchangeRateFormatted,
    amount: targetAmountBigInt,
  }
  return output
}



export const convertStakedBalance = (amount: string, exchangeRate: string = '1') => {
  if (!exchangeRate) {
    return {
      whole: '0',
      decimal: '0',
      formatted: `0`,
      amount: '0',
    }
  }
  const totalStakedBigInt = parseUnits(amount, 18)
  const exchangeRateBigInt = parseUnits(exchangeRate.toString(), 18)
  const totalStakedTargetBalance = formatUnits(
    (totalStakedBigInt * exchangeRateBigInt) / parseUnits('1', 18),
    18
  )
  const totalStakedTargetBalanceFormatted = `${Number(totalStakedTargetBalance).toFixed(2)}`
  return {
    whole: totalStakedTargetBalanceFormatted,
    decimal: '0',
    formatted: `${totalStakedTargetBalanceFormatted}`,
    fiat: `${totalStakedTargetBalanceFormatted}`,
    amount: totalStakedTargetBalance,
  }
}

export const normalizeAtomJson = ({
  contents,
}: AtomContents): NormalizedAtomContents => {
  return {
    type: contents['@type'],
    name: contents.name,
    description: contents.description,
    image: contents.image,
    url: contents.url,
  }
}

export const calculateVaultBalance = (
  vault: Vault | undefined | null,
  decimals: number = 6
) => {
  try {
    if (!vault) {
      return {
        whole: '0',
        decimal: '0',
        formatted: `0 ${CURRENCY_SYMBOL}`,
        amount: '0',
      }
    }

    // Handle different property naming conventions
    const totalShares = vault.total_shares || vault.totalShares
    const sharePrice = vault.current_share_price || vault.currentSharePrice

    // Safety check for missing values
    if (!totalShares || !sharePrice) {
      console.error('[VAULT BALANCE] Missing share data:', vault)
      return {
        whole: '0',
        decimal: '0',
        formatted: `0 ${CURRENCY_SYMBOL}`,
        amount: '0',
      }
    }

    const shares = parseUnits(String(totalShares), DECIMAL_PRECISION * -1)
    const price = parseUnits(String(sharePrice), DECIMAL_PRECISION * -1)
    const totalStakedBalance = formatUnits(
      shares * price,
      DECIMAL_PRECISION * 2
    ) as string

    // only show 6 decimal places
    const [whole, decimal = '0'] = totalStakedBalance.split('.')
    const trimmedDecimal = decimal.slice(0, decimals).replace(/0+$/, '') // Remove trailing zeros
    const amount = trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole // Only add decimal point if there are non-zero decimals
    const totalStakedBalanceFormatted = `${amount} ${CURRENCY_SYMBOL}`

    return { whole, decimal, formatted: totalStakedBalanceFormatted, amount }
  } catch (error) {
    console.error('[VAULT BALANCE] Error calculating balance:', error, vault)
    return {
      whole: '0',
      decimal: '0',
      formatted: `0 ${CURRENCY_SYMBOL}`,
      amount: '0',
    }
  }
}

export const calculateGraphInterval = (amount: string) => {
  const [wholePart, decimalPart = '0'] = amount.split('.')
  const greaterThanOne = wholePart[0] !== '0' && wholePart[0]

  // Convert to number first to work with
  const amountNum = parseFloat(`${wholePart}.${decimalPart}`)

  if (greaterThanOne) {
    // For numbers ≥ 1
    // Instead of incrementing the first digit, divide by 100 and round up
    const magnitude = Math.pow(10, wholePart.length - 1)
    const firstDigit = parseInt(wholePart[0])
    const incrementAmount = (magnitude * firstDigit) / 100

    // Round up to ensure we don't get too many decimal places
    return Math.ceil(incrementAmount * 1000) / 1000 + ''
  } else {
    // For numbers < 1
    // Find the first non-zero digit
    const firstNonZeroIndex = decimalPart
      .split('')
      .findIndex((item) => item !== '0')

    if (firstNonZeroIndex === -1) {
      return '0.000001' // Fallback for very small numbers, should be '0.000001'?
    }

    // Determine the decimal place of the first non-zero digit
    const decimalPlace = firstNonZeroIndex + 1

    // Create an increment that's 1/100th of the order of magnitude of the first non-zero digit
    const digit = parseInt(decimalPart[firstNonZeroIndex])
    const scale = Math.pow(10, -(decimalPlace + 2))

    // Ensure we return a value that's approximately 1/100th of the original
    return (digit * scale * 10).toString()
  }
}

export const vaultPositionsToGraphData = (data, exchangeRates) => {
  const {
    positions,
    maxSharePosition,
    vault,
    counterPositions,
    maxShareCounterPosition,
    counterVault,
  } = data

  const maxPositionShareCount = parseUnits(
    String(maxSharePosition),
    DECIMAL_PRECISION * -1
  )
  const currentPrice = parseUnits(
    String(vault.currentSharePrice),
    DECIMAL_PRECISION * -1
  )
  const counterShares = parseUnits(
    String(maxShareCounterPosition),
    DECIMAL_PRECISION * -1
  )
  const currentCounterPrice = parseUnits(
    String(counterVault.currentSharePrice),
    DECIMAL_PRECISION * -1
  )
  const maxVaultPositionBigInt = maxPositionShareCount * currentPrice
  const maxCounterVaultPositionBigInt = counterShares * currentCounterPrice

  // not as important?
  const maxPositionEth = formatUnits(maxVaultPositionBigInt, 36)
  const maxCounterPositionEth = formatUnits(maxCounterVaultPositionBigInt, 36)

  const maxPositionUsd = convertStakedBalance(
    maxPositionEth.toString(),
    exchangeRates,
    'eth',
    'usd'
  )
  const maxCounterPositionUsd = convertStakedBalance(
    maxCounterPositionEth.toString(),
    exchangeRates,
    'eth',
    'usd'
  )
  // end of less-important area

  const vaultIncrements = calculateGraphInterval(maxPositionEth)
  const vaultIncrementsBigInt = parseUnits(vaultIncrements, 36)
  const counterVaultIncrements = calculateGraphInterval(maxCounterPositionEth)
  const counterVaultIncrementsBigInt = parseUnits(counterVaultIncrements, 36)

  const ranges = []
  const aggregateData = []
  const maxPositionBigInt =
    maxCounterVaultPositionBigInt > maxVaultPositionBigInt
      ? maxCounterVaultPositionBigInt
      : maxVaultPositionBigInt
  const maxIncrementsBigInt =
    counterVaultIncrementsBigInt > vaultIncrementsBigInt
      ? counterVaultIncrementsBigInt
      : vaultIncrementsBigInt

  let currentRangeMin = BigInt(0)
  let aggregateVaultBalance = BigInt(0)
  let aggregateCounterVaultBalance = BigInt(0)

  while (currentRangeMin < maxPositionBigInt) {
    const currentRangeMax = currentRangeMin + maxIncrementsBigInt
    ranges.push([currentRangeMin, currentRangeMax])
    const currentRangeData = {
      name: `${formatUnits(currentRangeMin, 36)} - ${formatUnits(currentRangeMax, 36)}`,
      vaultBalance: BigInt(0),
      counterVaultBalance: BigInt(0),
      aggregateVaultBalance: aggregateVaultBalance,
      aggregateCounterVaultBalance: aggregateCounterVaultBalance,
    }
    positions.data.forEach((position) => {
      const sharePrice = BigInt(vault.currentSharePrice)
      const totalShares = BigInt(position.shares)
      const positionValue = sharePrice * totalShares
      if (positionValue >= currentRangeMin && positionValue < currentRangeMax) {
        currentRangeData.vaultBalance += positionValue
        currentRangeData.aggregateVaultBalance += positionValue
        aggregateVaultBalance += positionValue
      }
    })
    counterPositions.data.forEach((counterPosition) => {
      const sharePrice = BigInt(counterVault.currentSharePrice)
      const totalShares = BigInt(counterPosition.shares)
      const counterPositionValue = sharePrice * totalShares
      if (
        counterPositionValue >= currentRangeMin &&
        counterPositionValue < currentRangeMax
      ) {
        currentRangeData.counterVaultBalance -= counterPositionValue
        currentRangeData.aggregateCounterVaultBalance -= counterPositionValue
        aggregateCounterVaultBalance -= counterPositionValue
      }
    })
    aggregateData.push(currentRangeData)
    currentRangeMin = currentRangeMax
  }
  return {
    aggregateData,
    maxPositionBigInt,
  }
}

export const vaultPositionsToTornadoGraphData = (data, exchangeRates) => {
  const {
    positions,
    maxSharePosition,
    vault,
    counterPositions,
    maxShareCounterPosition,
    counterVault,
  } = data

  const maxPositionShareCount = parseUnits(
    String(maxSharePosition),
    DECIMAL_PRECISION * -1
  )
  const currentPrice = parseUnits(
    String(vault.currentSharePrice),
    DECIMAL_PRECISION * -1
  )
  const counterShares = parseUnits(
    String(maxShareCounterPosition),
    DECIMAL_PRECISION * -1
  )
  const currentCounterPrice = parseUnits(
    String(counterVault.currentSharePrice),
    DECIMAL_PRECISION * -1
  )
  const maxVaultPositionBigInt = maxPositionShareCount * currentPrice
  const maxCounterVaultPositionBigInt = counterShares * currentCounterPrice

  // not as important?
  const maxPositionEth = formatUnits(maxVaultPositionBigInt, 36)
  const maxCounterPositionEth = formatUnits(maxCounterVaultPositionBigInt, 36)

  const vaultIncrements = calculateGraphInterval(maxPositionEth)
  const vaultIncrementsBigInt = parseUnits(vaultIncrements, 36)
  const counterVaultIncrements = calculateGraphInterval(maxCounterPositionEth)
  const counterVaultIncrementsBigInt = parseUnits(counterVaultIncrements, 36)

  const aggregateData = []
  const maxPositionBigInt =
    maxCounterVaultPositionBigInt > maxVaultPositionBigInt
      ? maxCounterVaultPositionBigInt
      : maxVaultPositionBigInt
  const maxIncrementsBigInt =
    counterVaultIncrementsBigInt > vaultIncrementsBigInt
      ? counterVaultIncrementsBigInt
      : vaultIncrementsBigInt

  let currentRangeMin = BigInt(0)
  let aggregateVaultBalance = BigInt(0)

  while (currentRangeMin < maxPositionBigInt) {
    const currentRangeMax = currentRangeMin + maxIncrementsBigInt
    const currentRangeData = {
      max: currentRangeMax,
      vaultBalance: BigInt(0),
      aggregateVaultBalance: aggregateVaultBalance,
    }
    positions.data.forEach((position) => {
      const sharePrice = BigInt(vault.currentSharePrice)
      const totalShares = BigInt(position.shares)
      const positionValue = sharePrice * totalShares
      // if the value is within the range
      if (positionValue >= currentRangeMin && positionValue < currentRangeMax) {
        currentRangeData.vaultBalance += positionValue
        currentRangeData.aggregateVaultBalance += positionValue
        aggregateVaultBalance += positionValue
      }
    })
    aggregateData.push(currentRangeData)
    currentRangeMin = currentRangeMax
  }
  let currentCounterRangeMax = BigInt(0)
  let aggregateCounterVaultBalance = BigInt(0)
  const minPositionBigInt = maxPositionBigInt * -1n

  while (currentCounterRangeMax > minPositionBigInt) {
    const currentCounterRangeMin = currentCounterRangeMax - maxIncrementsBigInt
    const currentCounterRangeData = {
      max: currentCounterRangeMax - maxIncrementsBigInt,
      counterVaultBalance: BigInt(0),
      aggregateCounterVaultBalance: aggregateCounterVaultBalance,
    }
    counterPositions.data.forEach((counterPosition) => {
      const sharePrice = BigInt(counterVault.currentSharePrice)
      const totalShares = BigInt(counterPosition.shares)
      const counterPositionValue = sharePrice * totalShares
      if (
        counterPositionValue * -1n >= currentCounterRangeMin &&
        counterPositionValue * -1n < currentCounterRangeMax
      ) {
        currentCounterRangeData.counterVaultBalance += counterPositionValue
        currentCounterRangeData.aggregateCounterVaultBalance +=
          counterPositionValue
        aggregateCounterVaultBalance += counterPositionValue
      }
    })
    aggregateData.unshift(currentCounterRangeData)
    currentCounterRangeMax = currentCounterRangeMin
  }

  return {
    aggregateData,
    maxPositionBigInt,
  }
}

// still need this for URL atoms?
export const getAtomBoilerplateAtomByType = (atomType: string, params: any) => {
  switch (atomType) {
    case 'evm_address':
      return {
        data: params.evm_address,
      }
    default:
      return {}
  }
}

export const emulateIncompleteTriple = (
  atomsData: any[],
  atomType: string,
  params: any
): {
  atomsData: any[]
  missingAtom: any
} => {
  let missingAtom
  const adjustedAtomsData = atomsData.map((atomData) => {
    if (!atomData) {
      missingAtom = getAtomBoilerplateAtomByType(atomType, params)
      return missingAtom
    }
    return atomData
  })
  const output = {
    atomsData: adjustedAtomsData,
    missingAtom,
  }
  return output
}

export const formatNativeValue = (
  input: string | bigint,
  inputDecimals: number = 18,
  outputDecimals: number = 6
) => {
  // cut off decimals then convert to number
  const typedInput =
    typeof input === 'string' ? parseUnits(input, inputDecimals) : input
  const stringValue = formatUnits(typedInput, inputDecimals)

  return stringValue
}

export const formatFiatBigInt = (input: bigint, decimals: number = 36) => {
  const stringValue = formatUnits(input, decimals)
  const formattedValue = formatFiatString(stringValue)
  return formattedValue
}

export const formatFiatString = (input: string, decimals?: 2) => {
  const marketCapFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(parseFloat(input))
  return marketCapFormatted
}

/**
 * Convert wei (smallest ETH unit) to USD
 * @param cryptoAmount - BigInt or string representing wei
 * @param rate - ETH to USD exchange rate as string
 * @returns USD value as formatted string
 */
export const cryptoToFiat = (
  nativeAmount: string | bigint,
  rate: string
): string => {
  const nativeBigInt =
    typeof nativeAmount === 'string' ? BigInt(nativeAmount) : nativeAmount

  // Convert rate to integer (multiply by 10000 to handle 4 decimal places max)
  const rateBigInt = BigInt(Math.round(parseFloat(rate) * 10000))

  // Multiply in BigInt: wei * (rate * 10000)
  const product = nativeBigInt * rateBigInt

  // Divide by 10^18 (wei) * 10^4 (rate scaling) = 10^22
  const fiatValueBigInt = product / BigInt(10 ** 22)

  // Convert to number for formatting
  const fiatValue = Number(fiatValueBigInt) / 100 // Divide by 100 for 2 decimal places

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fiatValue)
}

/**
 * Convert wei to ETH with proper formatting
 * @param weiValue - BigInt or string representing wei
 * @param displayDecimals - Number of decimal places to show
 * @returns ETH value as formatted string
 */
export const weiToETH = (
  weiValue: string | bigint,
  displayDecimals: number = 6
): string => {
  const weiBigInt = typeof weiValue === 'string' ? BigInt(weiValue) : weiValue
  const ethString = formatUnits(weiBigInt, 18)
  const ethNumber = parseFloat(ethString)

  // Format with specified decimal places
  return ethNumber.toFixed(displayDecimals)
}
