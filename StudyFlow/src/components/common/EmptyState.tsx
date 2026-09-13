import React from 'react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <BookOpen className="w-8 h-8 text-text-muted" />,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn('text-center py-12 px-4 max-w-md mx-auto flex flex-col items-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center mb-4 text-text-muted shadow-subtle">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-text-primary">{title}</h3>
      <p className="text-xs sm:text-sm text-text-muted mt-1.5 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
