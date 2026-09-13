import React, { useState } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  HelpCircle,
  Sparkles,
  FileCheck,
  FileCode,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import {
  generateMarkdownExport,
  copyToClipboard,
  downloadFile
} from '../../utils/helpers';
import { exportNotesToPdf, exportQuizToPdf } from '../../utils/pdfExport';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    activeSession,
    addToast
  } = useStudyFlow();

  const [copied, setCopied] = useState(false);
  const [downloadingNotes, setDownloadingNotes] = useState(false);
  const [downloadingQuiz, setDownloadingQuiz] = useState(false);

  if (!activeSession) return null;

  const markdownContent = generateMarkdownExport(activeSession);

  const handleDownloadNotesPdf = () => {
    try {
      setDownloadingNotes(true);
      exportNotesToPdf(activeSession);
      addToast({
        type: 'success',
        title: 'PDF Downloaded',
        message: 'Revision Notes PDF saved to your downloads.'
      });
    } catch (err) {
      console.error('Notes PDF export error', err);
      addToast({
        type: 'error',
        title: 'PDF Generation Error',
        message: 'Could not generate PDF. Please use the Print option.'
      });
    } finally {
      setTimeout(() => setDownloadingNotes(false), 1000);
    }
  };

  const handleDownloadQuizPdf = () => {
    try {
      setDownloadingQuiz(true);
      exportQuizToPdf(activeSession);
      addToast({
        type: 'success',
        title: 'Quiz PDF Downloaded',
        message: '5-Question Practice Quiz with Answer Key saved to your downloads.'
      });
    } catch (err) {
      console.error('Quiz PDF export error', err);
      addToast({
        type: 'error',
        title: 'Quiz PDF Error',
        message: 'Could not generate Quiz PDF.'
      });
    } finally {
      setTimeout(() => setDownloadingQuiz(false), 1000);
    }
  };

  const handleCopyNotes = async () => {
    const ok = await copyToClipboard(markdownContent);
    if (ok) {
      setCopied(true);
      addToast({
        type: 'success',
        title: 'Notes Copied',
        message: 'Formatted revision notes copied to clipboard.'
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintStudyPack = () => {
    setIsExportModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <Modal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      title="Export Study Pack"
      description={`Revision notes and practice quiz for "${activeSession.title}"`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Export Options Grid (4 Core Options) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Download Revision Notes as PDF */}
          <div
            onClick={handleDownloadNotesPdf}
            className="p-4 rounded-xl border border-border hover:border-brand bg-surface hover:bg-surface-secondary transition-all cursor-pointer shadow-subtle group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                  1. Download Notes as PDF
                </h4>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                  Formatted PDF with title, summary, core concepts, formulas, and exam traps.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              isLoading={downloadingNotes}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="w-full text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 border-brand/30"
            >
              Download Notes PDF
            </Button>
          </div>

          {/* Option 2: Download Quiz as PDF */}
          <div
            onClick={handleDownloadQuizPdf}
            className="p-4 rounded-xl border border-border hover:border-emerald-500 bg-surface hover:bg-surface-secondary transition-all cursor-pointer shadow-subtle group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-emerald-500 transition-colors">
                  2. Download Quiz as PDF
                </h4>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                  5 questions & answer options + complete answer key & rationales at the end.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              isLoading={downloadingQuiz}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="w-full text-xs font-semibold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
            >
              Download Quiz PDF
            </Button>
          </div>

          {/* Option 3: Copy Revision Notes */}
          <div
            onClick={handleCopyNotes}
            className="p-4 rounded-xl border border-border hover:border-purple-500 bg-surface hover:bg-surface-secondary transition-all cursor-pointer shadow-subtle group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-purple-400 transition-colors">
                  3. Copy Revision Notes
                </h4>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                  1-click copy formatted notes ready for Notion, Obsidian, Google Docs, or email.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              className="w-full text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Formatted Notes'}
            </Button>
          </div>

          {/* Option 4: Print Study Pack */}
          <div
            onClick={handlePrintStudyPack}
            className="p-4 rounded-xl border border-border hover:border-amber-500 bg-surface hover:bg-surface-secondary transition-all cursor-pointer shadow-subtle group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary group-hover:text-amber-500 transition-colors">
                  4. Print Study Pack
                </h4>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                  Clean printer-optimized study sheet layout with headers and page margins.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="w-full text-xs font-semibold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>

        {/* Quick Format Info */}
        <div className="p-3.5 rounded-xl bg-surface-secondary border border-border flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Ready-to-use vector PDFs & clipboard outputs. Zero manual reformatting required.</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExportModalOpen(false)}
            className="text-xs text-text-muted"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
