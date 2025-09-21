import { defineChain } from "viem";

export const intuitionTestnet = defineChain({
  id: 13579,
  name: "Intuition Testnet",
  network: "intuition-testnet",
  nativeCurrency: {
    name: "Testnet TRUST",
    symbol: "TTRUST",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.intuition.systems"],
      webSocket: ["wss://testnet.rpc.intuition.systems/ws"],
    },
    public: {
      http: ["https://testnet.rpc.intuition.systems"],
      webSocket: ["wss://testnet.rpc.intuition.systems/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "IntuitionScan (Testnet)",
      url: "https://testnet.explorer.intuition.systems/",
      apiUrl: "https://testnet.explorer.intuition.systems/api",
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11", // replace
      blockCreated: 1,
    },
  },
});