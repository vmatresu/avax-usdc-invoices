/**
 * Reusable error message component
 * Single Responsibility: Displays error messages
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  error: string | null;
  title?: string;
  className?: string;
}

export function ErrorMessage({ error, title: _title = 'Error', className }: ErrorMessageProps) {
  if (!error) {
    return null;
  }

  return (
    <Alert className={cn('mt-6', className)}>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
