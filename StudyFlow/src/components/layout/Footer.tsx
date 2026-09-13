import React from 'react';
import { Sparkles, Shield, Cpu, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border bg-surface/60 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary">StudyFlow AI</span>
          <span>•</span>
          <span>Single-Purpose Student Productivity Engine</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <Cpu className="w-3.5 h-3.5 text-brand" />
            <span>High-Yield Revision & Practice System</span>
          </span>
          <span className="flex items-center gap-1.5 text-text-secondary hidden sm:flex">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero Data Retention</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
