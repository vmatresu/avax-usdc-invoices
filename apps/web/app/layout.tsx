import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AppQueryClientProvider } from './providers/QueryClientProvider';
import { WagmiProvider } from './providers/WagmiProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Avalanche USDC Invoices | On-Chain Payment Platform',
  description:
    'Create, pay, and verify invoices on Avalanche C-Chain using native USDC. No backend, pure on-chain verification.',
  keywords: ['Avalanche', 'USDC', 'Invoices', 'Blockchain', 'Payments', 'Web3'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <WagmiProvider>
          <AppQueryClientProvider>{children}</AppQueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
