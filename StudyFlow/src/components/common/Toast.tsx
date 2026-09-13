import React from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStudyFlow();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-brand shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        };

        const bgStyles = {
          success: 'border-emerald-500/30 bg-surface/95 text-text-primary shadow-elevated',
          error: 'border-red-500/30 bg-surface/95 text-text-primary shadow-elevated',
          info: 'border-brand/30 bg-surface/95 text-text-primary shadow-elevated',
          warning: 'border-amber-500/30 bg-surface/95 text-text-primary shadow-elevated'
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3',
              bgStyles[toast.type]
            )}
          >
            <div className="mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary">{toast.title}</h4>
              {toast.message && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
