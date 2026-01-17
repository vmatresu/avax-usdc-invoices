/**
 * Reusable address link component
 * Single Responsibility: Displays address with explorer link
 */

'use client';

import Link from 'next/link';
import { cn, shortenAddress } from '@/lib/utils';

interface AddressLinkProps {
  address: string;
  shorten?: boolean;
  className?: string;
  text?: string;
}

export function AddressLink({ address, shorten = true, className, text }: AddressLinkProps) {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL;

  if (!explorerUrl) {
    return <span className={className}>{text || address}</span>;
  }

  const displayText = text || (shorten ? shortenAddress(address) : address);

  return (
    <Link
      href={`${explorerUrl}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'font-mono text-sm text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
    >
      {displayText}
    </Link>
  );
}
