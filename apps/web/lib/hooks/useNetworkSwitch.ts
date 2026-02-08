/**
 * Custom hook for automatic network switching
 * Detects when user is on wrong network and prompts to switch
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { chainIdNumber } from '../wagmi';

export interface NetworkSwitchState {
  /** Whether the user is connected but on the wrong network */
  isWrongNetwork: boolean;
  /** Whether a network switch is in progress */
  isSwitching: boolean;
  /** Error message if switch failed */
  switchError: string | null;
  /** The expected chain ID based on env config */
  expectedChainId: number;
  /** The current chain ID the user is on */
  currentChainId: number | undefined;
  /** Function to trigger network switch */
  switchToExpectedNetwork: () => void;
  /** Function to dismiss the network switch prompt */
  dismiss: () => void;
  /** Whether the prompt has been dismissed */
  isDismissed: boolean;
}

export function useNetworkSwitch(): NetworkSwitchState {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [isDismissed, setIsDismissed] = useState(false);

  const expectedChainId = chainIdNumber;

  // Reset dismissed state when disconnecting
  useEffect(() => {
    if (!isConnected) {
      setIsDismissed(false);
    }
  }, [isConnected]);

  const isWrongNetwork = isConnected && currentChainId !== expectedChainId;

  const switchToExpectedNetwork = useCallback(() => {
    if (switchChain) {
      switchChain({ chainId: expectedChainId });
    }
  }, [switchChain, expectedChainId]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  return {
    isWrongNetwork,
    isSwitching: isPending,
    switchError: error?.message ?? null,
    expectedChainId,
    currentChainId,
    switchToExpectedNetwork,
    dismiss,
    isDismissed,
  };
}

/**
 * Get a human-readable network name from chain ID
 */
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 43114:
      return 'Avalanche C-Chain';
    case 43113:
      return 'Avalanche Fuji Testnet';
    case 31337:
      return 'Local Anvil';
    default:
      return `Chain ${chainId}`;
  }
}
