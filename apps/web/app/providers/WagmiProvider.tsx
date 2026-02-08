'use client';

import { config } from '@/lib/wagmi';
import { QueryClient } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';

const _queryClient = new QueryClient();

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
