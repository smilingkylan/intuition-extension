import {intuitionTestnetContractAbi} from './intuitionTestnetContractABI'
import { intuitionTestnet } from './intuitionTestnet'

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
  OWNS_ATOM_ID: '0xa64a3dc583e412acc729479ddc409949e510729e3a44219fc38efad0529a3d4d',
  REVEL8_SNAP_ATOM_ID: '25199',
  HAS_NICKNAME_ATOM_ID: '0xfed083dd8c0a10780db78d9643f7ee8bdccf8a67ffffee9fdf27dd7d3481dd0b',
  IS_ATOM_ID: '0x9480992aaf84de3ead7ef7bc1eab16473de93647b83dc5c3575146d971b4737d',
  TRUSTWORTHY_ATOM_ID: '0x357a27d54fecf107f717eb144e660914beb907b83628dff7bb3ac0d51856afe8',
  ETH_RPC_URL: 'https://testnet.rpc.intuition.systems/http',
  CHAIN_CONFIG: intuitionTestnet
}

export const CHAIN_CONFIGS = [INTUITION_TESTNET]

export const getChainConfigByChainId = (chainId: number | string) => {
  const typedChainId = typeof chainId === 'string' ? parseInt(chainId) : chainId
  return CHAIN_CONFIGS.find((config) => config.CHAIN_ID === typedChainId)
}

export const CONFIG = INTUITION_TESTNET

export const getConfig = () => {
  return CONFIG
}

