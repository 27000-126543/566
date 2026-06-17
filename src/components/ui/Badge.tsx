import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils.js';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'silver' | 'bronze' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary-500/20 text-primary-300 border-primary-500',
      gold: 'bg-gold-500/20 text-gold-400 border-gold-500',
      silver: 'bg-slate-400/20 text-slate-300 border-slate-400',
      bronze: 'bg-amber-600/20 text-amber-400 border-amber-500',
      success: 'bg-green-500/20 text-green-400 border-green-500',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      danger: 'bg-red-500/20 text-red-400 border-red-500',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium border rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
