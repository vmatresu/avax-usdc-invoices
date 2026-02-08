'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConnectButton } from '@/components/ui/ConnectButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { INVOICE_MANAGER_ABI } from '@/lib/contracts';
import { formatDate, formatUSDC, shortenAddress, uuidToBytes32 } from '@/lib/utils';
import { invoiceManagerAddress, usdcAddress } from '@/lib/wagmi';
import { logger } from '@avax-usdc-invoices/shared';
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to create and manage invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Merchant Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create invoices and track payments
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Invoice</CardTitle>
              <CardDescription>
                Create an on-chain invoice that customers can pay with USDC
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
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
                  className="w-full"
                >
                  {isPending || isConfirming ? 'Creating Invoice...' : 'Create Invoice'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Invoices</CardTitle>
              <CardDescription>View and track your created invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-slate-500">Loading invoices...</div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="text-slate-500">No invoices yet</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              Invoice #{invoice.uuid ?? shortenAddress(invoice.invoiceId)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatUSDC(invoice.amount)} USDC
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {invoice.paid ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                Pending
                              </span>
                            )}
                            <a
                              href={`/pay/${invoice.invoiceId}`}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                              View
                            </a>
                          </div>
                        </div>
                        {invoice.dueAt > 0 && (
                          <div className="mt-2 text-sm text-slate-500">
                            Due: {formatDate(Number(invoice.dueAt))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
