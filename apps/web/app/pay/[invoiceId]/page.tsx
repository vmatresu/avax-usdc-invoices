'use client';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { INVOICE_MANAGER_ABI, USDC_ABI, getInvoicePaidLog } from '@/lib/contracts';
import { formatDate, formatUSDC, shortenAddress } from '@/lib/utils';
import { invoiceManagerAddress, usdcAddress } from '@/lib/wagmi';
import { logger } from '@avax-usdc-invoices/shared';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

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
    paidAt: bigint;
  };
}

export default function PayInvoicePage({ params }: { params: { invoiceId: string } }) {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('');
  const [loading, _setLoading] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [paymentLog, setPaymentLog] = useState<PaymentLog | null>(null);

  const invoiceId = params.invoiceId as `0x${string}`;

  const { data: invoice, isLoading: invoiceLoading } = useReadContract({
    address: invoiceManagerAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: 'getInvoice',
    args: [invoiceId],
  }) as { data: InvoiceData | undefined; isLoading: boolean };

  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [
      address ?? '0x0000000000000000000000000000000000000000000',
      invoiceManagerAddress ?? '0x0000000000000000000000000000000000000000',
    ],
    query: {
      enabled: !!address && !!invoiceManagerAddress && !!usdcAddress,
    },
  }) as { data: bigint | undefined };

  const { data: balance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000000'],
    query: {
      enabled: !!address && !!usdcAddress,
    },
  }) as { data: bigint | undefined };

  const {
    writeContract: approveUSDC,
    data: approveHash,
    isPending: approvePending,
  } = useWriteContract();
  const {
    writeContract: payInvoice,
    data: payHash,
    isPending: payPending,
    error: payError,
  } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isPaying } = useWaitForTransactionReceipt({ hash: payHash });

  const isExpired = invoice && invoice.dueAt > 0 && invoice.dueAt < Math.floor(Date.now() / 1000);

  const loadPaymentLog = useCallback(async () => {
    if (!invoiceId || !invoiceManagerAddress) return;

    try {
      const log = await getInvoicePaidLog(invoiceId, invoiceManagerAddress);
      if (log) {
        setPaymentLog(log as unknown as PaymentLog);
      }
    } catch (err) {
      logger.error('Error loading payment log', err as Error, { invoiceId });
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && invoice.paid) {
      void loadPaymentLog();
    }
  }, [invoice, invoice?.paid, loadPaymentLog]);

  const handleApprove = () => {
    setError('');
    if (!address || !invoice || !usdcAddress || !invoiceManagerAddress) return;

    const amount = approvalAmount || (invoice.amount / 10n ** 6n).toString();
    const amountInWei = parseUnits(amount, 6);

    try {
      approveUSDC({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [invoiceManagerAddress, amountInWei],
      });
    } catch (err) {
      logger.error('Error approving USDC', err as Error, { amount });
      setError('Failed to approve USDC. Please try again.');
    }
  };

  const handlePay = () => {
    setError('');
    if (!address || !invoiceManagerAddress) return;

    try {
      payInvoice({
        address: invoiceManagerAddress,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'payInvoice',
        args: [invoiceId],
      });
    } catch (err) {
      logger.error('Error paying invoice', err as Error, { invoiceId });
      setError('Failed to pay invoice. Please try again.');
    }
  };

  // Loading State
  if (invoiceLoading) {
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Pay Invoice</span>
          </div>

          {/* Invoice Details Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="feature-icon">
                    <svg
                      className="w-6 h-6 text-primary"
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
                  <div>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">
                      {shortenAddress(invoiceId)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={invoice.paid ? 'success' : isExpired ? 'error' : 'pending'}>
                  {invoice.paid ? 'Paid' : isExpired ? 'Expired' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount - Highlighted */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
                <div className="text-3xl md:text-4xl font-bold font-heading gradient-text">
                  {formatUSDC(invoice.amount)} USDC
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-mono text-sm">{shortenAddress(invoice.merchant)}</span>
                </div>

                {invoice.dueAt > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className={isExpired ? 'text-destructive' : ''}>
                      {formatDate(invoice.dueAt)}
                    </span>
                  </div>
                )}

                {invoice.paid && invoice.payer && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Paid By</span>
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

          {/* Payment Section */}
          {!invoice.paid && !isExpired && !isConnected && (
            <Alert className="mb-6">
              <AlertTitle>Connect Wallet</AlertTitle>
              <AlertDescription>Please connect your wallet to pay this invoice</AlertDescription>
            </Alert>
          )}

          {!invoice.paid && !isExpired && isConnected && (
            <>
              {balance !== undefined && balance < invoice.amount && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Insufficient Balance</AlertTitle>
                  <AlertDescription>
                    You have {formatUSDC(balance)} USDC but need {formatUSDC(invoice.amount)} USDC.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Payment Steps</CardTitle>
                  <CardDescription>Complete both steps to pay the invoice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Approve */}
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        allowance !== undefined && allowance >= invoice.amount
                          ? 'bg-success text-success-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {allowance !== undefined && allowance >= invoice.amount ? '✓' : '1'}
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Approve USDC</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow InvoiceManager to spend your USDC
                      </p>
                      {allowance !== undefined && allowance >= invoice.amount ? (
                        <Button disabled className="w-full" variant="outline">
                          ✓ Approved
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder={`Enter amount (min: ${formatUSDC(invoice.amount)})`}
                            value={approvalAmount}
                            onChange={(e) => setApprovalAmount(e.target.value)}
                          />
                          <Button
                            onClick={handleApprove}
                            disabled={approvePending || isApproving || loading}
                            isLoading={approvePending || isApproving}
                            className="w-full"
                          >
                            Approve USDC
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div className="relative pl-8">
                    <div className="absolute left-[11px] -top-3 w-0.5 h-6 bg-border" />
                  </div>

                  {/* Step 2: Pay */}
                  <div className="relative pl-8">
                    <div
                      className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        invoice.paid
                          ? 'bg-success text-success-foreground'
                          : allowance !== undefined && allowance >= invoice.amount
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {invoice.paid ? '✓' : '2'}
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Pay Invoice</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete payment of {formatUSDC(invoice.amount)} USDC
                      </p>
                      <Button
                        onClick={handlePay}
                        disabled={
                          !allowance ||
                          allowance < invoice.amount ||
                          payPending ||
                          isPaying ||
                          loading
                        }
                        isLoading={payPending || isPaying}
                        className="w-full"
                      >
                        Pay Invoice
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {payError && (
                    <Alert variant="destructive">
                      <AlertDescription>{(payError as Error).message}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Receipt Section */}
          {invoice.paid && paymentLog && (
            <Card variant="featured">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-success"
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
                  <div>
                    <CardTitle>Payment Confirmed</CardTitle>
                    <CardDescription>Verifiable receipt information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <a
                      href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE_URL}/tx/${paymentLog.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {shortenAddress(paymentLog.transactionHash)}
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

                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Payment Time</span>
                    <span>{formatDate(Number(paymentLog.args?.paidAt ?? 0n))}</span>
                  </div>
                </div>

                <Link href={`/receipt/${invoiceId}`}>
                  <Button className="w-full" variant="outline">
                    View Full Receipt
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
