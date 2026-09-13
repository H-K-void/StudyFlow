import React from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Button } from '../common/Button';
import { Card, CardBody, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  TrendingUp,
  Flame,
  Zap,
  Layers
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { SAMPLE_SESSIONS } from '../../data/sampleData';

export const WorkspaceLanding: React.FC = () => {
  const {
    sessions,
    loadSampleSession,
    startNewFlow,
    setActiveSession,
    setCurrentScreen
  } = useStudyFlow();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
          <span>Lecture Material → Revision Notes + Practice Quiz</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
          Turn your lecture material into a <span className="text-brand">revision-ready study pack.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Upload slide decks, readings, or lecture documents. StudyFlow AI extracts high-yield principles, key formulas, and generates an interactive 5-question practice quiz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={startNewFlow}
            leftIcon={<Zap className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-glow"
          >
            Start New Study Pack
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => loadSampleSession(SAMPLE_SESSIONS[0].id)}
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            className="w-full sm:w-auto"
          >
            Load Sample Pack
          </Button>
        </div>
      </div>

      {/* 3-Pillar Value Proposition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 hover:border-brand transition-colors">
          <div className="w-10 h-10 rounded-xl bg-brand/15 text-brand flex items-center justify-center mb-4 font-bold border border-brand/20">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1.5">1. High-Yield Distillation</h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Eliminates conversational filler and highlights testable equations, definitions, and exam pitfalls in clean structured cards.
          </p>
        </Card>

        <Card className="p-6 hover:border-emerald-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4 font-bold border border-emerald-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1.5">2. 5-Question Mastery Check</h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Targeted multiple-choice questions ranging from foundation to edge cases with instant rationales for every option.
          </p>
        </Card>

        <Card className="p-6 hover:border-purple-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 font-bold border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1.5">3. Clean Markdown & Export</h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Instantly export into formatted Markdown, plain text, or copy directly into Notion, Obsidian, or printable study sheets.
          </p>
        </Card>
      </div>

      {/* Demo Topics Quick Picker Shelf */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Pre-Curated Hackathon Demo Topics
            </h2>
          </div>
          <span className="text-xs text-text-muted font-medium hidden sm:inline">
            Click any topic to test full workflow
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_SESSIONS.map((session) => (
            <Card
              key={session.id}
              hoverable
              onClick={() => loadSampleSession(session.id)}
              className="group hover:border-brand p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary" size="sm">
                    {session.subject}
                  </Badge>
                  <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.notes.estimatedStudyTimeMinutes} min rev.
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-2">
                  {session.title}
                </h4>
                <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {session.notes.executiveSummary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-brand">
                <span>Open Revision Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Your Study Sessions ({sessions.length})
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={startNewFlow} leftIcon={<Zap className="w-3.5 h-3.5" />}>
            New Session
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="p-4 sm:p-5 hover:border-border-secondary transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" size="sm">{session.subject}</Badge>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{formatDate(session.createdAt)}</span>
                  {session.latestAttempt && (
                    <Badge
                      variant={session.latestAttempt.percentage >= 80 ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      Quiz: {session.latestAttempt.score}/{session.latestAttempt.totalQuestions} ({session.latestAttempt.percentage}%)
                    </Badge>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-text-primary truncate">
                  {session.title}
                </h4>
                <p className="text-xs text-text-muted truncate max-w-xl">
                  {session.notes.executiveSummary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveSession(session);
                    setCurrentScreen('notes');
                  }}
                  leftIcon={<FileText className="w-3.5 h-3.5 text-brand" />}
                >
                  Notes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveSession(session);
                    setCurrentScreen('quiz');
                  }}
                  leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                >
                  Practice Quiz
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
