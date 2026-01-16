/**
 * Tests for useInvoice hook
 * Tests invoice fetching, merchant invoices, and status derivation
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useInvoice, useMerchantInvoices } from './useInvoice';
import { InvoiceStatus } from '@avalanche-bridge/shared';

// Mock InvoiceRepository
jest.mock('../services/InvoiceRepository', () => ({
  InvoiceRepository: {
    getInstance: jest.fn(() => ({
      getInvoice: jest.fn(),
      getMerchantInvoices: jest.fn(),
    })),
  },
}));

// Mock logger
jest.mock('@avalanche-bridge/shared', () => ({
  ...jest.requireActual('@avalanche-bridge/shared'),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useInvoice', () => {
  const mockInvoice = {
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    merchant: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    token: '0x5425890298aed601595a70AB815c96711a31Bc65',
    amount: 1000000n,
    dueAt: 1704067200,
    paid: false,
    payer: '0x0000000000000000000000000000000000000000000',
    paidAt: 0,
  };

  const { InvoiceRepository } = require('../services/InvoiceRepository');
  const repository = InvoiceRepository.getInstance();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useInvoice', () => {
    it('should fetch invoice on mount', async () => {
      const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      repository.getInvoice.mockResolvedValue(mockInvoice);

      const { result } = renderHook(() => useInvoice(invoiceId));

      await waitFor(() => {
        expect(result.current.invoice).toEqual(mockInvoice);
      });

      expect(repository.getInvoice).toHaveBeenCalledWith(invoiceId);
    });

    it('should set loading state while fetching', async () => {
      const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      repository.getInvoice.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockInvoice), 100))
      );

      const { result } = renderHook(() => useInvoice(invoiceId));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle fetch error', async () => {
      const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const errorMessage = 'Invoice not found';
      repository.getInvoice.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useInvoice(invoiceId));

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.invoice).toBe(null);
    });

    it('should refetch invoice when refetch is called', async () => {
      const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      repository.getInvoice.mockResolvedValue(mockInvoice);

      const { result } = renderHook(() => useInvoice(invoiceId));

      await waitFor(() => {
        expect(repository.getInvoice).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(repository.getInvoice).toHaveBeenCalledTimes(2);
      });
    });

    it('should not fetch if invoiceId is empty', async () => {
      const { result } = renderHook(() => useInvoice(''));

      await waitFor(() => {
        expect(repository.getInvoice).not.toHaveBeenCalled();
      });

      expect(result.current.invoice).toBe(null);
    });

    describe('invoice status derivation', () => {
      it('should return NOT_FOUND status when invoice is null', async () => {
        const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        repository.getInvoice.mockResolvedValue(null);

        const { result } = renderHook(() => useInvoice(invoiceId));

        await waitFor(() => {
          expect(result.current.status).toBe(InvoiceStatus.NOT_FOUND);
        });
      });

      it('should return PAID status when invoice is paid', async () => {
        const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const paidInvoice = { ...mockInvoice, paid: true };
        repository.getInvoice.mockResolvedValue(paidInvoice);

        const { result } = renderHook(() => useInvoice(invoiceId));

        await waitFor(() => {
          expect(result.current.status).toBe(InvoiceStatus.PAID);
        });
      });

      it('should return EXPIRED status when invoice is past due date', async () => {
        const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const pastDueAt = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
        const expiredInvoice = { ...mockInvoice, dueAt: pastDueAt, paid: false };
        repository.getInvoice.mockResolvedValue(expiredInvoice);

        const { result } = renderHook(() => useInvoice(invoiceId));

        await waitFor(() => {
          expect(result.current.status).toBe(InvoiceStatus.EXPIRED);
        });
      });

      it('should return PENDING status for unpaid invoice not expired', async () => {
        const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const futureDueAt = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
        const pendingInvoice = { ...mockInvoice, dueAt: futureDueAt, paid: false };
        repository.getInvoice.mockResolvedValue(pendingInvoice);

        const { result } = renderHook(() => useInvoice(invoiceId));

        await waitFor(() => {
          expect(result.current.status).toBe(InvoiceStatus.PENDING);
        });
      });

      it('should return PENDING status for invoice with no expiration', async () => {
        const invoiceId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const noExpiryInvoice = { ...mockInvoice, dueAt: 0, paid: false };
        repository.getInvoice.mockResolvedValue(noExpiryInvoice);

        const { result } = renderHook(() => useInvoice(invoiceId));

        await waitFor(() => {
          expect(result.current.status).toBe(InvoiceStatus.PENDING);
        });
      });
    });
  });

  describe('useMerchantInvoices', () => {
    const mockMerchantInvoices = [
      mockInvoice,
      { ...mockInvoice, id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' },
    ];

    it('should fetch merchant invoices on mount', async () => {
      const merchantAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      repository.getMerchantInvoices.mockResolvedValue(mockMerchantInvoices);

      const { result } = renderHook(() => useMerchantInvoices(merchantAddress));

      await waitFor(() => {
        expect(result.current.invoices).toEqual(mockMerchantInvoices);
      });

      expect(repository.getMerchantInvoices).toHaveBeenCalledWith(merchantAddress);
    });

    it('should set loading state while fetching', async () => {
      const merchantAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      repository.getMerchantInvoices.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockMerchantInvoices), 100))
      );

      const { result } = renderHook(() => useMerchantInvoices(merchantAddress));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle fetch error', async () => {
      const merchantAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      const errorMessage = 'Failed to fetch invoices';
      repository.getMerchantInvoices.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useMerchantInvoices(merchantAddress));

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.invoices).toEqual([]);
    });

    it('should not fetch if merchantAddress is undefined', async () => {
      const { result } = renderHook(() => useMerchantInvoices(undefined));

      await waitFor(() => {
        expect(repository.getMerchantInvoices).not.toHaveBeenCalled();
      });

      expect(result.current.invoices).toEqual([]);
    });

    it('should not fetch if merchantAddress is empty', async () => {
      const { result } = renderHook(() => useMerchantInvoices(''));

      await waitFor(() => {
        expect(repository.getMerchantInvoices).not.toHaveBeenCalled();
      });

      expect(result.current.invoices).toEqual([]);
    });

    it('should refetch invoices when refetch is called', async () => {
      const merchantAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
      repository.getMerchantInvoices.mockResolvedValue(mockMerchantInvoices);

      const { result } = renderHook(() => useMerchantInvoices(merchantAddress));

      await waitFor(() => {
        expect(repository.getMerchantInvoices).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(repository.getMerchantInvoices).toHaveBeenCalledTimes(2);
      });
    });
  });
});
