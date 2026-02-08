import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSDC(amount: bigint): string {
  const num = Number(amount) / 1e6;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function bytes32ToHex(bytes32: string): string {
  return bytes32;
}

export function uuidToBytes32(uuid: string): string {
  // UUID without dashes = 32 hex chars (16 bytes)
  // bytes32 requires 64 hex chars (32 bytes), so pad with zeros
  const hex = uuid.replace(/-/g, '');
  return `0x${hex.padEnd(64, '0')}`;
}

export function shortenTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
