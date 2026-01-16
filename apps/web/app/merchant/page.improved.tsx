/**
 * Merchant dashboard page - Improved version
 * SOLID Principles:
 * - Single Responsibility: Delegates to services and hooks
 * - Open/Closed: Extensible through service layer
 * - Dependency Inversion: Depends on abstractions
 */

'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAccount } from 'wagmi';
import type { Invoice, InvoiceStatus } from '@avalanche-bridge/shared';
import {
  WalletNotConnectedError,
  logger,
  generateUUID,
  uuidToBytes32,
  InvoiceStatus,
  ERROR_MESSAGES,
  UI_CONSTANTS,
} from '@avalanche-bridge/shared';

// Custom hooks
import { useMerchantInvoices, useInvoiceOperations } from '@/lib/hooks';
import { useError } from '@/lib/hooks/useError';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorMessage } from '@/lib/components/ErrorMessage';
import { LoadingState } from '@/lib/components/LoadingState';
import { InvoiceStatusBadge } from '@/lib/components/InvoiceStatusBadge';

// Utils
import { formatUSDC, formatTimestamp, parseUSDC } from '@/lib/utils';

interface CreateInvoiceForm {
  amount: string;
  dueDate: string;
}

interface LocalInvoice extends Invoice {
  uuid?: string;
}

/**
 * Merchant Dashboard Component
 */
export default function MerchantPage() {
  const { address, isConnected, chain } = useAccount();
  const [form, setForm] = useState<CreateInvoiceForm>({ amount: '', dueDate: '' });
  const [localInvoices, setLocalInvoices] = useState<LocalInvoice[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Use custom hooks for state management
  const { invoices, isLoading, error, refetch } = useMerchantInvoices(address);
  const { createInvoice, state: operationState, resetState } = useInvoiceOperations();
  const { handleError, validateWallet } = useError();

  /**
   * Handles invoice creation form submission
   * Single Responsibility: Form validation and submission
   */
  const handleCreateInvoice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetState();

    try {
      validateWallet();

      // Validate input
      if (!form.amount || parseFloat(form.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const amount = parseUSDC(form.amount);
      const dueAtTimestamp = form.dueDate
        ? Math.floor(new Date(form.dueDate).getTime() / 1000)
        : 0;

      const uuid = generateUUID();
      const invoiceId = uuidToBytes32(uuid);

      logger.info('Creating invoice', { uuid, amount, dueAt: dueAtTimestamp });

      const hash = await createInvoice({
        invoiceId,
        amount,
        dueAt: dueAtTimestamp,
      });

      if (hash) {
        // Add to local state for immediate feedback
        const newInvoice: LocalInvoice = {
          id: invoiceId,
          uuid,
          merchant: address!,
          token: '', // Will be fetched on refresh
          amount,
          dueAt: dueAtTimestamp,
          paid: false,
          payer: '',
          paidAt: 0,
        };

        setLocalInvoices((prev) => [newInvoice, ...prev]);
        setForm({ amount: '', dueDate: '' });
        setShowForm(false);

        // Refetch after a short delay
        setTimeout(() => refetch(), 2000);
      }
    } catch (err) {
      handleError(err);
    }
  };

  /**
   * Combines blockchain invoices with local ones
   * Ensures users see their newly created invoices immediately
   */
  const allInvoices = [...localInvoices, ...invoices];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                {ERROR_MESSAGES.WALLET_NOT_CONNECTED}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Merchant Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create invoices and track payments
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Invoice'}
          </Button>
          {invoices.length > 0 && (
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          )}
        </div>

        {/* Create Invoice Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
              <CardDescription>
                Generate an on-chain invoice that customers can pay with USDC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    disabled={operationState.isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    disabled={operationState.isLoading}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={operationState.isLoading}
                    className="flex-1"
                  >
                    {operationState.isLoading ? 'Creating Invoice...' : 'Create Invoice'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={operationState.isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              <ErrorMessage error={operationState.error} />
            </CardContent>
          </Card>
        )}

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
            <CardDescription>
              View and track your created invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState message="Loading invoices..." />
            ) : allInvoices.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-slate-500">
                  {showForm ? 'Create your first invoice above' : 'No invoices yet'}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allInvoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">
                            Invoice #{invoice.uuid || invoice.id.slice(0, 8)}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {formatUSDC(invoice.amount)} USDC
                          </div>
                          {invoice.dueAt > 0 && (
                            <div className="mt-1 text-sm text-slate-500">
                              Due: {formatTimestamp(invoice.dueAt)}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          <InvoiceStatusBadge
                            status={deriveInvoiceStatus(invoice)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a href={`/pay/${invoice.id}`}>View</a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && <ErrorMessage error={error} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Derives invoice status from invoice data
 * Single Responsibility: Status calculation logic
 */
function deriveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.paid) {
    return InvoiceStatus.PAID;
  }

  if (invoice.dueAt > 0 && invoice.dueAt < Math.floor(Date.now() / 1000)) {
    return InvoiceStatus.EXPIRED;
  }

  return InvoiceStatus.PENDING;
}
