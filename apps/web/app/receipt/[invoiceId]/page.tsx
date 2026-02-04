'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { InvoiceRepository } from '@/lib/services/InvoiceRepository';
import { formatDate, formatUSDC, shortenAddress } from '@/lib/utils';
import { logger } from '@avax-usdc-invoices/shared';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface InvoiceData {
  merchant: string;
  token: string;
  amount: bigint;
  dueAt: number;
  paid: boolean;
  payer: string;
  paidAt: number;
}

interface PaymentLog {
  transactionHash: string;
  blockNumber: bigint;
  args?: {
    invoiceId: string;
    merchant: string;
    payer: string;
    token: string;
    amount: bigint;
    paidAt: number;
  };
}

export default function ReceiptPage({ params }: { params: { invoiceId: string } }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [paymentLog, setPaymentLog] = useState<PaymentLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const invoiceId = params.invoiceId as `0x${string}`;
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ?? 'https://testnet.snowtrace.io';

  const loadReceipt = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError('');

    try {
      const repository = InvoiceRepository.getInstance();
      const invoiceData = await repository.getInvoice(invoiceId);
      setInvoice(invoiceData as InvoiceData);

      if (invoiceData.paid) {
        const log = await repository.getInvoicePaidEvent(invoiceId);
        if (log) {
          setPaymentLog(log as unknown as PaymentLog);
        }
      }
    } catch (err) {
      logger.error('Error loading receipt', err as Error, { invoiceId });
      setError('Failed to load receipt. The invoice may not exist.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void loadReceipt();
  }, [loadReceipt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center py-8">
            <div className="text-slate-500">Loading receipt...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertTitle>Invoice Not Found</AlertTitle>
            <AlertDescription>
              The invoice with ID {shortenAddress(invoiceId)} does not exist.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Home
          </Link>
          <h1 className="mt-4 text-4xl font-bold">Payment Receipt</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Verifiable proof of on-chain payment
          </p>
        </div>

        {!invoice.paid && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Invoice Not Paid</AlertTitle>
            <AlertDescription>
              This invoice has not been paid yet. Please visit the payment page to complete the
              transaction.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice ID</span>
              <span className="font-mono text-sm">{shortenAddress(invoiceId)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Merchant</span>
              <span className="font-mono text-sm">{shortenAddress(invoice.merchant)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-2xl">{formatUSDC(invoice.amount)} USDC</span>
            </div>

            {invoice.dueAt > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date</span>
                <span>{formatDate(invoice.dueAt)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              {invoice.paid ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  Pending
                </span>
              )}
            </div>

            {invoice.paid && invoice.payer && (
              <div className="flex justify-between">
                <span className="text-slate-500">Payer</span>
                <span className="font-mono text-sm">{shortenAddress(invoice.payer)}</span>
              </div>
            )}

            {invoice.paid && invoice.paidAt > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Paid At</span>
                <span>{formatDate(invoice.paidAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {invoice.paid && paymentLog && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Complete transaction information for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Hash</span>
                <a
                  href={`${explorerUrl}/tx/${paymentLog.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-600 hover:underline"
                >
                  {shortenAddress(paymentLog.transactionHash)}
                </a>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Block Number</span>
                <span className="font-mono text-sm">{paymentLog.blockNumber.toString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-semibold">
                  {formatUSDC(paymentLog.args?.amount ?? 0n)} USDC
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Payment Timestamp</span>
                <span>{formatDate(paymentLog.args?.paidAt ?? 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Token</span>
                <span className="font-mono text-sm">
                  {shortenAddress(paymentLog.args?.token ?? invoice.token)}
                </span>
              </div>

              {paymentLog.args?.merchant && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant Address</span>
                  <span className="font-mono text-sm">
                    {shortenAddress(paymentLog.args.merchant)}
                  </span>
                </div>
              )}

              {paymentLog.args?.payer && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Address</span>
                  <span className="font-mono text-sm">{shortenAddress(paymentLog.args.payer)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Verify This Payment</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            To verify this payment independently, you can:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Visit the Avalanche explorer at {explorerUrl}</li>
            <li>Search for the transaction hash</li>
            <li>Review the InvoicePaid event</li>
            <li>Confirm the invoice amount matches</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link href={`/pay/${invoiceId}`}>
            <Button className="w-full" variant="outline">
              Back to Invoice
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
