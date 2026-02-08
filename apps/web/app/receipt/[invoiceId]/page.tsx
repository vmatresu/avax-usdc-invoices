'use client';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl skeleton mx-auto mb-4" />
            <div className="h-6 w-48 skeleton mx-auto mb-2" />
            <div className="h-4 w-32 skeleton mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardHeader>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Invoice Not Found
  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">Invoice Not Found</CardTitle>
              <CardDescription className="mt-2">
                The invoice with ID {shortenAddress(invoiceId)} does not exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Receipt</span>
          </div>

          {/* Receipt Header */}
          <div className="text-center mb-8">
            {invoice.paid ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                  <svg
                    className="w-10 h-10 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold font-heading mb-2">Payment Confirmed</h1>
                <p className="text-muted-foreground">Your payment has been verified on-chain</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-warning"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold font-heading mb-2">Payment Pending</h1>
                <p className="text-muted-foreground">This invoice has not been paid yet</p>
              </>
            )}
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

          {/* Receipt Card */}
          <Card variant={invoice.paid ? 'featured' : 'default'} className="mb-6">
            <CardHeader className="text-center border-b border-white/5 pb-6">
              <div className="text-sm text-muted-foreground mb-2">INVOICE</div>
              <div className="font-mono text-sm text-muted-foreground">
                {shortenAddress(invoiceId)}
              </div>
              <div className="text-4xl font-bold font-heading gradient-text mt-4">
                {formatUSDC(invoice.amount)} USDC
              </div>
              <div className="mt-4">
                <Badge variant={invoice.paid ? 'success' : 'pending'}>
                  {invoice.paid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-mono text-sm">{shortenAddress(invoice.merchant)}</span>
                </div>

                {invoice.dueAt > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{formatDate(invoice.dueAt)}</span>
                  </div>
                )}

                {invoice.paid && invoice.payer && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Payer</span>
                    <span className="font-mono text-sm">{shortenAddress(invoice.payer)}</span>
                  </div>
                )}

                {invoice.paid && invoice.paidAt > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Paid At</span>
                    <span>{formatDate(invoice.paidAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {invoice.paid && paymentLog && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Transaction Details</CardTitle>
                <CardDescription>Blockchain verification information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <a
                      href={`${explorerUrl}/tx/${paymentLog.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {shortenAddress(paymentLog.transactionHash)}
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Block Number</span>
                    <span className="font-mono text-sm">{paymentLog.blockNumber.toString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold">
                      {formatUSDC(paymentLog.args?.amount ?? 0n)} USDC
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Payment Timestamp</span>
                    <span>{formatDate(paymentLog.args?.paidAt ?? 0)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-mono text-sm">
                      {shortenAddress(paymentLog.args?.token ?? invoice.token)}
                    </span>
                  </div>

                  {paymentLog.args?.merchant && (
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-muted-foreground">Merchant Address</span>
                      <span className="font-mono text-sm">
                        {shortenAddress(paymentLog.args.merchant)}
                      </span>
                    </div>
                  )}

                  {paymentLog.args?.payer && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Payer Address</span>
                      <span className="font-mono text-sm">
                        {shortenAddress(paymentLog.args.payer)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Info */}
          <Card variant="ghost" className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Verify This Payment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                To verify this payment independently:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Visit the{' '}
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Avalanche Explorer
                  </a>
                </li>
                <li>Search for the transaction hash</li>
                <li>Review the InvoicePaid event in the logs</li>
                <li>Confirm the invoice ID and amount match</li>
              </ol>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href={`/pay/${invoiceId}`} className="flex-1">
              <Button className="w-full" variant="outline">
                Back to Invoice
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full">Go Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
