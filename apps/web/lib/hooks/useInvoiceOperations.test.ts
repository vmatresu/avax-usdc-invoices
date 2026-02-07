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
  useWriteContract: jest.fn() as any,
  useWaitForTransactionReceipt: jest.fn() as any,
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

    it('should call writeContract with correct parameters', () => {
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.createInvoice(params);
      });

      // writeContract is called synchronously
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x1234567890abcdef1234567890abcdef12345678',
          functionName: 'createInvoice',
          args: expect.arrayContaining([
            params.invoiceId,
            '0x5425890298aed601595a70AB815c96711a31Bc65',
            params.amount,
            BigInt(params.dueAt),
          ]),
          gas: GAS_LIMITS.CREATE_INVOICE,
        })
      );
    });

    it('should set loading state while creating invoice', async () => {
      // In wagmi v2, writeContract is synchronous - it triggers the transaction.
      // isLoading/isPending comes from the hook state
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      // With isPending: true in the mock, isLoading should be true
      expect(result.current.state.isLoading).toBe(true);
    });

    it('should return transaction hash on success', () => {
      const txHash = '0xtxhash123456';
      // The hash comes through the hook's data prop, not from writeContract return
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: txHash,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      // Call createInvoice and verify it returns the hash from hook state
      act(() => {
        const hash = result.current.createInvoice(params);
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      // Wagmi's writeContract doesn't throw - errors come through the hook's error prop
      // Update the mock to return an error through useWriteContract
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: new Error('Transaction failed'),
      });

      const { result } = renderHook(() => useInvoiceOperations());

      // Error should be propagated through the hook's error prop
      await waitFor(() => {
        expect(result.current.state.error).toBe('Transaction failed');
      });
    });

    it('should reset state when resetState is called', () => {
      // First set an error via the hook mock
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: new Error('Error'),
      });

      const { result, rerender } = renderHook(() => useInvoiceOperations());

      // Verify error is set
      expect(result.current.state.error).toBe('Error');

      // Now mock no error and call resetState
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: null,
      });

      rerender();

      act(() => {
        result.current.resetState();
      });

      expect(result.current.state.error).toBe(null);
    });
  });

  describe('payInvoice', () => {
    const params = {
      invoiceId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount: 1000000n,
    };

    it('should call writeContract with correct parameters', () => {
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.payInvoice(params);
      });

      // writeContract is called synchronously
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x1234567890abcdef1234567890abcdef12345678',
          functionName: 'payInvoice',
          args: [params.invoiceId],
          gas: GAS_LIMITS.PAY_INVOICE,
        })
      );
    });

    it('should set loading state while paying invoice', () => {
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should return transaction hash on success', () => {
      const txHash = '0xtxhash123456';
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: txHash,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        const hash = result.current.payInvoice(params);
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      // Wagmi's writeContract doesn't throw - errors come through the hook's error prop
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: new Error('Payment failed'),
      });

      const { result } = renderHook(() => useInvoiceOperations());

      await waitFor(() => {
        expect(result.current.state.error).toBe('Payment failed');
      });
    });
  });

  describe('approveUSDC', () => {
    const amount = 1000000n;

    it('should call writeContract with correct parameters', () => {
      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        result.current.approveUSDC(amount);
      });

      // writeContract is called synchronously
      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: '0x5425890298aed601595a70AB815c96711a31Bc65',
          functionName: 'approve',
          args: ['0x1234567890abcdef1234567890abcdef12345678', amount],
          gas: GAS_LIMITS.APPROVE_USDC,
        })
      );
    });

    it('should set loading state while approving', () => {
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should return transaction hash on success', () => {
      const txHash = '0xtxhash123456';
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: txHash,
        isPending: false,
        error: null,
      });

      const { result } = renderHook(() => useInvoiceOperations());

      act(() => {
        const hash = result.current.approveUSDC(amount);
        expect(hash).toBe(txHash);
      });
    });

    it('should set error on failure', async () => {
      // Wagmi's writeContract doesn't throw - errors come through the hook's error prop
      (useWriteContract as jest.Mock).mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: new Error('Approval failed'),
      });

      const { result } = renderHook(() => useInvoiceOperations());

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
