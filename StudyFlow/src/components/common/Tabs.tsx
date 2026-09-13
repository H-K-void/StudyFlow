import React from 'react';
import { cn } from '../../utils/helpers';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-surface-secondary rounded-xl border border-border', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-150',
              isActive
                ? 'bg-surface text-text-primary shadow-subtle font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
            )}
          >
            {tab.icon && (
              <span className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand' : 'text-text-muted')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  isActive
                    ? 'bg-brand/15 text-brand'
                    : 'bg-surface-secondary text-text-muted'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
