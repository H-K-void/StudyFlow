import React, { useState, useEffect } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Button } from '../common/Button';
import { VaultSidebar } from '../vault/VaultSidebar';
import { DocumentEditor } from './DocumentEditor';
import { KnowledgeGraphView } from '../graph/KnowledgeGraphView';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Folder,
  FileText,
  Network
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export const RevisionNotesView: React.FC = () => {
  const {
    activeNote,
    startNewFlow,
    canGoBack,
    canGoForward,
    navigateBack,
    navigateForward,
    currentScreen,
    setCurrentScreen
  } = useStudyFlow();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<'editor' | 'graph'>(() => {
    return currentScreen === 'graph' ? 'graph' : 'editor';
  });

  // Sync workspaceView if currentScreen switches externally
  useEffect(() => {
    if (currentScreen === 'graph') {
      setWorkspaceView('graph');
    }
  }, [currentScreen]);

  // Keyboard navigation for history (Alt + Left, Alt + Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigateForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateBack, navigateForward]);

  if (!activeNote) {
    return (
      <div className="flex h-[calc(100vh-8rem)]">
        <VaultSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex items-center justify-center p-8 text-center text-text-muted">
          <div className="max-w-md space-y-4">
            <BookOpen className="w-12 h-12 text-text-muted/60 mx-auto" />
            <h3 className="text-lg font-bold text-text-primary">No Note Selected</h3>
            <p className="text-xs text-text-muted">Select a note from the left vault explorer or upload lecture material.</p>
            <Button variant="primary" size="sm" onClick={startNewFlow}>
              Upload New Lecture
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-7rem)] w-full">
      {/* 1. Left Obsidian-Style Vault Explorer Sidebar */}
      <VaultSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Note Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top Breadcrumb & History Navigation Bar */}
        <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 no-print shadow-2xs transition-colors flex-wrap">
          {/* Breadcrumb Trail & History Controls */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {/* History Back / Forward Buttons */}
            <div className="flex items-center gap-1 shrink-0 bg-surface-secondary p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={navigateBack}
                disabled={!canGoBack}
                title="Back (Alt + ←)"
                className={cn(
                  'p-1 rounded-md text-xs font-semibold transition-colors',
                  canGoBack
                    ? 'text-text-primary hover:bg-surface hover:text-brand shadow-2xs'
                    : 'text-text-muted/40 cursor-not-allowed'
                )}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={navigateForward}
                disabled={!canGoForward}
                title="Forward (Alt + →)"
                className={cn(
                  'p-1 rounded-md text-xs font-semibold transition-colors',
                  canGoForward
                    ? 'text-text-primary hover:bg-surface hover:text-brand shadow-2xs'
                    : 'text-text-muted/40 cursor-not-allowed'
                )}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs text-text-muted overflow-hidden font-medium">
              <span className="flex items-center gap-1 text-text-muted shrink-0 font-medium">
                <Folder className="w-3.5 h-3.5" />
                <span>Study Vault</span>
              </span>

              {activeNote.folderPath.map((folder, idx) => (
                <React.Fragment key={`${folder}-${idx}`}>
                  <ChevronRight className="w-3 h-3 text-text-muted/40 shrink-0" />
                  <span className="truncate max-w-[120px] text-text-secondary font-medium">
                    {folder}
                  </span>
                </React.Fragment>
              ))}

              <ChevronRight className="w-3 h-3 text-text-muted/40 shrink-0" />
              <span className="font-bold text-text-primary truncate max-w-[180px]">
                {activeNote.title}
              </span>
            </div>
          </div>

          {/* Right: Workspace Navigation View Switcher (Document vs Knowledge Graph) */}
          <div className="flex items-center bg-surface-secondary p-0.5 rounded-lg border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setWorkspaceView('editor');
                if (currentScreen === 'graph') setCurrentScreen('notes');
              }}
              className={cn(
                'px-3 py-1 rounded-md transition-all flex items-center gap-1.5',
                workspaceView === 'editor'
                  ? 'bg-surface text-brand shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text-primary'
              )}
              title="Switch to Document Editor"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setWorkspaceView('graph');
                if (currentScreen === 'notes') setCurrentScreen('graph');
              }}
              className={cn(
                'px-3 py-1 rounded-md transition-all flex items-center gap-1.5',
                workspaceView === 'graph'
                  ? 'bg-surface text-brand shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text-primary'
              )}
              title="Switch to Knowledge Graph View"
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span>Graph</span>
            </button>
          </div>
        </div>

        {/* 3. Central Workspace View: Document Editor OR Knowledge Graph */}
        <div className="flex-1 flex flex-col min-w-0">
          {workspaceView === 'editor' ? (
            <DocumentEditor key={activeNote.id} note={activeNote} />
          ) : (
            <KnowledgeGraphView
              onOpenNoteInEditor={() => {
                setWorkspaceView('editor');
                setCurrentScreen('notes');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

