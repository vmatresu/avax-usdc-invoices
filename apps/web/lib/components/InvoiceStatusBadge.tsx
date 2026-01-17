/**
 * Reusable invoice status badge component
 * Single Responsibility: Displays invoice status
 */

'use client';

import { InvoiceStatus } from '@avax-usdc-invoices/shared';
import { cn } from '@/lib/utils';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig = {
  [InvoiceStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  [InvoiceStatus.PAID]: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  [InvoiceStatus.EXPIRED]: {
    label: 'Expired',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  [InvoiceStatus.NOT_FOUND]: {
    label: 'Not Found',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
