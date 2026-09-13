import React, { useState, useEffect } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  FileText,
  Trophy,
  AlertCircle,
  Sparkles,
  Share2,
  Check,
  Award,
  BookOpen,
  ArrowUpRight,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import confetti from 'canvas-confetti';

export const QuizView: React.FC = () => {
  const {
    activeSession,
    setCurrentScreen,
    quizAnswers,
    setQuizAnswer,
    submitQuizAttempt,
    resetQuizState,
    setIsExportModalOpen,
    addToast
  } = useStudyFlow();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);

  useEffect(() => {
    // If the active session already has a saved latestAttempt, show the results review
    if (activeSession?.latestAttempt) {
      setIsSubmitted(true);
    } else {
      setIsSubmitted(false);
    }
  }, [activeSession]);

  if (!activeSession || !activeSession.quiz || activeSession.quiz.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-secondary flex items-center justify-center mx-auto text-text-muted">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-text-primary">No Quiz Available</h3>
        <p className="text-xs text-text-muted">
          No practice questions were synthesized for this session yet.
        </p>
        <Button
          variant="primary"
          onClick={() => setCurrentScreen('upload')}
          className="mt-2"
        >
          Generate New Study Pack
        </Button>
      </div>
    );
  }

  const quiz = activeSession.quiz.slice(0, 5); // strictly 5 questions
  const totalQuestions = quiz.length;
  const currentQuestion = quiz[currentQuestionIdx];
  const answeredQuestionNumbers = Object.keys(quizAnswers).map(Number);
  const answeredCount = answeredQuestionNumbers.length;
  const isAllAnswered = answeredCount === totalQuestions;
  const selectedOptionForCurrent = quizAnswers[currentQuestion.questionNumber];

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;
    setQuizAnswer(currentQuestion.questionNumber, optionId);
    if (showUnansweredWarning) setShowUnansweredWarning(false);
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!isAllAnswered) {
      setShowUnansweredWarning(true);
      return;
    }

    const attempt = submitQuizAttempt();
    setIsSubmitted(true);

    if (attempt && attempt.percentage >= 80) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error('Confetti error', e);
      }
    }

    addToast({
      type: 'success',
      title: 'Quiz Submitted!',
      message: `You scored ${attempt?.score || 0}/${totalQuestions} (${attempt?.percentage || 0}%).`
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation for active test taking (A, B, C, D, 1-4, ArrowLeft, ArrowRight, Enter)
  useEffect(() => {
    if (isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(activeTag)) return;

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') {
        e.preventDefault();
        handleSelectOption('A');
      } else if (key === 'B' || key === '2') {
        e.preventDefault();
        handleSelectOption('B');
      } else if (key === 'C' || key === '3') {
        e.preventDefault();
        handleSelectOption('C');
      } else if (key === 'D' || key === '4') {
        e.preventDefault();
        handleSelectOption('D');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentQuestionIdx < totalQuestions - 1) {
          handleNext();
        } else if (isAllAnswered) {
          handleSubmitQuiz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIdx, totalQuestions, isSubmitted, isAllAnswered, currentQuestion]);

  const handleRetryQuiz = () => {
    resetQuizState();
    setIsSubmitted(false);
    setCurrentQuestionIdx(0);
    setShowUnansweredWarning(false);
    addToast({
      type: 'info',
      title: 'Quiz Reset',
      message: 'Answers cleared. Good luck on your fresh attempt!'
    });
  };

  const latestAttempt = activeSession.latestAttempt;
  const progressPercent = Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100);

  // ==========================================
  // VIEW 1: POST-SUBMISSION RESULTS & REVIEW
  // ==========================================
  if (isSubmitted && latestAttempt) {
    const isMastered = latestAttempt.percentage >= 80;
    const isProficient = latestAttempt.percentage >= 60 && latestAttempt.percentage < 80;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in">
        {/* 1. Scorecard Hero Banner */}
        <Card className="p-6 sm:p-8 bg-surface-secondary text-text-primary shadow-elevated border-border space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-xs uppercase tracking-wider font-bold text-text-muted">
                  Practice Quiz Results
                </span>
                <Badge
                  variant={isMastered ? 'success' : isProficient ? 'purple' : 'warning'}
                  size="sm"
                >
                  {latestAttempt.masteryLevel}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                {latestAttempt.score} of {latestAttempt.totalQuestions} Correct
              </h1>

              <p className="text-xs sm:text-sm text-text-muted max-w-md">
                {isMastered
                  ? 'Outstanding retention! You have firmly mastered the core concepts.'
                  : isProficient
                  ? 'Great effort! Review the few missed topics below to solidify your understanding.'
                  : 'Needs reinforcement. Review the lecture explanations below before retesting.'}
              </p>
            </div>

            {/* Score Radial Metric */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand">
                {latestAttempt.percentage}%
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mt-0.5">
                Accuracy
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentScreen('notes')}
              leftIcon={<FileText className="w-4 h-4" />}
              className="font-semibold"
            >
              Return to Revision Notes
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleRetryQuiz}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry Quiz
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsExportModalOpen(true)}
                leftIcon={<Share2 className="w-4 h-4 text-white" />}
                className="shadow-glow"
              >
                Export Study Pack
              </Button>
            </div>
          </div>
        </Card>

        {/* 2. Detailed Question-by-Question Review Breakdown */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand" />
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                Detailed Answer Review (5 Questions)
              </h2>
            </div>
            <span className="text-xs text-text-muted font-medium">
              Based strictly on source material
            </span>
          </div>

          <div className="space-y-5">
            {quiz.map((q, idx) => {
              const studentAnswer = latestAttempt.selectedAnswers[q.questionNumber];
              const isCorrect = studentAnswer === q.correctOptionId;
              const correctOptionObj = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <Card
                  key={q.id || idx}
                  className={cn(
                    'p-5 sm:p-6 border transition-all space-y-4',
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-red-500/30 bg-red-500/5'
                  )}
                >
                  {/* Question Header & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Question {q.questionNumber} of 5
                        </span>
                        <span className="text-xs text-text-muted">•</span>
                        <Badge variant="neutral" size="sm">
                          {q.topicTag}
                        </Badge>
                        <Badge
                          variant={
                            q.difficulty === 'Foundation'
                              ? 'primary'
                              : q.difficulty === 'Intermediate'
                              ? 'purple'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text-primary pt-1 leading-snug">
                        {q.prompt}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Correct (+1)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-bold border border-red-500/30">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span>Incorrect (0)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options Breakdown */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt) => {
                      const isStudentChoice = studentAnswer === opt.id;
                      const isCorrectChoice = opt.id === q.correctOptionId;

                      let rowStyles = 'border-border bg-surface text-text-secondary';
                      let pillStyles = 'bg-surface-secondary text-text-muted border-border';

                      if (isCorrectChoice) {
                        rowStyles = 'border-emerald-500/50 bg-emerald-500/10 text-text-primary font-semibold ring-1 ring-emerald-500/50';
                        pillStyles = 'bg-emerald-600 text-white border-emerald-600';
                      } else if (isStudentChoice && !isCorrectChoice) {
                        rowStyles = 'border-red-500/50 bg-red-500/10 text-text-primary font-medium ring-1 ring-red-500/50';
                        pillStyles = 'bg-red-600 text-white border-red-600';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            'p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors',
                            rowStyles
                          )}
                        >
                          <span
                            className={cn(
                              'w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5',
                              pillStyles
                            )}
                          >
                            {opt.id}
                          </span>

                          <div className="flex-1 min-w-0 pt-0.5 leading-relaxed">
                            <span>{opt.text}</span>
                            {isStudentChoice && (
                              <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                (Your Answer)
                              </span>
                            )}
                            {isCorrectChoice && !isStudentChoice && (
                              <span className="ml-2 text-[11px] font-bold text-emerald-400">
                                ✓ Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grounded Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-brand font-bold">
                      <Lightbulb className="w-3.5 h-3.5 text-brand" />
                      <span>Lecture Rationale & Explanation:</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed pl-5">
                      {correctOptionObj?.explanation || q.options[0]?.explanation || 'Verified strictly against the source lecture material.'}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="p-6 rounded-2xl bg-surface-secondary border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-text-primary">Want to revise again or test another lecture?</h4>
            <p className="text-xs text-text-muted">You can return to the revision notes or restart the quiz anytime.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleRetryQuiz}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentScreen('notes')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review Notes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE 1-QUESTION-AT-A-TIME TEST
  // ==========================================
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Top Header & Context */}
      <div className="flex items-start justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Practice Quiz
            </Badge>
            <span className="text-xs text-text-muted font-medium">{activeSession.subject}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
            {activeSession.title}
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentScreen('notes')}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
          className="shrink-0"
        >
          Notes
        </Button>
      </div>

      {/* Progress Header: "Question X of 5" & Progress Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
          <span className="text-brand font-extrabold tracking-wide">
            Question {currentQuestion.questionNumber} of {totalQuestions}
          </span>
          <span className="text-text-muted">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <ProgressBar value={progressPercent} max={100} color="brand" className="h-2" />
      </div>

      {/* Question Selector Dots / Pills (1 to 5) */}
      <div className="flex items-center justify-between gap-2 p-2 bg-surface rounded-xl border border-border shadow-subtle overflow-x-auto">
        <div className="flex items-center gap-2">
          {quiz.map((q, idx) => {
            const isCurrent = idx === currentQuestionIdx;
            const isSelected = !!quizAnswers[q.questionNumber];

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => {
                  setCurrentQuestionIdx(idx);
                  if (showUnansweredWarning) setShowUnansweredWarning(false);
                }}
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative select-none',
                  isCurrent
                    ? 'ring-2 ring-brand bg-brand/15 text-brand shadow-subtle'
                    : isSelected
                    ? 'bg-surface-secondary text-text-primary hover:bg-surface-hover'
                    : 'bg-surface text-text-muted hover:bg-surface-secondary border border-border'
                )}
              >
                <span>Q{idx + 1}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand border-2 border-surface" />
                )}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-text-muted font-medium px-2">
          Click any Q to review
        </span>
      </div>

      {/* Main Single Question Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-card">
        {/* Question Metadata & Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neutral" size="sm">
              {currentQuestion.topicTag}
            </Badge>
            <Badge
              variant={
                currentQuestion.difficulty === 'Foundation'
                  ? 'primary'
                  : currentQuestion.difficulty === 'Intermediate'
                  ? 'purple'
                  : 'warning'
              }
              size="sm"
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-text-primary leading-snug pt-1">
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* 4 Answer Options (Single Select, No answers revealed yet) */}
        <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentQuestion.questionNumber} options`}>
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionForCurrent === opt.id;

            return (
              <div
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleSelectOption(opt.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleSelectOption(opt.id);
                  }
                }}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-brand bg-brand/10 ring-2 ring-brand/30 shadow-subtle'
                    : 'border-border hover:border-brand hover:bg-surface-secondary bg-surface'
                )}
              >
                {/* Option Letter Pill */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-all mt-0.5',
                    isSelected
                      ? 'bg-brand text-white border-brand shadow-subtle'
                      : 'bg-surface-secondary text-text-muted border-border'
                  )}
                >
                  {opt.id}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-xs sm:text-sm font-medium text-text-primary leading-relaxed pt-0.5">
                  {opt.text}
                </div>

                {/* Subtle Shortcut Hint for Desktop */}
                <span className="hidden sm:inline-block text-[10px] font-mono text-text-muted opacity-60">
                  [{opt.id}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Unanswered Warning Banner */}
        {showUnansweredWarning && !isAllAnswered && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Please answer all 5 questions before submitting. ({answeredCount}/5 completed)
            </span>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Previous Button (disabled on Question 1) */}
          <Button
            variant="outline"
            size="md"
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {/* Next / Submit Button */}
          {currentQuestionIdx < totalQuestions - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Question
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitQuiz}
              leftIcon={<Check className="w-4 h-4" />}
              className={cn(
                'shadow-glow font-bold',
                isAllAnswered
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-brand hover:bg-brand-hover'
              )}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
