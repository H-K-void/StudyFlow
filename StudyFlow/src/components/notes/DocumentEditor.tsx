import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VaultNote } from '../../types';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { DocumentNoteRenderer } from './DocumentNoteRenderer';
import { BacklinksSection } from '../vault/BacklinksSection';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Eye,
  Edit3,
  Columns,
  Save,
  Check,
  Clock,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
  Minus,
  Sparkles,
  Share2,
  Copy,
  Printer,
  HelpCircle,
  Folder
} from 'lucide-react';
import { formatDate, getSubjectDomainInfo, copyToClipboard, cn } from '../../utils/helpers';

interface DocumentEditorProps {
  note: VaultNote;
}

type EditorViewMode = 'preview' | 'edit' | 'split';
type SaveStatus = 'saved' | 'saving' | 'unsaved';

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ note }) => {
  const {
    activeSession,
    updateVaultNoteContent,
    setCurrentScreen,
    setIsExportModalOpen,
    addToast
  } = useStudyFlow();

  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [viewMode, setViewMode] = useState<EditorViewMode>('preview');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync content when note changes
  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setSaveStatus('saved');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
  }, [note.id]);

  // Debounced Autosave Function
  const triggerAutosave = useCallback(
    (newContent: string, newTitle?: string) => {
      setSaveStatus('unsaved');
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        updateVaultNoteContent(note.id, newContent, newTitle || title);
        setTimeout(() => {
          setSaveStatus('saved');
        }, 350);
      }, 750);
    },
    [note.id, title, updateVaultNoteContent]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextContent = e.target.value;
    setContent(nextContent);
    triggerAutosave(nextContent, title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    setTitle(nextTitle);
    triggerAutosave(content, nextTitle);
  };

  const handleManualSave = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    setSaveStatus('saving');
    updateVaultNoteContent(note.id, content, title);
    setTimeout(() => {
      setSaveStatus('saved');
      addToast({
        type: 'success',
        title: 'Note Saved',
        message: `Saved changes to "${title}".`
      });
    }, 250);
  };

  // Keyboard Shortcuts (Ctrl+S, Ctrl+B, Ctrl+I, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleManualSave();
      return;
    }

    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(nextContent);
      triggerAutosave(nextContent, title);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Insert markdown helpers into textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);
    triggerAutosave(nextContent, title);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Interactive Checklist toggle inside Preview mode
  const handleToggleChecklist = (lineIndex: number, newChecked: boolean) => {
    const lines = content.split(/\r?\n/);
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const match = line.match(/^([ \t]*[-*]\s+\[)([ xX])(\]\s+.*)$/);
      if (match) {
        lines[lineIndex] = `${match[1]}${newChecked ? 'x' : ' '}${match[3]}`;
        const nextContent = lines.join('\n');
        setContent(nextContent);
        triggerAutosave(nextContent, title);
      }
    }
  };

  const handleCopyNote = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Notes Copied',
        message: 'Full formatted markdown copied to clipboard.'
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subjectName = activeSession?.subject || note.folderPath[0] || 'General';
  const domainInfo = getSubjectDomainInfo(subjectName, title);
  const hasQuiz = activeSession && !!activeSession.quiz && activeSession.quiz.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background transition-colors">
      {/* 1. Desktop Editor Control & Toolbar Bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 no-print shadow-2xs">
        {/* Left: View Mode Switcher + Formatting Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-surface-secondary p-0.5 rounded-lg border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5',
                viewMode === 'preview'
                  ? 'bg-surface text-brand shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text-primary'
              )}
              title="Reading / Document Preview"
            >
              <Eye className="w-3.5 h-3.5 text-brand" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5',
                viewMode === 'edit'
                  ? 'bg-surface text-brand shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text-primary'
              )}
              title="Edit Markdown Source"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Edit Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all hidden md:flex items-center gap-1.5',
                viewMode === 'split'
                  ? 'bg-surface text-brand shadow-2xs font-bold'
                  : 'text-text-muted hover:text-text-primary'
              )}
              title="Split Editor & Live Preview"
            >
              <Columns className="w-3.5 h-3.5 text-brand" />
              <span>Split</span>
            </button>
          </div>

          {/* Quick Formatting Toolbar (Available when Editing or Split) */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className="flex items-center gap-0.5 bg-surface-secondary p-0.5 rounded-lg border border-border text-text-secondary">
              <button
                type="button"
                onClick={() => insertFormatting('## ', '', 'Heading')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Heading 2 (## )"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '', 'Subheading')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Heading 3 (### )"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-border mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'bold text')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Bold (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'italic text')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Italic (*text*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-border mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('- ', '', 'List item')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Bullet List (- )"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Numbered List (1. )"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- [ ] ', '', 'Checklist task')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Checklist (- [ ] )"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-border mx-0.5" />
              <button
                type="button"
                onClick={() => insertFormatting('> ', '', 'Important note or formula')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Blockquote (> )"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```\n', '\n```', 'code here')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Code Block (```)"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('| Header 1 | Header 2 |\n| --- | --- |\n| ', ' | Data 2 |', 'Data 1')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Insert Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[[', ']]', 'Concept Name')}
                className="p-1 rounded hover:bg-surface hover:text-brand font-bold transition-colors text-[10px] font-mono"
                title="Internal Wiki Link ([[Concept]])"
              >
                [[ ]]
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n---\n', '', '')}
                className="p-1 rounded hover:bg-surface hover:text-brand transition-colors"
                title="Horizontal Rule (---)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Autosave Status Indicator & Action Triggers */}
        <div className="flex items-center gap-2">
          {/* Subtle Autosave Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md bg-surface-secondary border border-border">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-brand font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </span>
            )}
          </div>

          {/* Practice Quiz Link if available */}
          {hasQuiz && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentScreen('quiz')}
              leftIcon={<HelpCircle className="w-3.5 h-3.5 text-white" />}
              className="text-xs h-7 py-0 shadow-glow"
            >
              <span>Practice Quiz</span>
            </Button>
          )}

          {/* Copy Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyNote}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            className="text-xs h-7 py-0"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-text-muted" />}
            className="text-xs h-7 py-0 hidden sm:inline-flex"
          >
            Export
          </Button>
        </div>
      </div>

      {/* 2. Main Desktop Document Workspace Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-6 sm:py-8 custom-scrollbar">
        {/* VIEW MODE: SPLIT (Side-by-side Editor & Live Preview) */}
        {viewMode === 'split' && (
          <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6 min-h-[calc(100vh-14rem)]">
            {/* Left: Source Textarea */}
            <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col shadow-xs">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Note Title..."
                className="text-2xl font-extrabold text-text-primary bg-transparent border-b border-border pb-3 mb-4 focus:outline-none focus:border-brand font-sans tracking-tight"
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your markdown note here..."
                className="flex-1 w-full p-2 font-mono text-xs sm:text-sm text-text-primary bg-transparent resize-none focus:outline-none leading-relaxed custom-scrollbar"
              />
            </div>

            {/* Right: Live Document Renderer */}
            <div className="bg-surface rounded-2xl border border-border p-8 overflow-y-auto shadow-xs custom-scrollbar">
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4 pb-3 border-b border-border">
                {title}
              </h1>
              <DocumentNoteRenderer content={content} onToggleChecklist={handleToggleChecklist} />
              <BacklinksSection currentNote={{ ...note, title, content }} />
            </div>
          </div>
        )}

        {/* VIEW MODE: EDIT (Full-width Source Markdown Editor) */}
        {viewMode === 'edit' && (
          <div className="max-w-4xl mx-auto bg-surface rounded-2xl border border-border p-6 sm:p-10 shadow-card min-h-[calc(100vh-14rem)] flex flex-col">
            {/* Editable Title Input */}
            <div className="mb-4 pb-3 border-b border-border flex items-center justify-between gap-4">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Note Title..."
                className="w-full text-2xl sm:text-3xl font-extrabold text-text-primary bg-transparent focus:outline-none font-sans tracking-tight placeholder:text-text-muted"
              />
              <Badge variant="primary" size="sm" className="shrink-0">
                Markdown Source
              </Badge>
            </div>

            {/* Source Markdown Textarea with generous line-height */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              rows={28}
              placeholder="Write your markdown note here... Use [[Note Title]] for wiki links."
              className="flex-1 w-full font-mono text-xs sm:text-sm text-text-primary bg-transparent border-none focus:outline-none leading-relaxed custom-scrollbar p-2"
              autoFocus
            />
          </div>
        )}

        {/* VIEW MODE: PREVIEW (Clean, Publication-Grade Desktop Document) */}
        {viewMode === 'preview' && (
          <div className="max-w-4xl mx-auto bg-surface rounded-2xl border border-border p-6 sm:p-12 shadow-card min-h-[calc(100vh-14rem)] space-y-6 animate-in fade-in">
            {/* Document Header */}
            <div className="space-y-3 pb-6 border-b border-border">
              {/* Meta Pills */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" size="md">
                    {subjectName}
                  </Badge>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {formatDate(note.updatedAt)}</span>
                </div>
              </div>

              {/* Large Note Document Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-[1.2]">
                {title}
              </h1>

              {/* Subject Personalization Bar */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>Personalized for {domainInfo.label}: {domainInfo.focusHighlights.slice(0, 2).join(' • ')}</span>
              </div>
            </div>

            {/* Continuous Clean Document Content */}
            <div className="py-2">
              <DocumentNoteRenderer content={content} onToggleChecklist={handleToggleChecklist} />
            </div>

            {/* Bidirectional Obsidian Backlinks */}
            <BacklinksSection currentNote={{ ...note, title, content }} />
          </div>
        )}
      </div>
    </div>
  );
};
