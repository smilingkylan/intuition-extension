import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { intuitionTestnet } from '~/constants/intuitionTestnet'

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, intuitionTestnet],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId: 'your-project-id' // Get this from WalletConnect
    }),
    coinbaseWallet({
      appName: 'Intuition Extension',
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [intuitionTestnet.id]: http()
  },
})
