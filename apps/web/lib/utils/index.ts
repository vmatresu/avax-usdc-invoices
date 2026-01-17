/**
 * Utility functions export
 * Single Responsibility: Centralizes utility exports
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  formatUSDC as sharedFormatUSDC,
  formatTimestamp,
  shortenAddress,
  shortenTxHash,
  uuidToBytes32,
  generateUUID,
} from '@avax-usdc-invoices/shared';

/**
 * Combines class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats USDC amount for display
 */
export { formatUSDC as sharedFormatUSDC };

/**
 * Formats USDC amount (wrapper with default params)
 */
export function formatUSDC(amount: bigint): string {
  return sharedFormatUSDC(amount);
}

/**
 * Parses USDC amount from input string
 */
export function parseUSDC(input: string): bigint {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0) {
    return 0n;
  }
  return BigInt(Math.floor(num * 10 ** 6));
}

/**
 * Formats timestamp to readable date
 */
export { formatTimestamp };

/**
 * Shortens an address for display
 */
export { shortenAddress };

/**
 * Shortens a transaction hash for display
 */
export { shortenTxHash };

/**
 * Converts UUID to bytes32
 */
export { uuidToBytes32 };

/**
 * Generates a random UUID
 */
export { generateUUID };
