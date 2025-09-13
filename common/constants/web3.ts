import { base, baseSepolia } from 'viem/chains'
import mainnetContractAbi from './mainnetContractAbi'
import sepoliaContractAbi from './sepoliaContractAbi'

export const INTUITION_CONTRACT_ADDRESSES = {
  'base-mainnet': '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5',
  'base-sepolia': '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665',
}

const NODE_ENV = process.env.NODE_ENV

export const BASE_MAINNET = {
  I8N_CONTRACT_ADDRESS: '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5',
  CHAIN_ID: 8453,
  CHAIN_ID_HEX: '0x2105',
  CHAIN_NAME: 'Base Mainnet',
  CHAIN_KEY: 'base-mainnet',
  CONTRACT_ABI: mainnetContractAbi,
  EXPLORER_DOMAIN: 'https://basescan.org',
  I8N_EXPLORER_DOMAIN: 'https://beta.portal.intuition.systems/app',
  REVEL8_API_ORIGIN: 'http://localhost:3333',
  // REVEL8_API_ORIGIN: 'https://api.base-sepolia.revel8.io',
  HAS_RELATED_IMAGE_VAULT_ID: '0',
  HAS_RELATED_URL_VAULT_ID: '0',
  CURRENCY_SYMBOL: 'ETH',
  DECIMAL_PRECISION: 18,
  CHAIN: base,
  REVEL8_EXPLORER_DOMAIN: 'http://localhost:3000',
  EXTENSION_ID: 'ojlkklnpbdnilcphkkondmobacilpdpb',
  EXTENSION_ORIGIN: 'chrome-extension://ojlkklnpbdnilcphkkondmobacilpdpb',
  TARGET_TYPES: {},
  ETH_RPC_URL:
    'https://base-mainnet.g.alchemy.com/v2/xww_HDMOC0nGOVJL-HtXWxn2oqXOtK5v',
}

export const BASE_SEPOLIA_PREDICATE_ATOMS_BY_TYPE = {
  'X_COM:USER': '23727',
}

export const BASE_SEPOLIA = {
  I8N_CONTRACT_ADDRESS: '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665',
  CHAIN_ID: 84532,
  CHAIN_ID_HEX: '0x14A34',
  CHAIN_NAME: 'Base Sepolia',
  CHAIN_KEY: 'base-sepolia',
  CONTRACT_ABI: sepoliaContractAbi,
  EXPLORER_DOMAIN: 'https://sepolia.basescan.org',
  I8N_EXPLORER_DOMAIN: 'https://dev.portal.intuition.systems/app',
  REVEL8_API_ORIGIN: 'http://localhost:3333',
  // REVEL8_API_ORIGIN: 'https://api.base-sepolia.revel8.io',
  CURRENCY_SYMBOL: 'ETH',
  DECIMAL_PRECISION: 18,
  CHAIN: baseSepolia,
  REVEL8_EXPLORER_DOMAIN: 'http://localhost:3000',
  EXTENSION_ID: 'ojlkklnpbdnilcphkkondmobacilpdpb',
  EXTENSION_ORIGIN: 'chrome-extension://ojlkklnpbdnilcphkkondmobacilpdpb',
  TARGET_TYPES: {
    ...BASE_SEPOLIA_PREDICATE_ATOMS_BY_TYPE,
  },
  HAS_RELATED_IMAGE_VAULT_ID: '26848',
  HAS_RELATED_URL_VAULT_ID: '20467',
  IS_RELEVANT_ATOM_FOR_ID: '20496',
  X_COM_ATOM_ID: '20493',
  EVM_ADDRESS_ATOM_ID: '27414',
  URL_ATOM_ID: '24715',
  OWNS_X_COM_ACCOUNT_ATOM_ID: '23727',
  REVEL8_SNAP_ATOM_ID: '25199',
  HAS_NICKNAME_ATOM_ID: '26813',
  IS_ATOM_ID: '26811',
  TRUSTWORTHY_ATOM_ID: '26858',
  ETH_RPC_URL:
    'https://base-sepolia.g.alchemy.com/v2/xww_HDMOC0nGOVJL-HtXWxn2oqXOtK5v',
}

export const CHAIN_CONFIGS = [BASE_MAINNET, BASE_SEPOLIA]

export const getChainConfigByChainId = (chainId: number | string) => {
  const typedChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId
  return CHAIN_CONFIGS.find((config) => config.CHAIN_ID === typedChainId)
}

export const getChainConfigByChainIdHex = (chainIdHex: string) => {
  return CHAIN_CONFIGS.find((config) => {
    return config.CHAIN_ID_HEX.toLowerCase() === chainIdHex.toLowerCase()
  })
}

export const MAINNET_CONTRACT_ABI = mainnetContractAbi

export const SEPOLIA_CONTRACT_ABI = sepoliaContractAbi

export const CONFIG =
  process.env.NODE_ENV === 'development' ? BASE_SEPOLIA : BASE_MAINNET

export const getConfig = () => {
  return CONFIG
}
