'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './Button';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const injectedConnector = connectors.find((c) => c.id === 'injected');

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Connected: </span>
          <span className="font-mono text-slate-900 dark:text-slate-100">
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
    <Button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={isPending || !injectedConnector}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
