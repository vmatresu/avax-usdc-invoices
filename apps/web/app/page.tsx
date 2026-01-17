import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Avalanche USDC Invoices
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            On-chain invoice management on Avalanche C-Chain using native USDC
          </p>

          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/merchant">
              <Button size="lg">Create Invoice</Button>
            </Link>
            <Link href="/receipt/demo">
              <Button size="lg" variant="outline">
                View Demo Receipt
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Create Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate invoices on-chain with custom amounts and optional due dates
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pay with USDC</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Customers pay invoices directly using native USDC on Avalanche C-Chain
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verifiable Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View verifiable payment receipts with transaction hashes and decoded events
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-sm text-slate-500">
            <p>Powered by Avalanche C-Chain and native USDC</p>
            <p className="mt-2">No backend, no database, pure on-chain data</p>
          </div>
        </div>
      </div>
    </main>
  );
}
