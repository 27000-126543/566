import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils.js';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, glow, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-game-card border border-game-border rounded-xl overflow-hidden transition-all duration-300',
          hoverable && 'hover:scale-[1.02] hover:shadow-xl hover:shadow-primary-500/10 cursor-pointer',
          glow && 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 border-b border-game-border', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-display font-bold text-game-text', className)} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 border-t border-game-border bg-game-bg/50', className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';
