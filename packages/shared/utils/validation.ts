/**
 * Validation utilities for business logic
 * Single Responsibility: Handles all input validation
 */

import {
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  INVOICE_SETTINGS,
} from '../constants';
import type { ValidationResult } from '../types';

/**
 * Validates an Ethereum address
 */
export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return { isValid: false, error: ERROR_MESSAGES.CONFIGURATION_ERROR };
  }
  if (!VALIDATION_PATTERNS.ADDRESS.test(address)) {
    return { isValid: false, error: 'Invalid address format' };
  }
  return { isValid: true };
}

/**
 * Validates a bytes32 hash (invoice ID)
 */
export function validateBytes32(hash: string): ValidationResult {
  if (!hash) {
    return { isValid: false, error: ERROR_MESSAGES.INVOICE_NOT_FOUND };
  }
  if (!VALIDATION_PATTERNS.BYTES32.test(hash)) {
    return { isValid: false, error: 'Invalid invoice ID format' };
  }
  return { isValid: true };
}

/**
 * Validates a UUID
 */
export function validateUUID(uuid: string): ValidationResult {
  if (!uuid) {
    return { isValid: false, error: 'Invalid UUID format' };
  }
  if (!VALIDATION_PATTERNS.UUID.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }
  return { isValid: true };
}

/**
 * Validates invoice amount in USDC
 */
export function validateAmount(amount: bigint): ValidationResult {
  if (amount <= 0n) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  if (amount < INVOICE_SETTINGS.MIN_AMOUNT) {
    return { isValid: false, error: `Minimum amount is ${formatUSDC(INVOICE_SETTINGS.MIN_AMOUNT)} USDC` };
  }
  if (amount > INVOICE_SETTINGS.MAX_AMOUNT) {
    return { isValid: false, error: `Maximum amount is ${formatUSDC(INVOICE_SETTINGS.MAX_AMOUNT)} USDC` };
  }
  return { isValid: true };
}

/**
 * Validates invoice due date
 */
export function validateDueDate(dueAt: number): ValidationResult {
  if (dueAt === 0) {
    return { isValid: true }; // No expiration is valid
  }

  const now = Math.floor(Date.now() / 1000);
  const minDue = now + INVOICE_SETTINGS.MIN_DUE_DATE_HOURS * 3600;
  const maxDue = now + INVOICE_SETTINGS.MAX_DUE_DATE_DAYS * 86400;

  if (dueAt < minDue) {
    return {
      isValid: false,
      error: `Due date must be at least ${INVOICE_SETTINGS.MIN_DUE_DATE_HOURS} hour(s) from now`,
    };
  }
  if (dueAt > maxDue) {
    return {
      isValid: false,
      error: `Due date cannot be more than ${INVOICE_SETTINGS.MAX_DUE_DATE_DAYS} days from now`,
    };
  }
  return { isValid: true };
}

/**
 * Validates invoice creation parameters
 */
export function validateCreateInvoice(
  amount: bigint,
  dueAt: number
): ValidationResult {
  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  const dueDateValidation = validateDueDate(dueAt);
  if (!dueDateValidation.isValid) {
    return dueDateValidation;
  }

  return { isValid: true };
}

/**
 * Checks if an invoice is expired
 */
export function isInvoiceExpired(dueAt: number): boolean {
  if (dueAt === 0) {
    return false;
  }
  return dueAt < Math.floor(Date.now() / 1000);
}

/**
 * Formats USDC amount for display
 */
export function formatUSDC(amount: bigint): string {
  const num = Number(amount) / 10 ** 6;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
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
export function formatTimestamp(timestamp: number): string {
  if (timestamp === 0) {
    return 'No expiration';
  }
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Shortens an address for display
 */
export function shortenAddress(
  address: string,
  length: number = 6
): string {
  if (!address || address.length <= length * 2 + 4) {
    return address;
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Shortens a transaction hash for display
 */
export function shortenTxHash(hash: string, length: number = 8): string {
  return shortenAddress(hash, length);
}

/**
 * Converts UUID to bytes32
 */
export function uuidToBytes32(uuid: string): string {
  return '0x' + uuid.replace(/-/g, '');
}

/**
 * Generates a random UUID
 *
 * @warning This function uses Math.random() which is NOT cryptographically secure.
 * Use this only for:
 * - Test data generation
 * - Non-critical identifiers
 * - Where uniqueness is the only requirement
 *
 * For security-critical use cases (invoice IDs, payments, etc.),
 * use the `uuid` package instead:
 *
 * @example
 * import { v4 as uuidv4 } from 'uuid'
 * const secureUuid = uuidv4()
 *
 * This function is maintained for:
 * - Backward compatibility
 * - Internal tooling and testing
 * - Non-production scenarios
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
