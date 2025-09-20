import axios from 'axios'

// Create axios instance for GraphQL queries
export const graphqlAxios = axios.create({
  baseURL: 'https://testnet.intuition.sh/v1/graphql',
  headers: {
    'Content-Type': 'application/json',
  }
})

// GraphQL query helper
export const graphQLQuery = async <T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<{ data: T }> => {
  try {
    const { data } = await graphqlAxios.post('', {
      query,
      variables,
    })
    return data
  } catch (error) {
    console.error('GraphQL query error:', error)
    throw error
  }
}

// Helper to format atom labels with a prefix
export const formatAtomLabel = (prefix: string, value: string): string => {
  return `${prefix}:${value.toLowerCase()}`
}

// Helper specifically for social media usernames
export const formatSocialAtomLabel = (platform: string, username: string): string => {
  return formatAtomLabel(`${platform}-username`, username)
} 