/**
 * Custom hook for invoice operations
 * Single Responsibility: Encapsulates invoice state and operations
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

import { type Invoice, InvoiceStatus, isInvoiceExpired, logger } from '@avax-usdc-invoices/shared';
import { InvoiceRepository } from '../services/InvoiceRepository';
import { getErrorMessage } from './useError';

interface UseInvoiceReturn {
  invoice: Invoice | null;
  status: InvoiceStatus;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing a single invoice
 */
export function useInvoice(invoiceId: string): UseInvoiceReturn {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = InvoiceRepository.getInstance();

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Fetching invoice via hook', { invoiceId });
      const data = await repository.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Failed to fetch invoice', err as Error, { invoiceId });
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, repository]);

  useEffect(() => {
    void fetchInvoice();
  }, [fetchInvoice]);

  const status = deriveInvoiceStatus(invoice);

  return {
    invoice,
    status,
    isLoading,
    error,
    refetch: fetchInvoice,
  };
}

/**
 * Hook for fetching merchant invoices
 */
export function useMerchantInvoices(merchantAddress: string | undefined): {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = InvoiceRepository.getInstance();

  const fetchInvoices = useCallback(async () => {
    if (!merchantAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Fetching merchant invoices via hook', { merchantAddress });
      const data = await repository.getMerchantInvoices(merchantAddress);
      setInvoices(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Failed to fetch merchant invoices', err as Error, { merchantAddress });
    } finally {
      setIsLoading(false);
    }
  }, [merchantAddress, repository]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    isLoading,
    error,
    refetch: fetchInvoices,
  };
}

/**
 * Helper to derive invoice status from invoice data
 */
function deriveInvoiceStatus(invoice: Invoice | null): InvoiceStatus {
  if (!invoice) {
    return InvoiceStatus.NOT_FOUND;
  }

  if (invoice.paid) {
    return InvoiceStatus.PAID;
  }

  if (invoice.dueAt > 0 && isInvoiceExpired(invoice.dueAt)) {
    return InvoiceStatus.EXPIRED;
  }

  return InvoiceStatus.PENDING;
}
