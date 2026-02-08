import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-500" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8 animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Powered by Avalanche C-Chain
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-heading animate-slide-up">
                <span className="gradient-text">On-Chain Invoices</span>
                <br />
                <span className="text-foreground">with Native USDC</span>
              </h1>

              <p className="mb-10 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up delay-100">
                Create, pay, and verify invoices directly on the blockchain. No backend, no database
                — just pure on-chain transparency.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                <Link href="/merchant">
                  <Button size="lg" className="w-full sm:w-auto min-w-[180px]">
                    Create Invoice
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Button>
                </Link>
                <Link href="/receipt/demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[180px]">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Why Choose On-Chain Invoices?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of B2B payments with blockchain-verified transactions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <Card className="group">
                <CardHeader>
                  <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
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
                  <CardTitle>Create Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Generate invoices on-chain with custom amounts, due dates, and metadata. Every
                    invoice is tied to your wallet address.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card variant="featured" className="group">
                <CardHeader>
                  <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle>Pay with USDC</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Accept payments in native USDC on Avalanche. Funds transfer directly from
                    customer to merchant — no intermediaries.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="group">
                <CardHeader>
                  <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <CardTitle>Verifiable Receipts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Every payment generates a verifiable receipt with transaction hash, block
                    number, and decoded event data.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to blockchain-verified payments
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <span className="text-2xl font-bold text-white font-heading">1</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to the Avalanche network to get started
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <span className="text-2xl font-bold text-white font-heading">2</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Create Invoice</h3>
                <p className="text-sm text-muted-foreground">
                  Set the amount and due date, then create your on-chain invoice
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                  <span className="text-2xl font-bold text-white font-heading">3</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">Get Paid</h3>
                <p className="text-sm text-muted-foreground">
                  Share the invoice link and receive USDC directly to your wallet
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card variant="featured" className="max-w-3xl mx-auto text-center p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Create your first on-chain invoice in seconds. No account needed — just connect your
                wallet.
              </p>
              <Link href="/merchant">
                <Button size="lg" className="min-w-[200px]">
                  Launch App
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
