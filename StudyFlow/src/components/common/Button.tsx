import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-semibold',
    md: 'text-sm px-4 py-2.5 gap-2 font-bold',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold'
  };

  const variantStyles = {
    primary: 'bg-brand hover:bg-brand-hover text-white shadow-subtle hover:shadow focus:ring-brand border border-brand/20 active:opacity-95 disabled:bg-surface-secondary disabled:text-text-muted disabled:border-border disabled:shadow-none',
    secondary: 'bg-surface-secondary hover:bg-surface-hover text-text-primary border border-border focus:ring-brand/30 disabled:opacity-60',
    outline: 'bg-surface hover:bg-surface-secondary text-text-primary border border-border focus:ring-brand/30 shadow-subtle disabled:opacity-60',
    ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary focus:ring-brand/30 disabled:opacity-60',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-subtle focus:ring-red-500 disabled:opacity-60'
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
