import axios from 'axios'

import { CONFIG, getChainConfigByChainId } from '~/constants'
import { getAtomById, getTripleById, getTriplesByAtomId } from './queries'

const { REVEL8_API_ORIGIN } = CONFIG

export type PaginationParams = {
  page?: number
  limit?: number
  orderBy?: string
  direction?: string
}

export const revel8Axios = axios.create({
  baseURL: REVEL8_API_ORIGIN,
})

export const i7nAxios = axios.create({
  // baseURL: 'https://prod.base.intuition-api.com/v1/graphql',
  // baseURL: 'https://nginx.prod.base-sepolia.intuition.sh/v1/graphql',
  baseURL: 'https://prod.base-sepolia.intuition-api.com/v1/graphql',
})

export const graphQLQuery = async (query: string, variables: any) => {
  const { data } = await i7nAxios.post('', {
    query,
    variables,
  })
  return data
}

export const fetchExchangeRates = async () => {
  const { data } = await revel8Axios.get('exchange-rates')
  return data
}

export const fetchAtomById = async (atomId: string) => {
  if (!atomId) throw new Error('fetchAtomById atomId is required')
  const { data } = await i7nAxios.post('', {
    query: getAtomById,
    variables: {
      atomId: Number(atomId),
    },
  })
  return data
}

export const fetchTriplesByAtomId = async (atomId: string, variables?: any) => {
  const { data } = await i7nAxios.post('', {
    query: getTriplesByAtomId,
    variables: {
      atomId: Number(atomId),
      limit: 10,
      offset: 0,
      order_by: { block_number: 'desc' },
      ...variables,
    },
  })
  return data
}

export const fetchTriple = async (tripleId: string) => {
  const response = await i7nAxios.post(``, {
    query: getTripleById,
    variables: {
      tripleId: Number(tripleId),
    },
  })
  return response
}

export const fetchContractCode = async (
  address: `caip10:eip155:${string}:0x${string}` | `0x${string}`,
  chainId?: string,
  blockParameter = 'latest'
) => {
  console.log('chainId', chainId)
  let nodeUrl = CONFIG.ETH_RPC_URL
  if (chainId) {
    const decimalChainId = parseInt(chainId.replace('eip155:', ''))
    console.log('decimalChainId', decimalChainId)
    const config = getChainConfigByChainId(decimalChainId)
    console.log('config', config)
    if (!config)
      throw new Error('fetchContractCode error: no config found for' + chainId)
    nodeUrl = config.ETH_RPC_URL
  }
  const { data } = await axios.post(
    nodeUrl,
    {
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [address, blockParameter],
      id: 1,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  return data.result
}

export const uploadJSONToIPFS = async (jsonList: object[]) => {
  const { data } = await revel8Axios.post('ipfs/upload-json', {
    jsonList,
  })
  return data
}

export const uploadImageUrlToHash = async (imageUrl: string) => {
  const { data } = await revel8Axios.post('ipfs/image/url', {
    url: imageUrl,
  })
  return data
}

export const uploadImage = async (formData: FormData) => {
  const { data } = await revel8Axios.post('ipfs/upload-image', formData)
  return data
}

