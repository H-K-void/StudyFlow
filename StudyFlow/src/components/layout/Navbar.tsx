import React, { useState, useRef, useEffect } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Sparkles,
  Plus,
  Share2,
  ChevronDown,
  FileText,
  GraduationCap,
  Sun,
  Moon
} from 'lucide-react';
import { SAMPLE_SESSIONS } from '../../data/sampleData';
import { cn } from '../../utils/helpers';

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    activeSession,
    loadSampleSession,
    startNewFlow,
    setIsExportModalOpen,
    theme,
    toggleTheme
  } = useStudyFlow();

  const [isSampleDropdownOpen, setIsSampleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSampleDropdownOpen(false);
      }
    };

    if (isSampleDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSampleDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentScreen('workspace')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-subtle group-hover:bg-brand-hover transition-colors shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-text-primary tracking-tight leading-none group-hover:text-brand transition-colors">
                    StudyFlow<span className="text-brand font-extrabold ml-0.5">AI</span>
                  </span>
                  <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
                    Student Edition
                  </Badge>
                </div>
                <span className="text-[10px] text-text-muted font-medium tracking-wide mt-0.5 hidden xs:inline">
                  Lecture → High-Yield Notes + 5Q Quiz
                </span>
              </div>
            </button>
          </div>

          {/* Quick Nav / Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Sample Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSampleDropdownOpen((prev) => !prev)}
                rightIcon={<ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isSampleDropdownOpen && "rotate-180")} />}
                className="hidden md:inline-flex"
                aria-expanded={isSampleDropdownOpen}
                aria-haspopup="true"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo Topics</span>
              </Button>

              {isSampleDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-surface rounded-2xl shadow-elevated border border-border py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Curated Lecture Samples
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                    {SAMPLE_SESSIONS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          loadSampleSession(sample.id);
                          setIsSampleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-surface-secondary flex items-start gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand/20 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors truncate">
                            {sample.title}
                          </p>
                          <p className="text-[11px] text-text-muted truncate mt-0.5">{sample.subject}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* If has active session and in notes/quiz */}
            {activeSession && (currentScreen === 'notes' || currentScreen === 'quiz') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-text-muted" />}
              >
                <span className="hidden sm:inline">Export / Share</span>
                <span className="sm:hidden">Share</span>
              </Button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-surface-secondary text-text-primary hover:bg-surface-hover hover:text-brand transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-text-secondary transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Start New Study Flow CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={startNewFlow}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span>New Flow</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
