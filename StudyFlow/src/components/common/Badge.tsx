import React from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  const variantStyles = {
    primary: 'bg-brand/10 text-brand border border-brand/20',
    secondary: 'bg-surface-secondary text-text-secondary border border-border',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    neutral: 'bg-surface-secondary text-text-muted border border-border'
  };

  const dotColors = {
    primary: 'bg-brand-500',
    secondary: 'bg-surface-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    purple: 'bg-purple-500',
    neutral: 'bg-surface-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      <span>{children}</span>
    </span>
  );
};
