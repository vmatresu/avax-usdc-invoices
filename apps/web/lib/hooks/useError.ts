/**
 * Error handling utilities and hooks
 * Single Responsibility: Centralized error handling
 */

'use client';

import { useCallback } from 'react';
import {
  getErrorMessage,
  getErrorCode,
  logger,
  isAppError,
  type AppError,
  WalletNotConnectedError,
  WrongNetworkError,
} from '@avax-usdc-invoices/shared';
import { useAccount } from 'wagmi';
import { NetworkConfigService } from '../config/network';

/**
 * Hook for error handling
 */
export function useError() {
  const { address, chain, isConnected } = useAccount();

  /**
   * Validates wallet connection state
   */
  const validateWallet = useCallback((): void => {
    if (!isConnected || !address) {
      throw new WalletNotConnectedError();
    }

    const networkConfig = NetworkConfigService.getInstance();
    const expectedChainId = networkConfig.getChainId();

    if (chain?.id !== expectedChainId) {
      throw new WrongNetworkError(expectedChainId, chain?.id || 0);
    }
  }, [isConnected, address, chain]);

  /**
   * Handles errors with logging and user-friendly messages
   */
  const handleError = useCallback((error: unknown): string => {
    const message = getErrorMessage(error);
    const code = getErrorCode(error);

    logger.error('Error occurred', error as Error, { code });

    if (isAppError(error)) {
      return (error as AppError).message;
    }

    return message;
  }, []);

  /**
   * Wraps async functions with error handling
   */
  const withErrorHandling = useCallback(
    async <T>(fn: () => Promise<T>, onError?: (error: string) => void): Promise<T | null> => {
      try {
        validateWallet();
        return await fn();
      } catch (error) {
        const message = handleError(error);
        if (onError) {
          onError(message);
        }
        return null;
      }
    },
    [validateWallet, handleError]
  );

  return {
    validateWallet,
    handleError,
    withErrorHandling,
  };
}

/**
 * Export for use in non-hook contexts
 */
export { getErrorMessage, getErrorCode };
