'use client';

import { QueryClient } from '@tanstack/react-query';
import { WagmiConfig, createConfig, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';

const _queryClient = new QueryClient();

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43113');
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

const config = createConfig({
  chains: chainId === 43114 ? [avalanche] : [avalancheFuji],
  transports: {
    [avalanche.id]: http(chainId === 43114 ? rpcUrl : 'https://api.avax.network/ext/bc/C/rpc'),
    [avalancheFuji.id]: http(
      chainId === 43113 ? rpcUrl : 'https://api.avax-test.network/ext/bc/C/rpc'
    ),
  },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
