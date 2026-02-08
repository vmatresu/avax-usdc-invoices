'use client';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConnectButton } from '@/components/ui/ConnectButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { INVOICE_MANAGER_ABI } from '@/lib/contracts';
import { formatDate, formatUSDC, shortenAddress, uuidToBytes32 } from '@/lib/utils';
import { invoiceManagerAddress, usdcAddress } from '@/lib/wagmi';
import { logger } from '@avax-usdc-invoices/shared';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { parseUnits } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

interface Invoice {
  invoiceId: string;
  uuid?: string;
  merchant: string;
  token: string;
  amount: bigint;
  dueAt: bigint | number;
  paid: boolean;
  payer: string;
  paidAt: number;
}

export default function MerchantPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const validateEnvironment = () => {
    if (!invoiceManagerAddress || !usdcAddress) {
      setError(
        'Missing configuration. Please ensure NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS and NEXT_PUBLIC_USDC_ADDRESS are set.'
      );
      return false;
    }
    return true;
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!invoiceManagerAddress || !usdcAddress) {
      setError('Missing configuration. Please ensure NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS is set.');
      return;
    }
    if (!address) return;

    const amountInWei = parseUnits(amount, 6);
    const dueAtTimestamp = dueDate ? BigInt(Math.floor(new Date(dueDate).getTime() / 1000)) : 0n;
    const uuid = uuidv4();
    const invoiceId = uuidToBytes32(uuid);

    try {
      setLoading(true);
      writeContract({
        address: invoiceManagerAddress,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'createInvoice',
        args: [invoiceId as `0x${string}`, usdcAddress, amountInWei, dueAtTimestamp],
      });

      // Store invoice locally for display
      const newInvoice = {
        invoiceId,
        uuid,
        merchant: address,
        token: usdcAddress,
        amount: amountInWei,
        dueAt: dueAtTimestamp,
        paid: false,
        payer: '0x0000000000000000000000000000000000000000000',
        paidAt: 0,
      };
      setInvoices([newInvoice, ...invoices]);
    } catch (err) {
      logger.error('Error creating invoice', err as Error, { amount, dueDate });
      setError('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = useCallback(async () => {
    if (!address || !invoiceManagerAddress) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/invoices?merchant=${address}`);
      if (response.ok) {
        const data = (await response.json()) as { invoices?: Invoice[] };
        setInvoices(data.invoices ?? []);
      }
    } catch (err) {
      logger.error('Error loading invoices', err as Error, { address });
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      void loadInvoices();
    }
  }, [isConnected, address, isConfirming, loadInvoices]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription className="mt-2">
                Connect your wallet to create and manage invoices on Avalanche
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ConnectButton />
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
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Merchant Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Merchant Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Create invoices and track payments in real-time
            </p>
          </div>

          {!validateEnvironment() && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Please set NEXT_PUBLIC_INVOICE_MANAGER_ADDRESS and NEXT_PUBLIC_USDC_ADDRESS in your
                environment variables.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Create Invoice Card */}
            <Card variant="featured">
              <CardHeader>
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Create New Invoice</CardTitle>
                    <CardDescription>Generate an on-chain invoice</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvoice} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USDC)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount (e.g., 100.00)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {writeError && (
                    <Alert variant="destructive">
                      <AlertDescription>{(writeError as Error).message}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isPending || isConfirming || loading}
                    isLoading={isPending || isConfirming}
                    className="w-full"
                  >
                    {isPending || isConfirming ? 'Creating Invoice...' : 'Create Invoice'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Invoices List Card */}
            <Card>
              <CardHeader>
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle>Your Invoices</CardTitle>
                      <CardDescription>Track payment status</CardDescription>
                    </div>
                  </div>
                  {invoices.length > 0 && <Badge variant="default">{invoices.length} total</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 skeleton rounded-lg" />
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
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
                    <p className="text-muted-foreground mb-2">No invoices yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Create your first invoice to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {invoices.map((invoice, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-muted/30 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              Invoice #{invoice.uuid ?? shortenAddress(invoice.invoiceId)}
                            </div>
                            <div className="text-lg font-semibold text-primary mt-1">
                              {formatUSDC(invoice.amount)} USDC
                            </div>
                            {invoice.dueAt > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Due: {formatDate(Number(invoice.dueAt))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={invoice.paid ? 'success' : 'pending'}>
                              {invoice.paid ? 'Paid' : 'Pending'}
                            </Badge>
                            <Link href={`/pay/${invoice.invoiceId}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
