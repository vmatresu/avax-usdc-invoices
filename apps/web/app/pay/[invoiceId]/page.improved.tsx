/**
 * Payment page - Improved version
 * SOLID Principles:
 * - Single Responsibility: Each component has one job
 * - Open/Closed: Extensible through service layer
 * - Liskov Substitution: Hooks are interchangeable
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import type { Invoice, InvoiceStatus, InvoicePaidEvent } from '@avalanche-bridge/shared';
import {
  logger,
  InvoiceStatus,
  ERROR_MESSAGES,
  isInvoiceExpired,
  USDC_ABI,
  INVOICE_MANAGER_ABI,
} from '@avalanche-bridge/shared';

// Custom hooks
import { useInvoice, useInvoiceOperations } from '@/lib/hooks';
import { useError } from '@/lib/hooks/useError';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { LoadingState } from '@/lib/components/LoadingState';
import { ErrorMessage } from '@/lib/components/ErrorMessage';
import { InvoiceStatusBadge } from '@/lib/components/InvoiceStatusBadge';
import { AddressLink } from '@/lib/components/AddressLink';
import { TxHashLink } from '@/lib/components/TxHashLink';

// Utils
import { formatUSDC, formatTimestamp } from '@/lib/utils';

// Services
import { NetworkConfigService } from '@/lib/config/network';

/**
 * Invoice Details Component
 * Single Responsibility: Displays invoice information
 */
function InvoiceDetails({ invoice, status }: { invoice: Invoice; status: InvoiceStatus }) {
  const isExpired = status === InvoiceStatus.EXPIRED;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow label="Invoice ID" value={invoice.id} isAddress />
        <InfoRow label="Merchant" value={invoice.merchant} isAddress />
        <AmountRow amount={invoice.amount} />
        {invoice.dueAt > 0 && (
          <DueDateRow dueAt={invoice.dueAt} isExpired={isExpired} />
        )}
        <StatusRow status={status} />
        {invoice.paid && <PaidAtRow paidAt={invoice.paidAt} />}
        {invoice.paid && <PayerRow payer={invoice.payer} />}
      </CardContent>
    </Card>
  );
}

/**
 * Payment Component
 * Single Responsibility: Handles payment flow
 */
function PaymentFlow({
  invoice,
  allowance,
  balance,
  onApprove,
  onPay,
  isPending,
  isLoading,
  error,
}: {
  invoice: Invoice;
  allowance: bigint;
  balance: bigint;
  onApprove: (amount: bigint) => Promise<void>;
  onPay: () => Promise<void>;
  isPending: boolean;
  isLoading: boolean;
  error: string | null;
}) {
  const [approvalAmount, setApprovalAmount] = useState('');

  const hasAllowance = allowance >= invoice.amount;
  const hasBalance = balance >= invoice.amount;

  return (
    <>
      {/* Balance/Allowance Alerts */}
      {!hasBalance && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Insufficient Balance</AlertTitle>
          <AlertDescription>
            You have {formatUSDC(balance)} USDC but need {formatUSDC(invoice.amount)} USDC.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Steps</CardTitle>
          <CardDescription>
            Complete both steps to pay the invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Approve USDC */}
          <PaymentStep
            stepNumber={1}
            title="Approve USDC"
            description="Allow InvoiceManager to spend your USDC"
            completed={hasAllowance}
          >
            {hasAllowance ? (
              <Button disabled className="w-full" variant="outline">
                ✓ Approved
              </Button>
            ) : (
              <>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter approval amount"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  disabled={isPending}
                />
                <Button
                  onClick={() => {
                    const amount = approvalAmount
                      ? parseUSDC(approvalAmount)
                      : invoice.amount;
                    onApprove(amount);
                  }}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? 'Approving...' : 'Approve USDC'}
                </Button>
              </>
            )}
          </PaymentStep>

          {/* Step 2: Pay Invoice */}
          <PaymentStep
            stepNumber={2}
            title="Pay Invoice"
            description={`Pay ${formatUSDC(invoice.amount)} USDC`}
            disabled={!hasAllowance}
          >
            <Button
              onClick={onPay}
              disabled={!hasAllowance || isPending}
              className="w-full"
            >
              {isPending ? 'Paying...' : 'Pay Invoice'}
            </Button>
          </PaymentStep>

          <ErrorMessage error={error} />
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Receipt Component
 * Single Responsibility: Displays payment receipt
 */
function Receipt({
  invoice,
  paymentLog,
}: {
  invoice: Invoice;
  paymentLog: InvoicePaidEvent | null;
}) {
  if (!paymentLog) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Receipt</CardTitle>
        <CardDescription>Verifiable payment information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReceiptRow
          label="Transaction Hash"
          value={paymentLog.transactionHash}
          isTxHash
        />
        <ReceiptRow
          label="Block Number"
          value={paymentLog.blockNumber.toString()}
        />
        <ReceiptRow
          label="Amount Paid"
          value={formatUSDC(paymentLog.amount) + ' USDC'}
        />
        <ReceiptRow
          label="Payment Timestamp"
          value={formatTimestamp(paymentLog.paidAt)}
        />
        <Link href={`/receipt/${invoice.id}`}>
          <Button className="w-full" variant="outline">
            View Full Receipt
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Connect Wallet Component
 * Single Responsibility: Displays wallet connection prompt
 */
function ConnectWalletPrompt() {
  return (
    <Alert className="mt-6">
      <AlertTitle>Connect Wallet</AlertTitle>
      <AlertDescription>
        {ERROR_MESSAGES.WALLET_NOT_CONNECTED}
      </AlertDescription>
    </Alert>
  );
}

// Sub-components for better DRY

function InfoRow({ label, value, isAddress = false }: { label: string; value: string; isAddress?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      {isAddress ? <AddressLink address={value} /> : <span className="font-mono text-sm">{value}</span>}
    </div>
  );
}

function AmountRow({ amount }: { amount: bigint }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">Amount</span>
      <span className="font-semibold text-2xl">{formatUSDC(amount)} USDC</span>
    </div>
  );
}

function DueDateRow({ dueAt, isExpired }: { dueAt: number; isExpired: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">Due Date</span>
      <span className={isExpired ? 'text-red-600' : ''}>
        {formatTimestamp(dueAt)}
      </span>
    </div>
  );
}

function StatusRow({ status }: { status: InvoiceStatus }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">Status</span>
      <InvoiceStatusBadge status={status} />
    </div>
  );
}

