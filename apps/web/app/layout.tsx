import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WagmiProvider } from './providers/WagmiProvider'
import { QueryClientProvider } from './providers/QueryClientProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Avalanche USDC Invoices',
  description: 'On-chain invoice management on Avalanche C-Chain using native USDC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <QueryClientProvider>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
