import React, { useState, useEffect } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import {
  Cpu,
  CheckCircle2,
  Loader2,
  FileText,
  Brain,
  Layers,
  HelpCircle,
  XCircle,
  Lightbulb,
  Upload,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  Check,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export const ProcessingView: React.FC = () => {
  const {
    processingSteps,
    processingError,
    retryProcessing,
    cancelProcessing,
    draftInput,
    setCurrentScreen
  } = useStudyFlow();

  const [activeFactIndex, setActiveFactIndex] = useState(0);

  const studyFacts = [
    'Retrieval practice produces up to 50% higher long-term retention compared to passive rereading.',
    'Active recall + spaced repetition breaks the Ebbinghaus forgetting curve efficiently.',
    'Distilling complex theorems into 3 core bullet points activates conceptual chunking.',
    'Formulating diagnostic questions activates synthesis cognition in neural pathways.'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFactIndex((prev) => (prev + 1) % studyFacts.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const completedCount = processingSteps.filter((s) => s.status === 'completed').length;
  const currentActiveStep = processingSteps.find((s) => s.status === 'in_progress') || processingSteps[processingSteps.length - 1];
  const progressPercent = Math.min(100, Math.round((completedCount / processingSteps.length) * 100));

  const targetName = draftInput.topic
    ? `${draftInput.subject}: ${draftInput.topic}`
    : draftInput.subject || draftInput.fileMeta?.name || 'Lecture Material';

  const stageIcons: Record<string, React.ReactNode> = {
    upload_received: <Upload className="w-4 h-4" />,
    reading_material: <FileText className="w-4 h-4" />,
    understanding_concepts: <Brain className="w-4 h-4" />,
    creating_notes: <Layers className="w-4 h-4" />,
    generating_quiz: <HelpCircle className="w-4 h-4" />,
    pack_ready: <Sparkles className="w-4 h-4" />
  };

  // If Error Occurred: Display Trustworthy & Actionable Failure Screen
  if (processingError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 space-y-6 animate-in fade-in">
        {/* Error Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mb-1 shadow-subtle">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
            {processingError.title}
          </h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            We encountered a problem while processing your lecture material.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="p-6 border-red-500/30 bg-red-500/10 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                What went wrong:
              </h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 leading-relaxed">
                {processingError.message}
              </p>
            </div>
          </div>

          {processingError.technicalDetails && (
            <div className="p-3 rounded-xl bg-surface border border-red-500/20 text-[11px] font-mono text-red-600 dark:text-red-400 break-all">
              <span className="font-bold font-sans block text-text-muted mb-0.5 text-[10px] uppercase">
                Technical Details:
              </span>
              {processingError.technicalDetails}
            </div>
          )}

          {/* Context Safeguard Note */}
          <div className="pt-2 border-t border-red-500/20 text-xs text-text-muted flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Your uploaded file <span className="font-semibold text-text-primary">"{draftInput.fileMeta?.name || 'document'}"</span> and subject <span className="font-semibold text-text-primary">"{draftInput.subject}"</span> remain saved.
            </span>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setCurrentScreen('upload')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Back to Upload Screen
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={retryProcessing}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-glow"
          >
            Retry Generation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/15 border border-brand/20 shadow-glow mb-1 text-brand">
          <Cpu className="w-7 h-7 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Synthesizing Study Pack
        </h1>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Distilling <span className="font-semibold text-text-primary">"{targetName}"</span> into concise revision notes and a 5-question practice quiz.
        </p>

        {/* Target Meta Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border shadow-subtle text-xs text-text-secondary">
          <span className="font-bold text-brand">{draftInput.subject || 'Course'}</span>
          {draftInput.topic && (
            <>
              <span className="text-text-muted">•</span>
              <span className="text-text-primary">{draftInput.topic}</span>
            </>
          )}
          {draftInput.fileMeta && (
            <>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted text-[11px]">{draftInput.fileMeta.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Progress Card with 6 Stages */}
      <Card className="p-6 sm:p-7 shadow-card space-y-6">
        {/* Progress Bar & Current Status Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              <span>{currentActiveStep?.label || 'Processing...'}</span>
            </span>
            <span className="text-brand font-mono text-sm">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} max={100} color="brand" className="h-2.5" />
        </div>

        {/* 6 Step Interactive Visual Pipeline */}
        <div className="space-y-3 pt-2">
          {processingSteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isPending = step.status === 'pending';

            return (
              <div
                key={step.id}
                className={cn(
                  'p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden',
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isInProgress
                    ? 'bg-brand/10 border-brand ring-2 ring-brand/20 shadow-subtle scale-[1.01]'
                    : 'bg-surface-secondary/40 border-border opacity-50'
                )}
              >
                {/* Step Status Icon */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors',
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-brand text-white shadow-subtle'
                      : 'bg-surface-secondary text-text-muted'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isInProgress ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Text Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs shrink-0', isInProgress ? 'text-brand' : 'text-text-muted')}>
                        {stageIcons[step.stageId]}
                      </span>
                      <h4
                        className={cn(
                          'text-xs sm:text-sm font-bold truncate',
                          isCompleted
                            ? 'text-emerald-400'
                            : isInProgress
                            ? 'text-brand font-extrabold'
                            : 'text-text-secondary'
                        )}
                      >
                        {step.label}
                      </h4>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                        isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isInProgress
                          ? 'bg-brand/15 text-brand animate-pulse'
                          : 'bg-surface-secondary text-text-muted'
                      )}
                    >
                      {isCompleted ? 'Done' : isInProgress ? 'In Progress' : 'Queued'}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rotating Learning Fact Callout */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Cognitive Science Note: </span>
          <span>{studyFacts[activeFactIndex]}</span>
        </div>
      </div>

      {/* Cancel Action */}
      <div className="text-center">
        <button
          type="button"
          onClick={cancelProcessing}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-red-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          <span>Cancel synthesis and keep inputs</span>
        </button>
      </div>
    </div>
  );
};
