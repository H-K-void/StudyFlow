import React, { useState } from 'react';
import { WikiLinkText } from '../vault/WikiLinkText';
import { Check, Copy, Code2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface DocumentNoteRendererProps {
  content: string;
  onToggleChecklist?: (lineIndex: number, checked: boolean) => void;
  className?: string;
}

export const DocumentNoteRenderer: React.FC<DocumentNoteRendererProps> = ({
  content,
  onToggleChecklist,
  className
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  if (!content) {
    return (
      <div className="text-text-muted italic text-sm py-8 text-center">
        Empty note. Click "Edit Mode" to start writing notes.
      </div>
    );
  }

  // Parse markdown content into structured blocks
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let codeBlockCounter = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block (```lang ... ```)
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch && langMatch[1] ? langMatch[1] : 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const fullCode = codeLines.join('\n');
      const currentCodeIdx = codeBlockCounter++;

      blocks.push(
        <div
          key={`code-${i}-${currentCodeIdx}`}
          className="my-5 rounded-xl overflow-hidden border border-border bg-surface-secondary text-text-primary shadow-subtle group"
        >
          <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1.5 uppercase font-bold text-[11px] text-brand">
              <Code2 className="w-3.5 h-3.5" />
              {language}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(fullCode, currentCodeIdx)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-surface-secondary hover:bg-surface-hover text-text-primary transition-colors text-[11px] border border-border"
            >
              {copiedCodeIdx === currentCodeIdx ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed custom-scrollbar">
            <code>{fullCode}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Table (| Header | Header | ... | --- | --- | ... | Data | Data |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headerCells = parseRow(tableLines[0]);
        const isDivider = (str: string) => /^[:-]+$/.test(str.trim());
        const dataRows = tableLines.slice(1).filter((r) => !parseRow(r).every(isDivider));

        blocks.push(
          <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-xl border border-border shadow-subtle">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-surface-secondary text-text-primary border-b border-border font-bold">
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 border-r last:border-r-0 border-border font-bold">
                      <WikiLinkText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {dataRows.map((rowStr, rIdx) => {
                  const cells = parseRow(rowStr);
                  return (
                    <tr key={rIdx} className="hover:bg-surface-hover transition-colors">
                      {cells.map((c, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 border-r last:border-r-0 border-border text-text-secondary">
                          <WikiLinkText text={c} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Headings (# H1, ## H2, ### H3, #### H4)
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mt-7 mb-3 leading-snug">
          <WikiLinkText text={line.replace(/^#\s+/, '')} />
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-text-primary tracking-tight mt-6 mb-2.5 pt-2 border-b border-border pb-1.5 flex items-center gap-2">
          <WikiLinkText text={line.replace(/^##\s+/, '')} />
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-text-primary tracking-tight mt-5 mb-2">
          <WikiLinkText text={line.replace(/^###\s+/, '')} />
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-text-primary mt-4 mb-1.5">
          <WikiLinkText text={line.replace(/^####\s+/, '')} />
        </h4>
      );
      i++;
      continue;
    }

    // 4. Horizontal Separator (---, ***, ___)
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      blocks.push(
        <hr key={`hr-${i}`} className="my-6 border-border" />
      );
      i++;
      continue;
    }

    // 5. Blockquote (> Quote)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-xs sm:text-sm text-amber-900 dark:text-amber-200 italic space-y-1"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="leading-relaxed">
              <WikiLinkText text={ql} />
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 6. Interactive Checklist (- [ ] or - [x])
    if (/^[-*]\s+\[([ xX])\]\s+(.*)/.test(line)) {
      const checklistItems: { checked: boolean; text: string; lineIndex: number }[] = [];
      while (i < lines.length && /^[-*]\s+\[([ xX])\]\s+(.*)/.test(lines[i])) {
        const match = lines[i].match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
        if (match) {
          checklistItems.push({
            checked: match[1].toLowerCase() === 'x',
            text: match[2],
            lineIndex: i
          });
        }
        i++;
      }

      blocks.push(
        <div key={`checklist-${i}`} className="my-3 space-y-1.5">
          {checklistItems.map((item, cIdx) => (
            <div
              key={cIdx}
              onClick={() => onToggleChecklist?.(item.lineIndex, !item.checked)}
              className="flex items-start gap-2.5 p-1 rounded hover:bg-surface-hover cursor-pointer select-none transition-colors group"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}}
                className="w-4 h-4 mt-0.5 rounded border-border text-brand focus:ring-brand cursor-pointer shrink-0"
              />
              <span
                className={cn(
                  'text-xs sm:text-sm leading-relaxed',
                  item.checked
                    ? 'line-through text-text-muted'
                    : 'text-text-primary'
                )}
              >
                <WikiLinkText text={item.text} />
              </span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // 7. Bullet List (- item or * item)
    if (/^[-*]\s+(.*)/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+(.*)/.test(lines[i])) {
        const match = lines[i].match(/^[-*]\s+(.*)/);
        if (match) listItems.push(match[1]);
        i++;
      }

      blocks.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-5 list-disc list-outside text-xs sm:text-sm text-text-secondary marker:text-brand">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              <WikiLinkText text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 8. Numbered List (1. item)
    if (/^\d+\.\s+(.*)/.test(line)) {
      const numItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+(.*)/.test(lines[i])) {
        const match = lines[i].match(/^\d+\.\s+(.*)/);
        if (match) numItems.push(match[1]);
        i++;
      }

      blocks.push(
        <ol key={`ol-${i}`} className="my-3 space-y-1.5 pl-5 list-decimal list-outside text-xs sm:text-sm text-text-secondary marker:font-bold marker:text-brand">
          {numItems.map((item, nIdx) => (
            <li key={nIdx} className="leading-relaxed">
              <WikiLinkText text={item} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 9. Empty Line / Line Break
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 10. Standard Paragraph (with bold, italic, inline code, and wiki links)
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-xs sm:text-sm leading-relaxed text-text-secondary">
        <WikiLinkText text={line} />
      </p>
    );
    i++;
  }

  return <div className={cn('prose-container space-y-1 font-sans', className)}>{blocks}</div>;
};
