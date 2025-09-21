// import { base, baseSepolia } from 'viem/chains'
import mainnetContractAbi from './mainnetContractAbi'
import sepoliaContractAbi from './sepoliaContractAbi'
import {intuitionTestnetContractAbi} from './intuitionTestnetContractABI'
import { intuitionTestnet } from './intuitionTestnet'
import { base, baseSepolia } from 'viem/chains'

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
  // CHAIN: base,
  REVEL8_EXPLORER_DOMAIN: 'http://localhost:3000',
  EXTENSION_ID: 'ojlkklnpbdnilcphkkondmobacilpdpb',
  EXTENSION_ORIGIN: 'chrome-extension://ojlkklnpbdnilcphkkondmobacilpdpb',
  TARGET_TYPES: {},
  ETH_RPC_URL:
    'https://base-mainnet.g.alchemy.com/v2/xww_HDMOC0nGOVJL-HtXWxn2oqXOtK5v',
  CHAIN_CONFIG: base
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
  // CHAIN: baseSepolia,
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
  CHAIN_CONFIG: baseSepolia
}

export const INTUITION_TESTNET = {
  I8N_CONTRACT_ADDRESS: '0xB92EA1B47E4ABD0a520E9138BB59dBd1bC6C475B',
  CHAIN_ID: 13579,
  CHAIN_NAME: 'Intuition Testnet',
  CHAIN_KEY: 'intuition-testnet',
  CONTRACT_ABI: intuitionTestnetContractAbi,
  EXPLORER_DOMAIN: 'https://testnet.explorer.intuition.systems/',
  I8N_EXPLORER_DOMAIN: 'https://testnet.explorer.intuition.systems',
  CURRENCY_SYMBOL: 'tTRUST',
  DECIMAL_PRECISION: 18,
  // CHAIN: baseSepolia,
  GRAPHQL_ORIGIN: 'https://testnet.intuition.sh/v1/graphql',
  REVEL8_EXPLORER_DOMAIN: 'http://localhost:3000',
  REVEL8_API_ORIGIN: 'http://localhost:3333',
  HAS_RELATED_IMAGE_VAULT_ID: '0xc8b0ef5fbd15f3fa8a858b73641794e8701f3838e51f1dc463b9fd630b515675',
  HAS_RELATED_URL_VAULT_ID: '20467',
  IS_RELEVANT_ATOM_FOR_ID: '20496',
  X_COM_ATOM_ID: '20493',
  EVM_ADDRESS_ATOM_ID: '27414',
  URL_ATOM_ID: '24715',
  OWNS_X_COM_ACCOUNT_ATOM_ID: '23727',
  REVEL8_SNAP_ATOM_ID: '25199',
  HAS_NICKNAME_ATOM_ID: '0xfed083dd8c0a10780db78d9643f7ee8bdccf8a67ffffee9fdf27dd7d3481dd0b',
  IS_ATOM_ID: '0x9480992aaf84de3ead7ef7bc1eab16473de93647b83dc5c3575146d971b4737d',
  TRUSTWORTHY_ATOM_ID: '0x357a27d54fecf107f717eb144e660914beb907b83628dff7bb3ac0d51856afe8',
  ETH_RPC_URL: 'https://testnet.rpc.intuition.systems/http',
  CHAIN_CONFIG: intuitionTestnet
}

export const CHAIN_CONFIGS = [INTUITION_TESTNET, BASE_MAINNET, BASE_SEPOLIA]

export const getChainConfigByChainId = (chainId: number | string) => {
  const typedChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId
  return CHAIN_CONFIGS.find((config) => config.CHAIN_ID === typedChainId)
}

// export const MAINNET_CONTRACT_ABI = mainnetContractAbi

// export const SEPOLIA_CONTRACT_ABI = sepoliaContractAbi

export const CONFIG = INTUITION_TESTNET

export const getConfig = () => {
  return CONFIG
}

