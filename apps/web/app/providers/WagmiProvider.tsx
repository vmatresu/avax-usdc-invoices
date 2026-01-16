'use client'

import { WagmiConfig, createConfig, http } from 'wagmi'
import { avalancheFuji, avalanche } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43113')
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'

const config = createConfig({
  chains: chainId === 43114 ? [avalanche] : [avalancheFuji],
  transports: {
    [chainId === 43114 ? avalanche.id : avalancheFuji.id]: http(rpcUrl),
  },
})

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  )
}
