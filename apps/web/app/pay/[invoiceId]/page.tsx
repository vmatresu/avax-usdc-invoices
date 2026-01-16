'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { invoiceManagerAddress, usdcAddress, client } from '@/lib/wagmi'
import { INVOICE_MANAGER_ABI, USDC_ABI, getInvoicePaidLog } from '@/lib/contracts'
import { formatUSDC, formatDate, shortenAddress } from '@/lib/utils'
import Link from 'next/link'

interface InvoiceData {
  merchant: string
  token: string
  amount: bigint
  dueAt: number
  paid: boolean
  payer: string
  paidAt: number
}

interface PaymentLog {
  transactionHash: string
  blockNumber: bigint
  args?: {
    invoiceId: string
    merchant: string
    payer: string
    token: string
    amount: bigint
    paidAt: number
  }
}

export default function PayInvoicePage({ params }: { params: { invoiceId: string } }) {
  const { address, isConnected } = useAccount()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [approvalAmount, setApprovalAmount] = useState('')
  const [paymentLog, setPaymentLog] = useState<PaymentLog | null>(null)

  const invoiceId = params.invoiceId as `0x${string}`

  const { data: invoice, isLoading: invoiceLoading } = useReadContract({
    address: invoiceManagerAddress,
    abi: INVOICE_MANAGER_ABI,
    functionName: 'getInvoice',
    args: [invoiceId],
  }) as { data: InvoiceData | undefined; isLoading: boolean }

  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', invoiceManagerAddress],
    enabled: !!address && !!invoiceManagerAddress && !!usdcAddress,
  })

  const { data: balance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: !!address && !!usdcAddress,
  })

  const { writeContract: approveUSDC, data: approveHash, isPending: approvePending } = useWriteContract()
  const { writeContract: payInvoice, data: payHash, isPending: payPending, error: payError } = useWriteContract()

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isPaying } = useWaitForTransactionReceipt({ hash: payHash })

  const isExpired = invoice && invoice.dueAt > 0 && invoice.dueAt < Math.floor(Date.now() / 1000)

  useEffect(() => {
    if (invoice && invoice.paid) {
      loadPaymentLog()
    }
  }, [invoice, invoice?.paid])

  const loadPaymentLog = async () => {
    if (!invoiceId || !invoiceManagerAddress) return

    try {
      const log = await getInvoicePaidLog(invoiceId, invoiceManagerAddress)
      if (log) {
        setPaymentLog(log as PaymentLog)
      }
    } catch (err) {
      console.error('Error loading payment log:', err)
    }
  }

  const handleApprove = async () => {
    setError('')
    if (!address || !invoice) return

    const amount = approvalAmount || (invoice.amount / 10n ** 6n).toString()
    const amountInWei = BigInt(parseFloat(amount) * 10 ** 6)

    try {
      approveUSDC({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [invoiceManagerAddress, amountInWei],
      })
    } catch (err) {
      console.error('Error approving:', err)
      setError('Failed to approve USDC. Please try again.')
    }
  }

  const handlePay = async () => {
    setError('')
    if (!address) return

    try {
      payInvoice({
        address: invoiceManagerAddress,
        abi: INVOICE_MANAGER_ABI,
        functionName: 'payInvoice',
        args: [invoiceId],
      })
    } catch (err) {
      console.error('Error paying:', err)
      setError('Failed to pay invoice. Please try again.')
    }
  }

  if (invoiceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center py-8">
            <div className="text-slate-500">Loading invoice...</div>
          </div>
        </div>
      </div>
    )
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
    )
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

        <Card>
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
                <span className={isExpired ? 'text-red-600' : ''}>{formatDate(invoice.dueAt)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              {invoice.paid ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Paid
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  Expired
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

        {!invoice.paid && !isExpired && (
          <>
            {!isConnected ? (
              <Alert className="mt-6">
                <AlertTitle>Connect Wallet</AlertTitle>
                <AlertDescription>
                  Please connect your wallet to pay this invoice
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {balance !== undefined && balance < invoice.amount && (
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
                    <div>
                      <h3 className="mb-3 font-semibold">Step 1: Approve USDC</h3>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-500">
                          Allow InvoiceManager to spend your USDC
                        </div>
                        {allowance !== undefined && allowance >= invoice.amount ? (
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
                            />
                            <Button
                              onClick={handleApprove}
                              disabled={approvePending || isApproving || loading}
                              className="w-full"
                            >
                              {approvePending || isApproving ? 'Approving...' : 'Approve USDC'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-semibold">Step 2: Pay Invoice</h3>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-500">
                          Complete the payment of {formatUSDC(invoice.amount)} USDC
                        </div>
                        <Button
                          onClick={handlePay}
                          disabled={!allowance || allowance < invoice.amount || payPending || isPaying || loading}
                          className="w-full"
                        >
                          {payPending || isPaying ? 'Paying...' : 'Pay Invoice'}
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
                        <AlertDescription>
                          {(payError as Error).message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {invoice.paid && paymentLog && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
              <CardDescription>
                Verifiable payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Hash</span>
                <a
                  href={`${process.env.NEXT_PUBLIC_EXPLORER_BASE_URL}/tx/${paymentLog.transactionHash}`}
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
                <span className="font-semibold">{formatUSDC(paymentLog.args?.amount || 0n)} USDC</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Payment Timestamp</span>
                <span>{formatDate(paymentLog.args?.paidAt || 0)}</span>
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
    </div>
  )
}
