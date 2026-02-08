/**
 * Error handling utilities for blockchain transactions
 * Single Responsibility: Convert technical blockchain errors to user-friendly messages
 */

import { getErrorMessage } from '@avax-usdc-invoices/shared/errors';

export interface TransactionError {
  message: string;
  userMessage: string;
  code?: string;
  isUserRejection?: boolean;
}

/**
 * Parses blockchain transaction errors and returns user-friendly messages
 */
export function parseTransactionError(error: unknown): TransactionError {
  const errorMessage = getErrorMessage(error);

  // User rejected transaction
  if (isUserRejectionError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: "Transaction cancelled. You can try again when you're ready.",
      code: 'USER_REJECTED',
      isUserRejection: true,
    };
  }

  // Insufficient funds
  if (isInsufficientFundsError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: 'Insufficient funds. Please make sure you have enough USDC in your wallet.',
      code: 'INSUFFICIENT_FUNDS',
    };
  }

  // Insufficient allowance
  if (isInsufficientAllowanceError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: 'Insufficient allowance. Please approve the token spend first.',
      code: 'INSUFFICIENT_ALLOWANCE',
    };
  }

  // Network errors
  if (isNetworkError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
    };
  }

  // Gas estimation failed
  if (isGasEstimationError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: 'Transaction failed. The gas estimation failed. Please try again.',
      code: 'GAS_ESTIMATION_FAILED',
    };
  }

  // Contract execution reverted
  if (isExecutionRevertedError(errorMessage)) {
    return {
      message: errorMessage,
      userMessage: 'Transaction failed. The contract execution was reverted.',
      code: 'EXECUTION_REVERTED',
    };
  }

  // Default fallback
  return {
    message: errorMessage,
    userMessage: 'Transaction failed. Please try again or contact support if the issue persists.',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Checks if error is a user rejection
 */
function isUserRejectionError(message: string): boolean {
  const userRejectionPatterns = [
    'user rejected',
    'user denied',
    'user cancelled',
    'User rejected the request',
    'User denied transaction signature',
    'MetaMask Tx Signature: User denied transaction signature',
    'Request cancelled',
    'Transaction cancelled',
  ];

  return userRejectionPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Checks if error is related to insufficient funds
 */
function isInsufficientFundsError(message: string): boolean {
  const insufficientFundsPatterns = [
    'insufficient funds',
    'insufficient balance',
    'not enough balance',
    'balance too low',
    'exceeds balance',
  ];

  return insufficientFundsPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Checks if error is related to insufficient allowance
 */
function isInsufficientAllowanceError(message: string): boolean {
  const allowancePatterns = [
    'insufficient allowance',
    'allowance exceeded',
    'ERC20: transfer amount exceeds allowance',
    'allowance too low',
  ];

  return allowancePatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Checks if error is network related
 */
function isNetworkError(message: string): boolean {
  const networkPatterns = [
    'network error',
    'connection error',
    'timeout',
    'could not connect',
    'network unreachable',
    'rpc error',
  ];

  return networkPatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Checks if error is related to gas estimation
 */
function isGasEstimationError(message: string): boolean {
  const gasPatterns = [
    'gas estimation failed',
    'gas required exceeds allowance',
    'out of gas',
    'gas limit exceeded',
  ];

  return gasPatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Checks if error is related to execution revert
 */
function isExecutionRevertedError(message: string): boolean {
  const revertPatterns = [
    'execution reverted',
    'revert',
    'transaction reverted',
    'contract execution failed',
  ];

  return revertPatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()));
}

/**
 * Gets a user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const parsed = parseTransactionError(error);
  return parsed.userMessage;
}
