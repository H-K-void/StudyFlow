import React, { useState } from 'react';
import { VaultNote } from '../../types';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { findBacklinks } from '../../utils/wikiLinks';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Link2,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  Folder,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface BacklinksSectionProps {
  currentNote: VaultNote;
}

export const BacklinksSection: React.FC<BacklinksSectionProps> = ({ currentNote }) => {
  const { vaultNotes, openVaultNote } = useStudyFlow();
  const [isExpanded, setIsExpanded] = useState(true);

  const backlinks = findBacklinks(currentNote.title, currentNote.id, vaultNotes);

  return (
    <div className="pt-6 border-t border-border space-y-3 no-print">
      {/* Backlinks Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-6 h-6 rounded-lg bg-surface-secondary text-text-secondary flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
            Backlinks ({backlinks.length})
          </h3>
          <span className="text-[11px] text-text-muted font-normal">
            Notes referencing [[{currentNote.title}]]
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
          Obsidian Graph Link
        </span>
      </div>

      {/* Backlinks Content */}
      {isExpanded && (
        <div>
          {backlinks.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-secondary/80 border border-border text-xs text-text-muted flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>No incoming links yet. Reference this note from another note using </span>
                <span className="font-mono font-semibold text-brand bg-surface px-1.5 py-0.5 rounded border border-border">
                  [[{currentNote.title}]]
                </span>
                <span> to automatically establish a bidirectional knowledge connection.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backlinks.map((ref) => (
                <div
                  key={ref.sourceNoteId}
                  onClick={() => openVaultNote(ref.sourceNoteId)}
                  className="p-3.5 rounded-xl border border-border bg-surface hover:border-brand hover:bg-surface-secondary/60 transition-all cursor-pointer shadow-subtle group space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-brand shrink-0" />
                        <h4 className="text-xs font-bold text-text-primary group-hover:text-brand truncate">
                          {ref.sourceNoteTitle}
                        </h4>
                      </div>
                      <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Folder className="w-3 h-3 text-text-muted/60" />
                      <span>{ref.sourceFolderPath.join(' / ') || 'Root Vault'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary bg-surface-secondary group-hover:bg-surface p-2 rounded-lg border border-border font-sans italic line-clamp-2 leading-relaxed">
                    "{ref.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
