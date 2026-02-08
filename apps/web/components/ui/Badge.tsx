import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground border-border',
        success: 'bg-success/20 text-success border-success/30',
        warning: 'bg-warning/20 text-warning border-warning/30',
        error: 'bg-destructive/20 text-destructive border-destructive/30',
        pending: 'bg-warning/20 text-warning border-warning/30 animate-pulse',
        secondary: 'bg-secondary text-secondary-foreground border-secondary',
        outline: 'text-foreground border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
