import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  elevated = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl transition-all duration-200 text-text-primary',
        bordered && 'border border-border',
        elevated ? 'shadow-card dark:shadow-black/50' : 'shadow-subtle',
        hoverable && 'hover:shadow-elevated dark:hover:shadow-black/70 hover:border-border-secondary hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 border-b border-border flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-4 sm:p-5 bg-surface-secondary/60 border-t border-border rounded-b-2xl', className)} {...props}>
      {children}
    </div>
  );
};
