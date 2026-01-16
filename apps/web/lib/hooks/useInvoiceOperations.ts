/**
 * Custom hook for invoice operations
 * Single Responsibility: Encapsulates invoice write operations
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { CreateInvoiceParams, PaymentParams, InvoiceOperationState } from '@avalanche-bridge/shared';
import {
  logger,
  GAS_LIMITS,
} from '@avalanche-bridge/shared';
import { NetworkConfigService } from '../config/network';
import { INVOICE_MANAGER_ABI, USDC_ABI } from '../contracts/abi';
import { getErrorMessage } from './useError';

interface UseInvoiceOperationsReturn {
  createInvoice: (params: CreateInvoiceParams) => Promise<string | null>;
  payInvoice: (params: PaymentParams) => Promise<string | null>;
  approveUSDC: (amount: bigint) => Promise<string | null>;
  state: InvoiceOperationState;
  resetState: () => void;
}

/**
 * Hook for invoice write operations
 */
export function useInvoiceOperations(): UseInvoiceOperationsReturn {
  const [state, setState] = useState<InvoiceOperationState>({
    isLoading: false,
    isPending: false,
    error: null,
  });

  const { writeContract, data: hash, isPending, error: writeError } =
    useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const resetState = useCallback(() => {
    setState({ isLoading: false, isPending: false, error: null });
  }, []);

  const updateState = useCallback((updates: Partial<InvoiceOperationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const createInvoice = useCallback(
    async (params: CreateInvoiceParams): Promise<string | null> => {
      updateState({ isLoading: true, error: null });

      try {
        logger.info('Creating invoice via hook', params);

        const networkConfig = NetworkConfigService.getInstance();
        const contractAddress = networkConfig.getInvoiceManagerAddress();
        const usdcAddress = networkConfig.getUSDCAddress();

        const result = await writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_MANAGER_ABI,
          functionName: 'createInvoice',
          args: [
            params.invoiceId as `0x${string}`,
            usdcAddress as `0x${string}`,
            params.amount,
            params.dueAt,
          ],
          gas: GAS_LIMITS.CREATE_INVOICE,
        });

        updateState({ isPending: true });
        logger.info('Invoice created successfully', { ...params, hash: result });
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to create invoice', err as Error, params);
        return null;
      }
    },
    [writeContract, updateState]
  );

  const payInvoice = useCallback(
    async (params: PaymentParams): Promise<string | null> => {
      updateState({ isLoading: true, error: null });

      try {
        logger.info('Paying invoice via hook', params);

        const networkConfig = NetworkConfigService.getInstance();
        const contractAddress = networkConfig.getInvoiceManagerAddress();

        const result = await writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_MANAGER_ABI,
          functionName: 'payInvoice',
          args: [params.invoiceId as `0x${string}`],
          gas: GAS_LIMITS.PAY_INVOICE,
        });

        updateState({ isPending: true });
        logger.info('Invoice paid successfully', { ...params, hash: result });
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to pay invoice', err as Error, params);
        return null;
      }
    },
    [writeContract, updateState]
  );

  const approveUSDC = useCallback(
    async (amount: bigint): Promise<string | null> => {
      updateState({ isLoading: true, error: null });

      try {
        logger.info('Approving USDC via hook', { amount });

        const networkConfig = NetworkConfigService.getInstance();
        const usdcAddress = networkConfig.getUSDCAddress();
        const contractAddress = networkConfig.getInvoiceManagerAddress();

        const result = await writeContract({
          address: usdcAddress as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, amount],
          gas: GAS_LIMITS.APPROVE_USDC,
        });

        updateState({ isPending: true });
        logger.info('USDC approved successfully', { amount, hash: result });
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to approve USDC', err as Error, { amount });
        return null;
      }
    },
    [writeContract, updateState]
  );

  // Update pending state based on wagmi hooks
  useEffect(() => {
    updateState({ isPending: isPending || isConfirming });
  }, [isPending, isConfirming, updateState]);

  // Update error state based on wagmi error
  useEffect(() => {
    if (writeError) {
      const errorMessage = getErrorMessage(writeError);
      updateState({ isLoading: false, error: errorMessage });
    }
  }, [writeError, updateState]);

  return {
    createInvoice,
    payInvoice,
    approveUSDC,
    state: {
      isLoading: state.isLoading || isPending || isConfirming,
      isPending: state.isPending || isPending || isConfirming,
      error: state.error || (writeError ? getErrorMessage(writeError) : null),
    },
    resetState,
  };
}
