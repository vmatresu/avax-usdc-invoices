/**
 * Network configuration
 * Single Responsibility: Manages network settings
 */

import { NETWORKS, USDC_ADDRESSES, type NetworkConfig } from '@avalanche-bridge/shared';
import type { INetworkConfig } from '@avalanche-bridge/shared';

export class NetworkConfigService implements INetworkConfig {
  private static instance: NetworkConfigService;

  private constructor(private readonly chainId: number) {}

  static getInstance(): NetworkConfigService {
    if (!NetworkConfigService.instance) {
      const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '43113');
      NetworkConfigService.instance = new NetworkConfigService(chainId);
    }
    return NetworkConfigService.instance;
  }

  getChainId(): number {
    return this.chainId;
  }

  getNetworkConfig(): NetworkConfig {
    const networkName = this.chainId === 43114 ? 'MAINNET' : 'FUJI';
    const config = NETWORKS[networkName];

    if (!config) {
      throw new Error(`No configuration found for chain ID ${this.chainId}`);
    }

    return config;
  }

  getRpcUrl(): string {
    return this.getNetworkConfig().rpcUrl;
  }

  getExplorerUrl(): string {
    return this.getNetworkConfig().explorerUrl;
  }

  getUSDCAddress(): string {
    const address = USDC_ADDRESSES[this.chainId];

    if (!address) {
      throw new Error(`No USDC address configured for chain ID ${this.chainId}`);
    }

    return address;
  }

  getInvoiceManagerAddress(): string {
    const address = process.env.NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS;

    if (!address) {
      throw new Error('InvoiceManager contract address not configured');
    }

    return address;
  }

  isTestnet(): boolean {
    return this.chainId === 43113;
  }

  getNetworkName(): string {
    return this.getNetworkConfig().name;
  }
}
