/**
 * Reusable transaction hash link component
 * Single Responsibility: Displays transaction hash with explorer link
 */

'use client';

import Link from 'next/link';
import { cn, shortenTxHash } from '@/lib/utils';

interface TxHashLinkProps {
  hash: string;
  shorten?: boolean;
  className?: string;
  text?: string;
}

export function TxHashLink({
  hash,
  shorten = true,
  className,
  text,
}: TxHashLinkProps) {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL;

  if (!explorerUrl) {
    return <span className={className}>{text || hash}</span>;
  }

  const displayText = text || (shorten ? shortenTxHash(hash) : hash);

  return (
    <Link
      href={`${explorerUrl}/tx/${hash}`}
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
