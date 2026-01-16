'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { invoiceManagerAddress, client } from '@/lib/wagmi'
import { INVOICE_MANAGER_ABI, getInvoice, getInvoicePaidLog } from '@/lib/contracts'
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

export default function ReceiptPage({ params }: { params: { invoiceId: string } }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [paymentLog, setPaymentLog] = useState<PaymentLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const invoiceId = params.invoiceId as `0x${string}`
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL || 'https://testnet.snowtrace.io'

  useEffect(() => {
    loadReceipt()
  }, [invoiceId])

  const loadReceipt = async () => {
    if (!invoiceId || !invoiceManagerAddress) return

    setLoading(true)
    setError('')

    try {
      const invoiceData = await getInvoice(invoiceId, invoiceManagerAddress)
      setInvoice(invoiceData as InvoiceData)

      if (invoiceData.paid) {
        const log = await getInvoicePaidLog(invoiceId, invoiceManagerAddress)
        if (log) {
          setPaymentLog(log as PaymentLog)
        }
      }
    } catch (err) {
      console.error('Error loading receipt:', err)
      setError('Failed to load receipt. The invoice may not exist.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center py-8">
            <div className="text-slate-500">Loading receipt...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to Home
          </Link>
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
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
          <h1 className="mt-4 text-4xl font-bold">Receipt</h1>
          <p className="mt-2 text-slate-500">
            Verifiable on-chain payment receipt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice ID</span>
              <span className="font-mono text-sm">{shortenAddress(invoiceId)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Merchant</span>
              <a
                href={`${explorerUrl}/address/${invoice.merchant}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {shortenAddress(invoice.merchant)}
              </a>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-2xl">{formatUSDC(invoice.amount)} USDC</span>
            </div>

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
          </CardContent>
        </Card>

        {invoice.paid ? (
          <>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>On-Chain State</CardTitle>
                <CardDescription>
                  Current state from the contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer</span>
                  <a
                    href={`${explorerUrl}/address/${invoice.payer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {shortenAddress(invoice.payer)}
                  </a>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Paid At</span>
                  <span>{formatDate(invoice.paidAt)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Token</span>
                  <a
                    href={`${explorerUrl}/address/${invoice.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {shortenAddress(invoice.token)}
                  </a>
                </div>
              </CardContent>
            </Card>

            {paymentLog && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Transaction</CardTitle>
                  <CardDescription>
                    Decoded InvoicePaid event
                  </CardDescription>
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
                    <span className="text-slate-500">Merchant (from event)</span>
                    <a
                      href={`${explorerUrl}/address/${paymentLog.args?.merchant}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {shortenAddress(paymentLog.args?.merchant || '')}
                    </a>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Payer (from event)</span>
                    <a
                      href={`${explorerUrl}/address/${paymentLog.args?.payer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-blue-600 hover:underline"
                    >
                      {shortenAddress(paymentLog.args?.payer || '')}
                    </a>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount (from event)</span>
                    <span className="font-semibold">{formatUSDC(paymentLog.args?.amount || 0n)} USDC</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp (from event)</span>
                    <span>{formatDate(paymentLog.args?.paidAt || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Alert className="mt-6">
              <AlertTitle>Verification</AlertTitle>
              <AlertDescription>
                This receipt is verifiable on-chain. You can verify it by:
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
                  <li>Checking the transaction hash on the block explorer</li>
                  <li>Calling getInvoice() on the contract to confirm payment state</li>
                  <li>Verifying the decoded event matches the invoice details</li>
                </ol>
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <Alert className="mt-6">
            <AlertTitle>Invoice Not Paid</AlertTitle>
            <AlertDescription>
              This invoice has not been paid yet. Visit the payment page to complete the transaction.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
