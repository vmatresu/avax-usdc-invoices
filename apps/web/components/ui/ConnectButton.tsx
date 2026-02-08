'use client';

import { getNetworkName, useNetworkSwitch } from '@/lib/hooks/useNetworkSwitch';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './Button';

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, isPending, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    isWrongNetwork,
    isSwitching,
    switchError,
    expectedChainId,
    currentChainId,
    switchToExpectedNetwork,
    dismiss,
    isDismissed,
  } = useNetworkSwitch();

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  // Only render after client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during SSR/hydration
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Show network switch prompt when on wrong network
  if (isConnected && isWrongNetwork && !isDismissed) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg max-w-md">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
              Wrong Network
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              You&apos;re connected to{' '}
              <span className="font-medium">{getNetworkName(currentChainId ?? 0)}</span>. Please
              switch to <span className="font-medium">{getNetworkName(expectedChainId)}</span> to
              use this app.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={switchToExpectedNetwork}
            disabled={isSwitching}
            className="flex-1"
            size="sm"
          >
            {isSwitching ? 'Switching...' : `Switch to ${getNetworkName(expectedChainId)}`}
          </Button>
          <Button variant="ghost" onClick={dismiss} size="sm" className="text-amber-700">
            Dismiss
          </Button>
        </div>
        {switchError && <p className="text-xs text-red-600">Error: {switchError}</p>}
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-slate-700 dark:text-slate-300 font-medium">Connected: </span>
          <span className="font-mono text-slate-900 dark:text-white font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isPending || !injectedConnector}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      {error && <p className="text-xs text-red-600">Error: {error.message}</p>}
      {!injectedConnector && (
        <p className="text-xs text-yellow-600">
          No wallet detected. Please install MetaMask or another Web3 wallet.
        </p>
      )}
    </div>
  );
}
