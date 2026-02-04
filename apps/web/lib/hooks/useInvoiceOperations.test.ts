/**
 * Tests for useInvoiceOperations hook
 * Tests invoice creation, payment, and USDC approval
 */

import { GAS_LIMITS } from '@avax-usdc-invoices/shared';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useInvoiceOperations } from './useInvoiceOperations';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
}));

// Mock NetworkConfigService
jest.mock('../config/network', () => ({
  NetworkConfigService: {
    getInstance: jest.fn(() => ({
      getInvoiceManagerAddress: jest.fn(() => '0x1234567890abcdef1234567890abcdef12345678'),
      getUSDCAddress: jest.fn(() => '0x5425890298aed601595a70AB815c96711a31Bc65'),
    })),
  },
}));

// Mock logger
jest.mock('@avax-usdc-invoices/shared', () => ({
  ...jest.requireActual('@avax-usdc-invoices/shared'),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useInvoiceOperations', () => {
  const mockWriteContract = jest.fn();
  const _mockWaitForTransactionReceipt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      isPending: false,
      error: null,
    });
    useWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      data: undefined,
    });
  });

  describe('createInvoice', () => {
    const params = {
      invoiceId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount: 1000000n,
      dueAt: 1704067200,
    };

    it('should call writeContract with correct parameters', async () => {
      mockWriteContract.mockResolvedValue('0xtxhash');
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.createInvoice(params);
      });

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '0x1234567890abcdef1234567890abcdef12345678',
            functionName: 'createInvoice',
            args: expect.arrayContaining([
              params.invoiceId,
              '0x5425890298aed601595a70AB815c96711a31Bc65',
              params.amount,
              params.dueAt,
            ]),
            gas: GAS_LIMITS.CREATE_INVOICE,
          })
        );
      });
    });

    it('should set loading state while creating invoice', async () => {
      mockWriteContract.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('0xtxhash'), 100))
      );
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.createInvoice(params);
      });

      expect(result.current.state.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it('should return transaction hash on success', async () => {
      const txHash = '0xtxhash123456';
      mockWriteContract.mockResolvedValue(txHash);
      const { result } = renderHook(() => useInvoiceOperations());

      const hash = act(() => {
        return result.current.createInvoice(params);
      });

      await waitFor(() => {
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      const error = new Error('Transaction failed');
      mockWriteContract.mockRejectedValue(error);
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.createInvoice(params);
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Transaction failed');
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it('should reset state when resetState is called', async () => {
      mockWriteContract.mockRejectedValue(new Error('Error'));
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.createInvoice(params);
      });

      await waitFor(() => {
        expect(result.current.state.error).toBeTruthy();
      });

      act(() => {
        result.current.resetState();
      });

      expect(result.current.state).toEqual({
        isLoading: false,
        isPending: false,
        error: null,
      });
    });
  });

  describe('payInvoice', () => {
    const params = {
      invoiceId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount: 1000000n,
    };

    it('should call writeContract with correct parameters', async () => {
      mockWriteContract.mockResolvedValue('0xtxhash');
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.payInvoice(params);
      });

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '0x1234567890abcdef1234567890abcdef12345678',
            functionName: 'payInvoice',
            args: [params.invoiceId],
            gas: GAS_LIMITS.PAY_INVOICE,
          })
        );
      });
    });

    it('should set loading state while paying invoice', async () => {
      mockWriteContract.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('0xtxhash'), 100))
      );
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.payInvoice(params);
      });

      expect(result.current.state.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it('should return transaction hash on success', async () => {
      const txHash = '0xtxhash123456';
      mockWriteContract.mockResolvedValue(txHash);
      const { result } = renderHook(() => useInvoiceOperations());

      const hash = act(() => {
        return result.current.payInvoice(params);
      });

      await waitFor(() => {
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      const error = new Error('Payment failed');
      mockWriteContract.mockRejectedValue(error);
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.payInvoice(params);
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Payment failed');
      });
    });
  });

  describe('approveUSDC', () => {
    const amount = 1000000n;

    it('should call writeContract with correct parameters', async () => {
      mockWriteContract.mockResolvedValue('0xtxhash');
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.approveUSDC(amount);
      });

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            address: '0x5425890298aed601595a70AB815c96711a31Bc65',
            functionName: 'approve',
            args: ['0x1234567890abcdef1234567890abcdef12345678', amount],
            gas: GAS_LIMITS.APPROVE_USDC,
          })
        );
      });
    });

    it('should set loading state while approving', async () => {
      mockWriteContract.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('0xtxhash'), 100))
      );
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.approveUSDC(amount);
      });

      expect(result.current.state.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });

    it('should return transaction hash on success', async () => {
      const txHash = '0xtxhash123456';
      mockWriteContract.mockResolvedValue(txHash);
      const { result } = renderHook(() => useInvoiceOperations());

      const hash = act(() => {
        return result.current.approveUSDC(amount);
      });

      await waitFor(() => {
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      const error = new Error('Approval failed');
      mockWriteContract.mockRejectedValue(error);
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.approveUSDC(amount);
      });

      await waitFor(() => {
        expect(result.current.state.error).toBe('Approval failed');
      });
    });
  });

  describe('state management', () => {
    it('should combine loading states from wagmi hooks', () => {
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        isPending: true,
        error: null,
      });
      useWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.isPending).toBe(true);
    });

    it('should update state when writeContract error occurs', async () => {
      useWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        isPending: false,
        error: new Error('Write error'),
      });

      const { result } = renderHook(() => useInvoiceOperations());

      await waitFor(() => {
        expect(result.current.state.error).toBe('Write error');
      });
    });
  });
});
