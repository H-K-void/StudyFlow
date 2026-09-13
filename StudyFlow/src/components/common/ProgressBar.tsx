import React from 'react';
import { cn } from '../../utils/helpers';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  color?: 'brand' | 'emerald' | 'amber';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  color = 'brand'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorVariants = {
    brand: 'bg-brand',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-text-muted mb-1.5">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden border border-border">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorVariants[color],
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
