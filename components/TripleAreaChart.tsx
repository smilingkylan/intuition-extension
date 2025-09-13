import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatUnits } from 'viem'
import { Position } from '../types/database'
import { graphQLQuery } from '../util/fetch'
import { getTripleVaultPositions } from '../util/queries'

export interface TripleAreaChartProps {
  chartData: { xValue: number; vault?: number; counterVault?: number }[] // Updated to include counterVault
  variant?: 'min' | 'max'
}

export interface TripleAreaChartWrapperProps {
  triple: {
    term_id?: string
    id?: string
    vault?: {
      id: string
    }
  }
  variant?: 'min' | 'max'
}

export const TripleAreaChart = ({
  chartData,
  variant = 'min',
}: TripleAreaChartProps) => {
  const maxValue = Math.max(...chartData.map((d) => d.xValue))
  const minValue = Math.min(...chartData.map((d) => d.xValue))
  if (maxValue > 0)
    chartData.push({
      xValue: maxValue * 1.2,
      vault: maxValue,
    })
  if (minValue < 0)
    chartData.push({
      xValue: minValue * 1.2,
      counterVault: minValue * -1,
    })
  chartData.sort((a, b) => a.xValue - b.xValue)
  const maxAbsValue = Math.max(...chartData.map((d) => Math.abs(d.xValue)))
  const domain = [maxAbsValue * -1, maxAbsValue]

  return (
    <ResponsiveContainer width="100%" height={'100%'}>
      <AreaChart data={chartData} layout="vertical">
        {variant !== 'min' && (
          <>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
          </>
        )}
        <XAxis type="number" hide={variant === 'min'} />
        <YAxis
          dataKey="xValue"
          type="number"
          reversed
          domain={domain}
          hide={variant === 'min'}
        />
        <Area
          type="stepBefore"
          dataKey="vault"
          stroke="green"
          fill="green"
          fillOpacity={0.5}
        />
        <Area
          type="stepAfter"
          dataKey="counterVault"
          stroke="red"
          fill="red"
          fillOpacity={0.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const TripleAreaChartWrapper = ({
  triple,
  variant,
}: TripleAreaChartWrapperProps) => {
  const triplePositionsQueryOptions = () =>
    queryOptions({
      queryKey: ['positions', triple],
      queryFn: async () => {
        try {
          const response = await graphQLQuery(getTripleVaultPositions, {
            tripleId: Number(triple.term_id || triple.id),
            orderBy: [{ shares: 'desc' }],
            limit: 100,
          })

          // Extract the triple data from the GraphQL response
          const tripleData = response?.data?.triple?.[0]
          if (!tripleData) {
            return {
              positions: [],
              counterPositions: [],
              maxSharePosition: null,
              maxShareCounterPosition: null,
            }
          }

          return {
            positions: { data: tripleData.positions || [] },
            counterPositions: { data: tripleData.counter_positions || [] },
            maxSharePosition: null,
            maxShareCounterPosition: null,
          }
        } catch (err) {
          console.error(err)
          return {
            positions: { data: [] },
            counterPositions: { data: [] },
            maxSharePosition: null,
            maxShareCounterPosition: null,
          }
        }
      },
    })

  const { data, isLoading, isError, error } = useQuery(
    triplePositionsQueryOptions()
  )
  if (
    !data ||
    (data.positions.data.length === 0 &&
      data.counterPositions.data.length === 0)
  )
    return null

  // Use simplified market cap calculations following atoms.$atomId.tsx pattern
  const defaultSharePrice = '1000000000000000000' // 1 ETH in wei
  const sharePrice = defaultSharePrice
  const counterSharePrice = defaultSharePrice

  const formatPosition = (position: Position) => {
    // Simplified calculation using shares directly
    const sharesBigInt = BigInt(position.shares)
    const sharePriceBigInt = BigInt(sharePrice)
    const valueBigInt = sharesBigInt * sharePriceBigInt
    const valueString = formatUnits(valueBigInt, 36) // 18 + 18 decimals
    const valueNumber = parseFloat(valueString)

    return {
      xValue: valueNumber,
      vault: valueNumber,
    }
  }

  const formatCounterPosition = (position: Position) => {
    // Counter positions get negative values for visualization
    const sharesBigInt = BigInt(position.shares)
    const sharePriceBigInt = BigInt(counterSharePrice)
    const valueBigInt = sharesBigInt * sharePriceBigInt
    const valueString = formatUnits(valueBigInt, 36) // 18 + 18 decimals
    const valueNumber = parseFloat(valueString)

    return {
      xValue: -valueNumber, // Negative for counter vault
      counterVault: valueNumber,
    }
  }

  const chartData = [
    ...(data?.positions?.data ? data.positions.data.map(formatPosition) : []),
    ...(data?.counterPositions?.data
      ? data.counterPositions.data.map(formatCounterPosition)
      : []),
  ]

  // Add some default data points if chart is empty
  if (chartData.length === 0) {
    chartData.push({ xValue: 0, vault: 0 })
  }

  return <TripleAreaChart variant={variant} chartData={chartData} />
}
