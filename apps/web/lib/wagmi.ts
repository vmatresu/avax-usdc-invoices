/**
 * Wagmi configuration
 * Single Responsibility: Manages wagmi client setup
 */

import { createPublicClient, http as viemHttp } from 'viem';
import { createConfig, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { NetworkConfigService } from './config/network';

// Define local Anvil chain
const localAnvil = {
  id: 31337,
  name: 'Local Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
    public: { http: ['http://localhost:8545'] },
  },
  testnet: true,
} as const;

const networkConfig = NetworkConfigService.getInstance();
const chainId = networkConfig.getChainId();

export const config = createConfig({
  chains: chainId === 31337 ? [localAnvil] : chainId === 43114 ? [avalanche] : [avalancheFuji],
  transports: {
    [localAnvil.id]: http('http://localhost:8545'),
    [avalanche.id]: http(
      chainId === 43114 ? networkConfig.getRpcUrl() : 'https://api.avax.network/ext/bc/C/rpc'
    ),
    [avalancheFuji.id]: http(
      chainId === 43113 ? networkConfig.getRpcUrl() : 'https://api.avax-test.network/ext/bc/C/rpc'
    ),
  },
});

export const chainIdNumber = chainId;

// Export public client for use in services - using viem's createPublicClient for full actions
export const publicClient = createPublicClient({
  chain: chainId === 31337 ? localAnvil : chainId === 43114 ? avalanche : avalancheFuji,
  transport: viemHttp(networkConfig.getRpcUrl()),
});

// Export contract addresses for use in pages and API routes
// These are nullable to allow build-time success when env vars are not set
export const invoiceManagerAddress = (() => {
  try {
    return networkConfig.getInvoiceManagerAddress() as `0x${string}`;
  } catch {
    return undefined;
  }
})();

export const usdcAddress = (() => {
  try {
    return networkConfig.getUSDCAddress() as `0x${string}`;
  } catch {
    return undefined;
  }
})();
