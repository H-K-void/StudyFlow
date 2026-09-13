import React, { useState, useRef } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Upload,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Trash2,
  BookOpen
} from 'lucide-react';
import { SAMPLE_SESSIONS } from '../../data/sampleData';

export const UploadSection: React.FC = () => {
  const {
    draftInput,
    setDraftInput,
    setSelectedFile,
    clearSelectedFile,
    startProcessingFlow,
    setCurrentScreen,
    addToast
  } = useStudyFlow();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileMeta = draftInput.fileMeta;
  const isFormValid = !!fileMeta && draftInput.subject.trim().length > 0;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFile(e.target.files[0]);
    }
  };

  const processIncomingFile = (file: File) => {
    const result = setSelectedFile(file);
    if (!result.isValid) {
      setValidationError(result.error || 'Invalid file uploaded.');
    } else {
      setValidationError(null);
      addToast({
        type: 'success',
        title: 'File Attached',
        message: `${file.name} ready for processing.`
      });
    }
  };

  const loadSampleDataset = (sessionIndex: number) => {
    const sample = SAMPLE_SESSIONS[sessionIndex];
    setDraftInput((prev) => ({
      ...prev,
      subject: sample.subject,
      topic: sample.title.includes(':') ? sample.title.split(':')[1].trim() : sample.title,
      fileMeta: {
        file: null,
        name: sample.material.fileName || `${sample.subject}_Lecture.pptx`,
        sizeFormatted: sample.material.fileSize || '4.8 MB',
        sizeBytes: 4.8 * 1024 * 1024,
        extension: (sample.material.fileName?.split('.').pop() as any) || 'pptx',
        typeLabel: sample.material.fileName?.endsWith('.pdf') ? 'PDF Document' : 'PowerPoint Slides (PPTX)'
      }
    }));
    setValidationError(null);
    addToast({
      type: 'info',
      title: 'Sample Document Attached',
      message: `Populated with "${sample.material.fileName || sample.title}".`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileMeta) {
      setValidationError('Please select or drop a lecture file (PDF, DOCX, or PPTX).');
      return;
    }

    if (!draftInput.subject.trim()) {
      setValidationError('Please specify a Subject / Course name (e.g. Data Structures).');
      return;
    }

    setValidationError(null);
    startProcessingFlow();
  };

  const getFileBadgeAndColor = () => {
    if (!fileMeta) return null;
    switch (fileMeta.extension) {
      case 'pdf':
        return {
          badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
          iconColor: 'text-red-600 dark:text-red-400',
          bgIcon: 'bg-red-500/10 border-red-500/20'
        };
      case 'docx':
        return {
          badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          bgIcon: 'bg-blue-500/10 border-blue-500/20'
        };
      case 'pptx':
        return {
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          bgIcon: 'bg-amber-500/10 border-amber-500/20'
        };
      default:
        return {
          badgeClass: 'bg-brand/10 text-brand border-brand/20',
          iconColor: 'text-brand',
          bgIcon: 'bg-brand/10 border-brand/20'
        };
    }
  };

  const fileStyles = getFileBadgeAndColor();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lecture Material Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Upload Lecture Material
        </h1>
        <p className="text-sm text-text-muted max-w-xl">
          Upload your slide deck, syllabus reading, or lecture document. StudyFlow AI synthesizes a concise revision pack and 5 practice questions.
        </p>
      </div>

      {/* Quick Sample Document Pill */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-brand/10 border border-brand/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand shrink-0" />
          <span className="text-xs font-bold text-text-primary">
            Hackathon Demo Quick Fill:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadSampleDataset(0)}
            className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary font-semibold hover:bg-surface-secondary transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span>Data Structures (PPTX)</span>
          </button>
          <button
            type="button"
            onClick={() => loadSampleDataset(1)}
            className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary font-semibold hover:bg-surface-secondary transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span>CS Raft (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => loadSampleDataset(2)}
            className="text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text-primary font-semibold hover:bg-surface-secondary transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span>Cell Biology (DOCX)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-7 space-y-6">
          {/* Course & Topic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Subject Field (Required) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Subject / Course <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={draftInput.subject}
                onChange={(e) => {
                  setDraftInput((prev) => ({ ...prev, subject: e.target.value }));
                  if (validationError) setValidationError(null);
                }}
                placeholder="e.g. Data Structures"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-subtle"
                required
              />
              <p className="text-[11px] text-text-muted">
                Course or domain context for tailored questions.
              </p>
            </div>

            {/* Optional Topic Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                  Topic <span className="text-text-muted font-normal lowercase">(optional)</span>
                </label>
              </div>
              <input
                type="text"
                value={draftInput.topic}
                onChange={(e) => setDraftInput((prev) => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g. Trees and Graphs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-subtle"
              />
              <p className="text-[11px] text-text-muted">
                Specific chapter, module, or lecture heading.
              </p>
            </div>
          </div>

          {/* Quick Subject Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-text-muted pt-1">
            <span className="font-semibold text-text-muted text-[11px]">Quick tag:</span>
            {['Data Structures', 'Operating Systems', 'Cell Biology', 'Macroeconomics', 'Machine Learning'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDraftInput((prev) => ({ ...prev, subject: tag }))}
                className="px-2 py-0.5 rounded-md bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors text-[11px] font-medium border border-border"
              >
                {tag}
              </button>
            ))}
          </div>

          <hr className="border-border" />

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
                Lecture Material Document <span className="text-red-500 font-bold">*</span>
              </label>
              <span className="text-xs text-text-muted font-medium">
                Max file size: 25 MB
              </span>
            </div>

            {!fileMeta ? (
              /* Empty Dropzone */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 sm:p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center group ${
                  dragActive
                    ? 'border-brand bg-brand/10 ring-4 ring-brand/10 scale-[0.99]'
                    : 'border-border hover:border-brand bg-surface-secondary/40 hover:bg-surface-secondary'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="w-14 h-14 rounded-2xl bg-surface shadow-subtle border border-border flex items-center justify-center mb-3 text-brand group-hover:scale-105 transition-all">
                  <FileUp className="w-7 h-7" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1">
                  Drag and drop your lecture file here
                </h3>
                <p className="text-xs text-text-muted mb-4 max-w-sm leading-relaxed">
                  Upload lecture slides, course reading, or professor notes in standard document formats.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Supported Format Pills */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-text-muted">
                    Supported Formats:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-[10px]">
                    PDF
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[10px]">
                    DOCX
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                    PPTX
                  </span>
                </div>
              </div>
            ) : (
              /* Selected File Card */
              <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-secondary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-subtle ${
                      fileStyles?.bgIcon || 'bg-brand/10 border-brand/20'
                    }`}
                  >
                    <FileText className={`w-6 h-6 ${fileStyles?.iconColor || 'text-brand'}`} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${fileStyles?.badgeClass}`}>
                        {fileMeta.typeLabel}
                      </span>
                      <span className="text-xs text-text-muted font-medium">
                        {fileMeta.sizeFormatted}
                      </span>
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid Document
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary truncate max-w-md">
                      {fileMeta.name}
                    </h4>
                  </div>
                </div>

                {/* Remove / Change Option */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelectedFile}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    Remove File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Validation Error Box */}
        {validationError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-900 dark:text-red-200 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Upload Error: </span>
              <span>{validationError}</span>
            </div>
          </div>
        )}

        {/* Generate Study Pack Prominent Action Bar */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isFormValid}
            leftIcon={<Zap className="w-5 h-5 text-white" />}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className={`w-full py-4 text-base font-bold transition-all ${
              !isFormValid ? 'shadow-none' : 'shadow-glow hover:scale-[1.005]'
            }`}
          >
            Generate Study Pack
          </Button>

          <p className="text-center text-xs text-text-muted">
            {isFormValid
              ? `Ready to synthesize revision notes and 5 quiz questions for "${draftInput.subject}".`
              : 'Attach a valid PDF, DOCX, or PPTX and enter a course subject to proceed.'}
          </p>
        </div>
      </form>
    </div>
  );
};
