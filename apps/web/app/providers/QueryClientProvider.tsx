'use client'

import { QueryClient as QueryClientProvider } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider client={queryClient}>
      {children}
    </ReactQueryProvider>
  )
}
