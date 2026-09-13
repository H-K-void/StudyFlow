import React from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { findNoteByTitle } from '../../utils/wikiLinks';
import { FileText, Plus, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface WikiLinkTextProps {
  text: string;
  className?: string;
}

/**
 * Parses inline formatting: standard markdown links, bold, italic, inline code
 */
const renderFormattedText = (rawText: string, keyPrefix: string): React.ReactNode[] => {
  if (!rawText) return [];

  // Regex to match:
  // 1. Markdown link: [text](url)
  // 2. Inline code: `code`
  // 3. Bold: **text**
  // 4. Italic: *text* or _text_
  const inlineRegex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(rawText)) !== null) {
    const matchStart = match.index;
    const matchEnd = inlineRegex.lastIndex;
    const matchedStr = match[0];

    // Push text before match
    if (matchStart > lastIdx) {
      nodes.push(rawText.slice(lastIdx, matchStart));
    }

    const itemKey = `${keyPrefix}-inline-${matchStart}`;

    // 1. Markdown link [text](url)
    const linkMatch = matchedStr.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      nodes.push(
        <a
          key={itemKey}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline font-medium inline-flex items-center gap-0.5 mx-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{linkMatch[1]}</span>
          <ExternalLink className="w-3 h-3 inline-block opacity-70" />
        </a>
      );
      lastIdx = matchEnd;
      continue;
    }

    // 2. Inline code `code`
    if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      const codeContent = matchedStr.slice(1, -1);
      nodes.push(
        <code
          key={itemKey}
          className="px-1.5 py-0.5 rounded bg-surface-secondary text-brand font-mono text-[11px] sm:text-xs border border-border"
        >
          {codeContent}
        </code>
      );
      lastIdx = matchEnd;
      continue;
    }

    // 3. Bold **text**
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const boldContent = matchedStr.slice(2, -2);
      nodes.push(
        <strong key={itemKey} className="font-bold text-text-primary">
          {boldContent}
        </strong>
      );
      lastIdx = matchEnd;
      continue;
    }

    // 4. Italic *text* or _text_
    if (
      (matchedStr.startsWith('*') && matchedStr.endsWith('*')) ||
      (matchedStr.startsWith('_') && matchedStr.endsWith('_'))
    ) {
      const italicContent = matchedStr.slice(1, -1);
      nodes.push(
        <em key={itemKey} className="italic text-text-secondary">
          {italicContent}
        </em>
      );
      lastIdx = matchEnd;
      continue;
    }

    nodes.push(matchedStr);
    lastIdx = matchEnd;
  }

  if (lastIdx < rawText.length) {
    nodes.push(rawText.slice(lastIdx));
  }

  return nodes;
};

export const WikiLinkText: React.FC<WikiLinkTextProps> = ({ text, className }) => {
  const { vaultNotes, openOrCreateVaultNote } = useStudyFlow();

  if (!text) return null;

  // Match [[Link Title]]
  const parts: React.ReactNode[] = [];
  const regex = /\[\[(.*?)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawLinkText = match[1].trim();
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;

    // Push formatted text before link
    if (matchStart > lastIndex) {
      const preText = text.slice(lastIndex, matchStart);
      parts.push(...renderFormattedText(preText, `pre-${matchStart}`));
    }

    const matchedNote = findNoteByTitle(rawLinkText, vaultNotes);
    const exists = !!matchedNote;

    parts.push(
      <button
        key={`wiki-${matchStart}-${rawLinkText}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openOrCreateVaultNote(rawLinkText);
        }}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-semibold transition-all group align-baseline select-none focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer',
          exists
            ? 'bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30 shadow-subtle'
            : 'bg-surface-secondary hover:bg-brand/15 text-text-muted hover:text-brand border border-dashed border-border hover:border-brand/40'
        )}
        title={
          exists
            ? `Open "${matchedNote.title}" (${matchedNote.folderPath.join(' / ') || 'Root'})`
            : `Create "${rawLinkText}"`
        }
      >
        <span className="text-[10px] text-brand font-mono opacity-60">[[</span>
        {exists ? (
          <FileText className="w-3 h-3 text-brand shrink-0 inline-block" />
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-brand font-bold">
            <Plus className="w-3 h-3 shrink-0" />
            <span className="opacity-75">Create:</span>
          </span>
        )}
        <span className={cn('truncate max-w-[200px]', !exists && 'italic font-medium text-brand')}>
          {rawLinkText}
        </span>
        <span className="text-[10px] text-brand font-mono opacity-60">]]</span>
      </button>
    );

    lastIndex = matchEnd;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    const postText = text.slice(lastIndex);
    parts.push(...renderFormattedText(postText, `post-${lastIndex}`));
  }

  return <span className={className}>{parts}</span>;
};

