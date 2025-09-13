import { formatUnits } from 'viem'
import { CONFIG } from '~/constants/web3'
import { vaultPositionsToTornadoGraphData } from './intuition'

const { REVEL8_EXPLORER_DOMAIN } = CONFIG

export const getAtomExplorerLink = (atomId: string) => {
  return `${REVEL8_EXPLORER_DOMAIN}/atoms/${atomId}`
}

export const generateTriplePositionsTornadoGraphRanges = ({
  exchangeRates,
  triplePositionsData,
}: {
  exchangeRates: any
  triplePositionsData: any
}) => {
  if (
    !triplePositionsData?.maxSharePosition ||
    !triplePositionsData?.maxShareCounterPosition ||
    !exchangeRates
  )
    throw new Error()

  const { aggregateData } = vaultPositionsToTornadoGraphData(
    triplePositionsData,
    exchangeRates
  )

  const rangesFormatted = aggregateData.map((range) => ({
    name: parseFloat(formatUnits(range.max, 36)),
    vaultBalance:
      (range.vaultBalance && parseFloat(formatUnits(range.vaultBalance, 36))) ||
      0,
    counterVaultBalance:
      (range.counterVaultBalance &&
        parseFloat(formatUnits(range.counterVaultBalance, 36))) ||
      0,
    aggregateVaultBalance:
      (range.aggregateVaultBalance &&
        parseFloat(formatUnits(range.aggregateVaultBalance, 36))) ||
      0,
    aggregateCounterVaultBalance:
      (range.aggregateCounterVaultBalance &&
        parseFloat(formatUnits(range.aggregateCounterVaultBalance, 36))) ||
      0,
  }))
  return rangesFormatted
}
