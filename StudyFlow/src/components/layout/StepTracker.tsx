import React from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { AppScreen } from '../../types';
import { cn } from '../../utils/helpers';
import { Upload, Cpu, FileText, HelpCircle, ArrowRight } from 'lucide-react';

export const StepTracker: React.FC = () => {
  const { currentScreen, setCurrentScreen, activeSession, isProcessing } = useStudyFlow();

  if (currentScreen === 'workspace') return null;

  const steps: { id: AppScreen; label: string; icon: React.ReactNode; accessible: boolean }[] = [
    {
      id: 'upload',
      label: 'Upload Lecture',
      icon: <Upload className="w-3.5 h-3.5" />,
      accessible: !isProcessing
    },
    {
      id: 'processing',
      label: 'AI Synthesis',
      icon: <Cpu className="w-3.5 h-3.5" />,
      accessible: false
    },
    {
      id: 'notes',
      label: 'Revision Notes',
      icon: <FileText className="w-3.5 h-3.5" />,
      accessible: !!activeSession && !isProcessing
    },
    {
      id: 'quiz',
      label: '5Q Quiz',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      accessible: !!activeSession && !isProcessing
    }
  ];

  const getStepIndex = (screen: AppScreen) => {
    switch (screen) {
      case 'upload': return 0;
      case 'processing': return 1;
      case 'notes':
      case 'graph':
        return 2;
      case 'quiz': return 3;
      case 'export': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentScreen);

  return (
    <div className="bg-surface border-b border-border py-2.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between sm:justify-center sm:gap-4 overflow-x-auto no-scrollbar">
        {steps.map((step, idx) => {
          const isCurrent = currentScreen === step.id;
          const isPassed = currentIndex > idx;
          const isClickable = step.accessible && !isCurrent;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && setCurrentScreen(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  isCurrent
                    ? 'bg-brand/15 text-brand border border-brand/30'
                    : isPassed
                    ? 'text-emerald-500 hover:bg-emerald-500/10 cursor-pointer'
                    : 'text-text-muted/60 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isCurrent
                      ? 'bg-brand text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-secondary text-text-muted'
                  )}
                >
                  {isPassed ? '✓' : idx + 1}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-text-muted/40 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
