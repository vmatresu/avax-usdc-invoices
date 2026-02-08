'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './Button';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  // Debug logging
  console.log('Connectors available:', connectors);
  console.log('Injected connector:', injectedConnector);
  console.log('Connection error:', error);

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
