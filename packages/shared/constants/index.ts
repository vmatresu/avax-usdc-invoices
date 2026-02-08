/**
 * Application constants and configuration
 * Single Responsibility: Centralizes all constant values
 */

import type { NetworkConfig } from '../types';

/**
 * Network configurations
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  LOCAL: {
    chainId: 31337,
    name: 'Local Anvil',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: 'http://localhost:8545',
    nativeTokenSymbol: 'ETH',
  },
  FUJI: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    nativeTokenSymbol: 'AVAX',
  },
  MAINNET: {
    chainId: 43114,
    name: 'Avalanche Mainnet C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    nativeTokenSymbol: 'AVAX',
  },
};

/**
 * USDC contract addresses (Circle-issued, native - NOT USDC.e)
 */
export const USDC_ADDRESSES: Record<number, string> = {
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Local (mock USDC)
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Fuji
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Mainnet
};

/**
 * USDC decimal places
 */
export const USDC_DECIMALS = 6;

/**
 * Gas estimation limits (in wei)
 */
export const GAS_LIMITS = {
  CREATE_INVOICE: 200000n,
  APPROVE_USDC: 50000n,
  PAY_INVOICE: 150000n,
} as const;

/**
 * Invoice expiration settings
 */
export const INVOICE_SETTINGS = {
  MIN_AMOUNT: 1n, // Minimum 1 USDC (0.000001)
  MAX_AMOUNT: 1000000000n * 10n ** 6n, // 1 billion USDC max
  MAX_DUE_DATE_DAYS: 365, // Max 1 year from now
  MIN_DUE_DATE_HOURS: 1, // Min 1 hour from now
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  ADDRESS_DISPLAY_LENGTH: 6,
  TRANSACTION_HASH_DISPLAY_LENGTH: 8,
  LOADING_TIMEOUT_MS: 30000,
  RETRY_DELAY_MS: 1000,
  MAX_RETRIES: 3,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WRONG_NETWORK: 'Please switch to the correct network',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
  INSUFFICIENT_ALLOWANCE: 'Please approve USDC spending first',
  INVOICE_NOT_FOUND: 'Invoice not found',
  INVOICE_ALREADY_PAID: 'This invoice has already been paid',
  INVOICE_EXPIRED: 'This invoice has expired',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  CONFIGURATION_ERROR: 'Configuration error. Please contact support.',
} as const;

/**
 * Validation regex patterns
 */
export const VALIDATION_PATTERNS = {
  ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  BYTES32: /^0x[a-fA-F0-9]{64}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

/**
 * Transaction status
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;
