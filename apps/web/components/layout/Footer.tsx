import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="font-heading text-lg font-semibold">
                <span className="gradient-text">AVAX</span>
                <span className="text-muted-foreground"> Invoices</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              On-chain invoice management on Avalanche C-Chain using native USDC. No backend, no
              database, pure blockchain verification.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/merchant"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Invoice
                </Link>
              </li>
              <li>
                <Link
                  href="/receipt/demo"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.avax.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Avalanche Docs
                </a>
              </li>
              <li>
                <a
                  href="https://www.circle.com/en/usdc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  USDC by Circle
                </a>
              </li>
              <li>
                <a
                  href="https://snowtrace.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Snowtrace Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AVAX Invoices. Built on Avalanche.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <div className="flex items-center gap-3">
              {/* Avalanche Logo */}
              <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.94 16.34H14.1c-.467 0-.734-.224-.928-.52L12 13.673 10.828 15.82c-.194.296-.461.52-.928.52H7.06c-.548 0-.87-.479-.6-.928l2.667-4.4L6.42 6.612c-.27-.449.052-.928.6-.928h2.84c.467 0 .734.224.928.52L12 8.327l1.172-2.123c.194-.296.461-.52.928-.52h2.84c.548 0 .87.479.6.928L14.833 11l2.667 4.4c.27.449-.052.94-.56.94z" />
              </svg>
              <span className="text-xs text-muted-foreground">&</span>
              {/* USDC indicator */}
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-[#2775CA] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">$</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
