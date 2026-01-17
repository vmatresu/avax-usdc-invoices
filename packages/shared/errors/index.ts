/**
 * Custom error classes for better error handling
 * Single Responsibility: Defines domain-specific errors
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly timestamp: number;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wallet connection errors
 */
export class WalletNotConnectedError extends AppError {
  constructor() {
    super('Wallet is not connected', 'WALLET_NOT_CONNECTED');
  }
}

export class WrongNetworkError extends AppError {
  constructor(expectedChainId: number, actualChainId: number) {
    super(`Wrong network. Expected ${expectedChainId}, got ${actualChainId}`, 'WRONG_NETWORK', {
      expectedChainId,
      actualChainId,
    });
  }
}

/**
 * Invoice-related errors
 */
export class InvoiceNotFoundError extends AppError {
  constructor(invoiceId: string) {
    super(`Invoice ${invoiceId} not found`, 'INVOICE_NOT_FOUND', { invoiceId });
  }
}

export class InvoiceAlreadyPaidError extends AppError {
  constructor(invoiceId: string) {
    super(`Invoice ${invoiceId} is already paid`, 'INVOICE_ALREADY_PAID', { invoiceId });
  }
}

export class InvoiceExpiredError extends AppError {
  constructor(invoiceId: string, dueAt: number) {
    super(`Invoice ${invoiceId} expired at ${dueAt}`, 'INVOICE_EXPIRED', { invoiceId, dueAt });
  }
}

export class InvoiceValidationError extends AppError {
  constructor(message: string) {
    super(message, 'INVOICE_VALIDATION_ERROR');
  }
}

/**
 * Transaction-related errors
 */
export class InsufficientFundsError extends AppError {
  constructor() {
    super('Insufficient funds for this transaction', 'INSUFFICIENT_FUNDS');
  }
}

export class InsufficientAllowanceError extends AppError {
  constructor() {
    super('Insufficient token allowance', 'INSUFFICIENT_ALLOWANCE');
  }
}

export class TransactionFailedError extends AppError {
  constructor(transactionHash?: string, reason?: string) {
    super(`Transaction failed${reason ? `: ${reason}` : ''}`, 'TRANSACTION_FAILED', {
      transactionHash,
      reason,
    });
  }
}

export class TransactionRevertedError extends AppError {
  constructor(reason: string) {
    super(`Transaction reverted: ${reason}`, 'TRANSACTION_REVERTED', { reason });
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', details);
  }
}

export class RPCError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'RPC_ERROR', details);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
  }
}

/**
 * Utility to check if an error is a known application error
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Utility to get error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Utility to get error code for tracking
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}