function PaidAtRow({ paidAt }: { paidAt: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">Paid At</span>
      <span>{formatTimestamp(paidAt)}</span>
    </div>
  );
}

function PayerRow({ payer }: { payer: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">Payer</span>
      <AddressLink address={payer} />
    </div>
  );
}

function PaymentStep({
  stepNumber,
  title,
  description,
  children,
  completed = false,
  disabled = false,
}: {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <h3 className={`mb-3 font-semibold ${disabled ? 'text-slate-400' : ''}`}>
        Step {stepNumber}: {title}
      </h3>
      <div className={`space-y-3 ${disabled ? 'opacity-50' : ''}`}>
        <div className="text-sm text-slate-500">{description}</div>
        {children}
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, isTxHash = false }: { label: string; value: string; isTxHash?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      {isTxHash ? <TxHashLink hash={value} /> : <span className="font-mono text-sm">{value}</span>}
    </div>
  );
}

/**
 * Main Payment Page Component
 */
export default function PayInvoicePage({ params }: { params: { invoiceId: string } }) {
  const { address, isConnected } = useAccount();
  const [paymentLog, setPaymentLog] = useState<InvoicePaidEvent | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);

  const invoiceId = params.invoiceId;
  const networkConfig = NetworkConfigService.getInstance();

  // Use custom hooks
  const { invoice, status, isLoading, refetch } = useInvoice(invoiceId);
  const { approveUSDC, payInvoice, state, resetState } = useInvoiceOperations();
  const { handleError, validateWallet, withErrorHandling } = useError();

  // Read allowance and balance
  const { data: allowance } = useReadContract({
    address: networkConfig.getUSDCAddress() as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address || '0x0', networkConfig.getInvoiceManagerAddress() as `0x${string}`],
    enabled: !!address && !!invoice,
  }) as { data: bigint | undefined };

  const { data: balance } = useReadContract({
    address: networkConfig.getUSDCAddress() as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0'],
    enabled: !!address,
  }) as { data: bigint | undefined };

  const isExpired = invoice && isInvoiceExpired(invoice.dueAt);

  /**
   * Loads payment log when invoice is paid
   * Single Responsibility: Fetches payment event
   */
  useEffect(() => {
    if (invoice && invoice.paid && !paymentLog) {
      loadPaymentLog();
    }
  }, [invoice, invoice?.paid]);

  /**
   * Handles USDC approval
   */
  const handleApprove = async (amount: bigint) => {
    const result = await withErrorHandling(async () => {
      validateWallet();
      const hash = await approveUSDC(amount);
      logger.info('USDC approved', { amount, hash });
      return hash;
    });

    if (result) {
      // Wait a bit then refetch allowance
      setTimeout(() => refetch(), 1000);
    }
  };

  /**
   * Handles invoice payment
   */
  const handlePay = async () => {
    const result = await withErrorHandling(async () => {
      validateWallet();
      const hash = await payInvoice();
      logger.info('Invoice paid', { invoiceId, hash });
      return hash;
    });

    if (result) {
      // Load payment log after confirmation
      setTimeout(() => {
        loadPaymentLog();
        refetch();
      }, 2000);
    }
  };

  /**
   * Loads payment event log
   */
  const loadPaymentLog = async () => {
    if (!invoiceId) return;

    setLoadingLog(true);
    try {
      const response = await fetch(`/api/invoices/payment-log/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentLog(data.paymentLog);
      }
    } catch (err) {
      logger.error('Failed to load payment log', err as Error);
    } finally {
      setLoadingLog(false);
    }
  };

  /**
   * Renders the page content based on state
   */
  if (isLoading || loadingLog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <LoadingState message="Loading invoice..." />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Home
          </Link>
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Invoice Not Found</AlertTitle>
            <AlertDescription>
              The invoice with ID {invoiceId.slice(0, 10)}... does not exist.
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
          <h1 className="mt-4 text-4xl font-bold">Pay Invoice</h1>
        </div>

        <InvoiceDetails invoice={invoice} status={status} />

        {!invoice.paid && !isExpired ? (
          <>
            {!isConnected && <ConnectWalletPrompt />}
            <PaymentFlow
              invoice={invoice}
              allowance={allowance || 0n}
              balance={balance || 0n}
              onApprove={handleApprove}
              onPay={handlePay}
              isPending={state.isLoading}
              isLoading={state.isLoading}
              error={state.error}
            />
          </>
        ) : null}

        {invoice.paid && paymentLog && (
          <Receipt invoice={invoice} paymentLog={paymentLog} />
        )}
      </div>
    </div>
  );
}

/**
 * Parses USDC amount from input string
 */
function parseUSDC(input: string): bigint {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0) {
    return 0n;
  }
  return BigInt(Math.floor(num * 10 ** 6));
}
