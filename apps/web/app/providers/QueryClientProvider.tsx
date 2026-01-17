'use client';

import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function AppQueryClientProvider({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider client={queryClient}>{children}</ReactQueryProvider>;
}
