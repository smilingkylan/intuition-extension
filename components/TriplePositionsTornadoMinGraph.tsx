import { fetchExchangeRates, fetchTripleVaultPositions } from '~/util/fetch'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { generateTriplePositionsTornadoGraphRanges } from '../util'

export const triplePositionsQueryOptions = (tripleId: string) =>
  queryOptions({
    queryKey: ['positions', 'triple', tripleId],
    queryFn: async () => {
      try {
        const triplePositionsResponse = fetchTripleVaultPositions(tripleId)
        const exchangeRatesResponse = fetchExchangeRates()
        const [triplePositions, exchangeRates] = await Promise.all([
          triplePositionsResponse,
          exchangeRatesResponse,
        ])
        return {
          triplePositions,
          exchangeRates,
        }
      } catch (err) {
        console.error(err)
        return null
      }
    },
  })

export const ReactQueryTornadoGraph = ({ tripleId }: { tripleId: string }) => {
  // Use the query with current sort order
  const { data, isLoading, isError, error } = useQuery(
    triplePositionsQueryOptions(tripleId)
  )
  return (
    <TriplePositionsTornadoMinGraph
      exchangeRates={data?.exchangeRates}
      triplePositionsData={data?.triplePositions}
    />
  )
}

export const TriplePositionsTornadoMinGraph = ({
  exchangeRates,
  triplePositionsData,
}: {
  exchangeRates: any
  triplePositionsData: any
}) => {
  const rangesFormatted = generateTriplePositionsTornadoGraphRanges({
    exchangeRates,
    triplePositionsData,
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rangesFormatted}
        stackOffset="sign"
        layout="vertical"
        barGap={0}
        barCategoryGap={0}
      >
        <XAxis type="number" hide={true} />
        <YAxis dataKey="name" type="number" reversed hide={true} />
        {/* <Tooltip /> */}
        <Bar dataKey="aggregateVaultBalance" fill="#31ad31" stackId="stack" />
        <Bar
          dataKey="aggregateCounterVaultBalance"
          fill="#bc4535"
          stackId="stack"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
