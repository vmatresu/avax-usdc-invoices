/**
 * Custom hook for invoice operations
 * Single Responsibility: Encapsulates invoice write operations
 */

'use client';

import type {
  CreateInvoiceParams,
  InvoiceOperationState,
  PaymentParams,
} from '@avax-usdc-invoices/shared';
import { GAS_LIMITS, logger } from '@avax-usdc-invoices/shared';
import { useCallback, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
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

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

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
        logger.info('Creating invoice via hook', { ...params });

        const networkConfig = NetworkConfigService.getInstance();
        const contractAddress = networkConfig.getInvoiceManagerAddress();
        const usdcAddress = networkConfig.getUSDCAddress();

        writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_MANAGER_ABI,
          functionName: 'createInvoice',
          args: [
            params.invoiceId as `0x${string}`,
            usdcAddress as `0x${string}`,
            params.amount,
            BigInt(params.dueAt),
          ],
          gas: GAS_LIMITS.CREATE_INVOICE,
        });

        updateState({ isPending: true });
        logger.info('Invoice transaction submitted', { ...params });
        // In wagmi v2, writeContract returns void. The hash is available via the hook's data
        return hash ?? null;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to create invoice', err as Error, { ...params });
        return null;
      }
    },
    [writeContract, updateState, hash]
  );

  const payInvoice = useCallback(
    async (params: PaymentParams): Promise<string | null> => {
      updateState({ isLoading: true, error: null });

      try {
        logger.info('Paying invoice via hook', { ...params });

        const networkConfig = NetworkConfigService.getInstance();
        const contractAddress = networkConfig.getInvoiceManagerAddress();

        writeContract({
          address: contractAddress as `0x${string}`,
          abi: INVOICE_MANAGER_ABI,
          functionName: 'payInvoice',
          args: [params.invoiceId as `0x${string}`],
          gas: GAS_LIMITS.PAY_INVOICE,
        });

        updateState({ isPending: true });
        logger.info('Pay invoice transaction submitted', { ...params });
        return hash ?? null;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to pay invoice', err as Error, { ...params });
        return null;
      }
    },
    [writeContract, updateState, hash]
  );

  const approveUSDC = useCallback(
    async (amount: bigint): Promise<string | null> => {
      updateState({ isLoading: true, error: null });

      try {
        logger.info('Approving USDC via hook', { amount: amount.toString() });

        const networkConfig = NetworkConfigService.getInstance();
        const usdcAddress = networkConfig.getUSDCAddress();
        const contractAddress = networkConfig.getInvoiceManagerAddress();

        writeContract({
          address: usdcAddress as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, amount],
          gas: GAS_LIMITS.APPROVE_USDC,
        });

        updateState({ isPending: true });
        logger.info('USDC approval transaction submitted', { amount: amount.toString() });
        return hash ?? null;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        updateState({ isLoading: false, error: errorMessage });
        logger.error('Failed to approve USDC', err as Error, { amount: amount.toString() });
        return null;
      }
    },
    [writeContract, updateState, hash]
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
