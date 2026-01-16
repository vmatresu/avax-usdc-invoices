/**
 * Wagmi configuration
 * Single Responsibility: Manages wagmi client setup
 */

import { createConfig, http } from 'wagmi';
import { avalancheFuji, avalanche } from 'wagmi/chains';
import { NetworkConfigService } from './config/network';

const networkConfig = NetworkConfigService.getInstance();
const chainId = networkConfig.getChainId();

export const config = createConfig({
  chains: chainId === 43114 ? [avalanche] : [avalancheFuji],
  transports: {
    [chainId === 43114 ? avalanche.id : avalancheFuji.id]: http(
      networkConfig.getRpcUrl()
    ),
  },
});

export const chainIdNumber = chainId;

// Export public client for use in services
export const publicClient = config.getClient({
  chainId: chainId === 43114 ? avalanche.id : avalancheFuji.id,
});
