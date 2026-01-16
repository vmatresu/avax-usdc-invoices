/**
 * Reusable loading state component
 * Single Responsibility: Displays loading state
 */

'use client';

import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex justify-center py-8', className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
        <p className="text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}
