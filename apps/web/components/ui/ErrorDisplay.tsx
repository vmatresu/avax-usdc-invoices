/**
 * Enhanced error display component with better UX
 * Single Responsibility: Display user-friendly error messages with appropriate styling
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { parseTransactionError } from '@/lib/utils/error-handling';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: unknown;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'subtle';
  onDismiss?: () => void;
}

export function ErrorDisplay({
  error,
  className,
  showIcon = true,
  variant = 'default',
  onDismiss,
}: ErrorDisplayProps) {
  if (!error) return null;

  const parsed = parseTransactionError(error);
  const isUserRejection = parsed.isUserRejection;

  // Choose icon based on error type
  const getIcon = () => {
    if (!showIcon) return null;

    if (isUserRejection) {
      return <Info className="h-4 w-4" />;
    }

    return <AlertTriangle className="h-4 w-4" />;
  };

  // Choose alert variant based on error type
  const alertVariant = isUserRejection ? 'default' : 'destructive';

  return (
    <Alert
      variant={alertVariant}
      className={cn(
        'relative',
        variant === 'subtle' && 'border-muted/50 bg-muted/30',
        isUserRejection && 'border-blue-200 bg-blue-50/50',
        className
      )}
    >
      {getIcon()}
      <div className="flex-1">
        <AlertTitle className={cn('text-sm font-medium', isUserRejection && 'text-blue-800')}>
          {isUserRejection ? 'Transaction Cancelled' : 'Transaction Failed'}
        </AlertTitle>
        <AlertDescription className={cn('text-sm mt-1', isUserRejection && 'text-blue-700')}>
          {parsed.userMessage}
        </AlertDescription>

        {/* Show error code for debugging (subtle) */}
        {parsed.code && parsed.code !== 'UNKNOWN_ERROR' && variant === 'default' && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {parsed.code}
            </Badge>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted/80 transition-colors"
          aria-label="Dismiss error"
        >
          <XCircle className="h-3 w-3" />
        </button>
      )}
    </Alert>
  );
}
