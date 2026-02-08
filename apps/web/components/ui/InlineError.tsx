/**
 * Inline error display component
 * Single Responsibility: Display inline error messages
 */

'use client';

import { cn } from '@/lib/utils';
import { parseTransactionError } from '@/lib/utils/error-handling';

interface InlineErrorProps {
  error: unknown;
  className?: string;
}

export function InlineError({ error, className }: InlineErrorProps) {
  if (!error) return null;

  const parsed = parseTransactionError(error);

  return <div className={cn('text-sm text-destructive', className)}>{parsed.userMessage}</div>;
}
