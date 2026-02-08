/**
 * Success message component for consistency
 * Single Responsibility: Display success messages
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function SuccessMessage({ message, className, onDismiss }: SuccessMessageProps) {
  return (
    <Alert className={cn('border-green-200 bg-green-50/50', className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-sm font-medium text-green-800">Success</AlertTitle>
      <AlertDescription className="text-sm text-green-700 mt-1">{message}</AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-green-100/80 transition-colors"
          aria-label="Dismiss message"
        >
          <XCircle className="h-3 w-3 text-green-600" />
        </button>
      )}
    </Alert>
  );
}
