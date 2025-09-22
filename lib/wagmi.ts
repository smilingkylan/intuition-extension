import { createConfig, http } from 'wagmi'
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { intuitionTestnet } from '~/constants/intuitionTestnet'

export const wagmiConfig = createConfig({
  chains: [intuitionTestnet],
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
    [intuitionTestnet.id]: http()
  },
})
