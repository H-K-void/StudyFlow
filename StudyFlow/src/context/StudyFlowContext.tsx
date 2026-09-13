import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppScreen,
  StudyFlowSession,
  MaterialInput,
  QuizAttempt,
  ProcessingStep,
  ProcessingError,
  FocusArea,
  SourceType,
  KeyConcept,
  FormulaDefinition,
  Flashcard,
  QuizQuestion,
  QuizOption,
  VaultNote,
  BacklinkReference
} from '../types';
import { SAMPLE_SESSIONS } from '../data/sampleData';
import { INITIAL_VAULT_NOTES } from '../data/vaultData';
import { calculateReadingTime, calculateWordCount } from '../utils/helpers';
import { convertSessionToMarkdownWithWikiLinks, findNoteByTitle, normalizeNoteTitle } from '../utils/wikiLinks';
import {
  uploadAndExtractDocument,
  generateAiStudyPack,
  DocumentProcessingResult,
  AiStudyPackResponse
} from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message?: string;
}

export interface UploadFileMeta {
  file: File | null;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  extension: 'pdf' | 'docx' | 'pptx' | string;
  typeLabel: string;
}

interface StudyFlowContextType {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  sessions: StudyFlowSession[];
  activeSession: StudyFlowSession | null;
  setActiveSession: (session: StudyFlowSession | null) => void;
  loadSampleSession: (sessionId: string) => void;

  // Vault / Knowledge Base State
  vaultNotes: VaultNote[];
  activeNoteId: string | null;
  activeNote: VaultNote | null;
  openVaultNote: (noteId: string) => void;
  openOrCreateVaultNote: (title: string, folderPath?: string[]) => void;
  createVaultNote: (noteData: Partial<VaultNote>) => VaultNote;
  updateVaultNoteContent: (id: string, content: string, title?: string) => void;
  deleteVaultNote: (id: string) => void;
  navigationHistory: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  navigateBack: () => void;
  navigateForward: () => void;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (folderKey: string) => void;

  // Upload Draft
  draftInput: {
    subject: string;
    topic: string;
    fileMeta: UploadFileMeta | null;
    focusArea: FocusArea;
  };
  setDraftInput: React.Dispatch<React.SetStateAction<{
    subject: string;
    topic: string;
    fileMeta: UploadFileMeta | null;
    focusArea: FocusArea;
  }>>;
  setSelectedFile: (file: File | null) => { isValid: boolean; error?: string };
  clearSelectedFile: () => void;
  startProcessingFlow: (overrideInput?: { subject?: string; topic?: string; fileMeta?: UploadFileMeta | null }) => Promise<void>;
  retryProcessing: () => void;
  processingSteps: ProcessingStep[];
  isProcessing: boolean;
  cancelProcessing: () => void;
  processingError: ProcessingError | null;
  latestExtractionResult: DocumentProcessingResult | null;
  // Quiz State
  quizAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  setQuizAnswer: (questionNum: number, optionId: 'A' | 'B' | 'C' | 'D') => void;
  submitQuizAttempt: () => QuizAttempt | null;
  resetQuizState: () => void;
  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  // Modal control
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // Quick flow restart
  startNewFlow: () => void;
}

const StudyFlowContext = createContext<StudyFlowContextType | undefined>(undefined);

const INITIAL_PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 1,
    stageId: 'upload_received',
    label: 'Upload received',
    description: 'Validating document package integrity and parameters',
    status: 'pending'
  },
  {
    id: 2,
    stageId: 'reading_material',
    label: 'Reading lecture material',
    description: 'Extracting clean readable text, slides, and structural headings',
    status: 'pending'
  },
  {
    id: 3,
    stageId: 'understanding_concepts',
    label: 'Understanding key concepts',
    description: 'Analyzing core principles, terminology, and testable invariants',
    status: 'pending'
  },
  {
    id: 4,
    stageId: 'creating_notes',
    label: 'Creating revision notes',
    description: 'Structuring executive summary, concept cards, and cheat sheets',
    status: 'pending'
  },
  {
    id: 5,
    stageId: 'generating_quiz',
    label: 'Generating practice quiz',
    description: 'Formulating 5 multiple-choice questions with 4 options and rationales',
    status: 'pending'
  },
  {
    id: 6,
    stageId: 'pack_ready',
    label: 'Study pack ready',
    description: 'Packaging revision guide and diagnostic knowledge check',
    status: 'pending'
  }
];

export const StudyFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('workspace');
  const [sessions, setSessions] = useState<StudyFlowSession[]>(() => {
    const saved = localStorage.getItem('studyflow_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sessions', e);
      }
    }
    return SAMPLE_SESSIONS;
  });

  const [activeSession, setActiveSession] = useState<StudyFlowSession | null>(SAMPLE_SESSIONS[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [latestExtractionResult, setLatestExtractionResult] = useState<DocumentProcessingResult | null>(null);

  // Theme State: Dark mode is default
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('studyflow_theme');
    if (saved === 'light') return 'light';
    return 'dark'; // Dark theme default
  });

  useEffect(() => {
    localStorage.setItem('studyflow_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Vault / Knowledge Base State
  const [vaultNotes, setVaultNotes] = useState<VaultNote[]>(() => {
    const saved = localStorage.getItem('studyflow_vault_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved vault notes', e);
      }
    }
    return INITIAL_VAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return INITIAL_VAULT_NOTES[0]?.id || null;
  });

  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    const initialId = INITIAL_VAULT_NOTES[0]?.id;
    return initialId ? [initialId] : [];
  });
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'Data Structures': true,
    'Data Structures/Trees': true,
    'Data Structures/Graphs': true,
    'Distributed Systems': true,
    'Distributed Systems/Consensus': true,
    'Biology': true,
    'Biology/Cellular Biology': true
  });

  useEffect(() => {
    localStorage.setItem('studyflow_vault_notes', JSON.stringify(vaultNotes));
  }, [vaultNotes]);

  const activeNote = React.useMemo(() => {
    return vaultNotes.find((n) => n.id === activeNoteId) || vaultNotes[0] || null;
  }, [vaultNotes, activeNoteId]);

  // Keep activeSession in sync when activeNote has a sessionId
  useEffect(() => {
    if (activeNote?.sessionId) {
      const match = sessions.find((s) => s.id === activeNote.sessionId);
      if (match && match.id !== activeSession?.id) {
        setActiveSession(match);
      }
    }
  }, [activeNote, sessions]);

  const openVaultNote = (noteId: string) => {
    const target = vaultNotes.find((n) => n.id === noteId);
    if (!target) return;

    setActiveNoteId(target.id);
    if (target.sessionId) {
      const matchSession = sessions.find((s) => s.id === target.sessionId);
      if (matchSession) {
        setActiveSession(matchSession);
      }
    }

    // Push to navigation history
    setNavigationHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      if (sliced[sliced.length - 1] === noteId) return prev;
      const next = [...sliced, noteId];
      setHistoryIndex(next.length - 1);
      return next;
    });
  };

  const createVaultNote = (noteData: Partial<VaultNote>): VaultNote => {
    const newId = 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newNote: VaultNote = {
      id: newId,
      title: noteData.title || 'Untitled Note',
      folderPath: noteData.folderPath && noteData.folderPath.length > 0 ? noteData.folderPath : ['General'],
      content: noteData.content || `# ${noteData.title || 'Untitled Note'}\n\nStart writing notes or link to other concepts using \`[[Concept Name]]\`.\n`,
      sessionId: noteData.sessionId,
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVaultNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newId);

    // Expand folder path
    if (newNote.folderPath.length > 0) {
      let currentPath = '';
      const newExpanded: Record<string, boolean> = {};
      newNote.folderPath.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        newExpanded[currentPath] = true;
      });
      setExpandedFolders((prev) => ({ ...prev, ...newExpanded }));
    }

    setNavigationHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const next = [...sliced, newId];
      setHistoryIndex(next.length - 1);
      return next;
    });

    addToast({
      type: 'success',
      title: 'Note Created',
      message: `Created "[[${newNote.title}]]" in ${newNote.folderPath.join('/') || 'Root'}.`
    });

    return newNote;
  };

  const openOrCreateVaultNote = (title: string, folderPath?: string[]) => {
    const match = findNoteByTitle(title, vaultNotes);
    if (match) {
      openVaultNote(match.id);
    } else {
      createVaultNote({
        title,
        folderPath: folderPath || (activeNote?.folderPath ? [...activeNote.folderPath] : ['Concepts']),
        content: `# ${title}\n\nInitial revision notes for \`[[${title}]]\`.\n\n## References\n- Linked from [[${activeNote?.title || 'Study Vault'}]]\n`
      });
    }
  };

  const updateVaultNoteContent = (id: string, content: string, title?: string) => {
    setVaultNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              content,
              title: title || n.title,
              updatedAt: new Date().toISOString()
            }
          : n
      )
    );
  };

  const deleteVaultNote = (id: string) => {
    setVaultNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = vaultNotes.filter((n) => n.id !== id);
      if (remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
      } else {
        setActiveNoteId(null);
      }
    }
    addToast({
      type: 'info',
      title: 'Note Deleted',
      message: 'Note removed from vault.'
    });
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;

  const navigateBack = () => {
    if (canGoBack) {
      const prevIdx = historyIndex - 1;
      const targetId = navigationHistory[prevIdx];
      setHistoryIndex(prevIdx);
      if (targetId) {
        setActiveNoteId(targetId);
        const match = vaultNotes.find((n) => n.id === targetId);
        if (match?.sessionId) {
          const matchSession = sessions.find((s) => s.id === match.sessionId);
          if (matchSession) setActiveSession(matchSession);
        }
      }
    }
  };

  const navigateForward = () => {
    if (canGoForward) {
      const nextIdx = historyIndex + 1;
      const targetId = navigationHistory[nextIdx];
      setHistoryIndex(nextIdx);
      if (targetId) {
        setActiveNoteId(targetId);
        const match = vaultNotes.find((n) => n.id === targetId);
        if (match?.sessionId) {
          const matchSession = sessions.find((s) => s.id === match.sessionId);
          if (matchSession) setActiveSession(matchSession);
        }
      }
    }
  };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !(prev[folderKey] ?? true)
    }));
  };

  // Draft Upload Input (Kept completely intact across retries and cancellations)
  const [draftInput, setDraftInput] = useState<{
    subject: string;
    topic: string;
    fileMeta: UploadFileMeta | null;
    focusArea: FocusArea;
  }>({
    subject: '',
    topic: '',
    fileMeta: null,
    focusArea: 'exam_prep'
  });

  // Processing steps & error state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(INITIAL_PROCESSING_STEPS);
  const [processingError, setProcessingError] = useState<ProcessingError | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('studyflow_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const setSelectedFile = (file: File | null): { isValid: boolean; error?: string } => {
    if (!file) {
      setDraftInput((prev) => ({ ...prev, fileMeta: null }));
      return { isValid: false };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: `"${file.name}" is empty (0 bytes). Please upload a valid document.`
      };
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        isValid: false,
        error: `"${file.name}" exceeds the 25 MB limit (${formatFileSize(file.size)}).`
      };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['pdf', 'docx', 'pptx'];

    if (!validExtensions.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported format ".${ext || 'unknown'}". Only PDF, DOCX, and PPTX files are supported.`
      };
    }

    let typeLabel = 'PDF Document';
    if (ext === 'docx') typeLabel = 'Word Document (DOCX)';
    if (ext === 'pptx') typeLabel = 'PowerPoint Slides (PPTX)';

    const meta: UploadFileMeta = {
      file,
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      sizeBytes: file.size,
      extension: ext as any,
      typeLabel
    };

    setDraftInput((prev) => ({
      ...prev,
      fileMeta: meta
    }));

    return { isValid: true };
  };

  const clearSelectedFile = () => {
    setDraftInput((prev) => ({ ...prev, fileMeta: null }));
  };

  const loadSampleSession = (sessionId: string) => {
    const match = sessions.find((s) => s.id === sessionId) || SAMPLE_SESSIONS.find((s) => s.id === sessionId);
    if (match) {
      setActiveSession(match);
      setQuizAnswers(match.latestAttempt?.selectedAnswers || {});
      const vaultMatch = vaultNotes.find((n) => n.sessionId === sessionId);
      if (vaultMatch) {
        setActiveNoteId(vaultMatch.id);
      }
      setCurrentScreen('notes');
      addToast({
        type: 'info',
        title: 'Study Pack Loaded',
        message: `"${match.title}" is ready for revision.`
      });
    }
  };

  const startNewFlow = () => {
    setDraftInput({
      subject: '',
      topic: '',
      fileMeta: null,
      focusArea: 'exam_prep'
    });
    setProcessingError(null);
    setQuizAnswers({});
    setCurrentScreen('upload');
  };

  const cancelProcessing = () => {
    setIsProcessing(false);
    setProcessingError(null);
    setProcessingSteps(INITIAL_PROCESSING_STEPS);
    setCurrentScreen('upload');
    addToast({
      type: 'warning',
      title: 'Synthesis Cancelled',
      message: 'Returned to upload screen. Your file and subject remain saved.'
    });
  };

  const transformAiResponseToSession = (
    aiPack: AiStudyPackResponse,
    subject: string,
    topic: string | undefined,
    rawText: string,
    fileMeta: UploadFileMeta | null
  ): StudyFlowSession => {
    const wordCount = calculateWordCount(rawText);
    const readingTime = calculateReadingTime(wordCount);
    const sessionId = 'session-' + Date.now();

    const coreConcepts: KeyConcept[] = aiPack.sections.map((sec, idx) => ({
      id: `c-${idx + 1}`,
      title: sec.heading,
      importance: idx === 0 || idx === 1 ? 'high-yield' : 'core',
      summary: sec.points[0] || 'Core theoretical principle.',
      bulletPoints: sec.points,
      keyTakeaway: sec.points[sec.points.length - 1] || undefined
    }));

    const cheatSheet: FormulaDefinition[] = aiPack.keyTerms.map((kt, idx) => ({
      id: `cs-${idx + 1}`,
      term: kt.term,
      type: kt.definition.includes('=') || kt.definition.includes('O(') ? 'formula' : 'term',
      definition: kt.definition,
      formulaOrSyntax: kt.definition.includes('=') || kt.definition.includes('O(') ? kt.definition : undefined,
      contextOrUsage: `Key concept emphasized in ${subject} revision.`
    }));

    const flashcards: Flashcard[] = aiPack.keyTerms.map((kt, idx) => ({
      id: `fc-${idx + 1}`,
      front: `What is ${kt.term}?`,
      back: kt.definition,
      category: subject
    }));

    if (flashcards.length === 0 && coreConcepts.length > 0) {
      coreConcepts.slice(0, 4).forEach((c, idx) => {
        flashcards.push({
          id: `fc-concept-${idx + 1}`,
          front: `Explain the key principle of ${c.title}`,
          back: c.bulletPoints.join(' • '),
          category: subject
        });
      });
    }

    const highYieldExamTips: string[] = coreConcepts.slice(0, 3).map(
      (c) => `Exam focus: Master "${c.title}" - ${c.bulletPoints[0] || c.summary}`
    );

    const optionLetterMap: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

    const quiz: QuizQuestion[] = aiPack.quiz.map((q, idx) => {
      const correctLetter = optionLetterMap[q.correctAnswer] || 'A';

      const options: QuizOption[] = q.options.map((optText, optIdx) => {
        const letter = optionLetterMap[optIdx] || 'A';
        const isCorrect = optIdx === q.correctAnswer;
        return {
          id: letter,
          text: optText,
          explanation: isCorrect
            ? q.explanation
            : `Incorrect. This statement does not reflect the principles outlined in the source lecture.`
        };
      });

      return {
        id: `q-${idx + 1}`,
        questionNumber: idx + 1,
        prompt: q.question,
        options,
        correctOptionId: correctLetter,
        topicTag: coreConcepts[idx % coreConcepts.length]?.title || subject,
        difficulty: idx === 0 || idx === 1 ? 'Foundation' : idx === 4 ? 'Advanced' : 'Intermediate'
      };
    });

    const sessionTitle = aiPack.title || (topic ? `${subject}: ${topic}` : `${subject} Revision Guide`);

    return {
      id: sessionId,
      title: sessionTitle,
      subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ready',
      material: {
        id: 'mat-' + Date.now(),
        title: sessionTitle,
        subject,
        sourceType: 'file',
        content: rawText,
        fileName: fileMeta?.name || `${subject}_Lecture_Material.pdf`,
        fileSize: fileMeta?.sizeFormatted || '3.5 MB',
        wordCount,
        readingTimeMinutes: readingTime,
        focusArea: draftInput.focusArea,
        createdAt: new Date().toISOString()
      },
      notes: {
        id: 'notes-' + Date.now(),
        title: sessionTitle,
        subject,
        generatedDate: new Date().toISOString(),
        estimatedStudyTimeMinutes: Math.max(5, Math.ceil(wordCount / 100)),
        executiveSummary: aiPack.summary,
        coreConcepts,
        cheatSheet,
        flashcards,
        highYieldExamTips
      },
      quiz
    };
  };

  const startProcessingFlow = async (overrideInput?: { subject?: string; topic?: string; fileMeta?: UploadFileMeta | null }) => {
    const subject = overrideInput?.subject || draftInput.subject || 'General Studies';
    const topic = overrideInput?.topic || draftInput.topic || '';
    const fileMeta = overrideInput?.fileMeta || draftInput.fileMeta;

    setIsProcessing(true);
    setProcessingError(null);
    setCurrentScreen('processing');

    // Stage 1: Upload received (in_progress)
    setProcessingSteps(
      INITIAL_PROCESSING_STEPS.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'in_progress' : 'pending'
      }))
    );

    await new Promise((r) => setTimeout(r, 450));

    // Stage 1: Upload received (completed) -> Stage 2: Reading lecture material (in_progress)
    setProcessingSteps((prev) => [
      { ...prev[0], status: 'completed' },
      { ...prev[1], status: 'in_progress' },
      prev[2],
      prev[3],
      prev[4],
      prev[5]
    ]);

    let rawExtractedText = '';

    // Stage 2: Server Document Extraction
    if (fileMeta?.file) {
      try {
        const extractedData = await uploadAndExtractDocument({
          file: fileMeta.file,
          subject,
          topic: topic || undefined
        });
        setLatestExtractionResult(extractedData);
        rawExtractedText = extractedData.extractedText;
      } catch (err: any) {
        console.error('Extraction failure:', err);
        setIsProcessing(false);
        setProcessingSteps((prev) => [
          prev[0],
          { ...prev[1], status: 'failed', detail: err?.message || 'Extraction failed' },
          prev[2],
          prev[3],
          prev[4],
          prev[5]
        ]);
        setProcessingError({
          title: 'Document Extraction Error',
          message: err?.message || 'Could not extract readable text from the uploaded lecture file.',
          stageId: 'reading_material',
          technicalDetails: err?.details || String(err)
        });
        return;
      }
    } else {
      const lowerSub = subject.toLowerCase();
      const sampleMatch = SAMPLE_SESSIONS.find(
        (s) => s.subject.toLowerCase().includes(lowerSub) || s.title.toLowerCase().includes(lowerSub)
      ) || SAMPLE_SESSIONS[0];
      rawExtractedText = sampleMatch.material.content;
      await new Promise((r) => setTimeout(r, 400));
    }

    // Stage 2 completed -> Stage 3: Understanding key concepts (in_progress)
    setProcessingSteps((prev) => [
      prev[0],
      { ...prev[1], status: 'completed' },
      { ...prev[2], status: 'in_progress' },
      prev[3],
      prev[4],
      prev[5]
    ]);

    await new Promise((r) => setTimeout(r, 600));

    // Stage 3 completed -> Stage 4: Creating revision notes (in_progress)
    setProcessingSteps((prev) => [
      prev[0],
      prev[1],
      { ...prev[2], status: 'completed' },
      { ...prev[3], status: 'in_progress' },
      prev[4],
      prev[5]
    ]);

    // Stage 4 & 5: AI Study Pack Generation
    let aiPack: AiStudyPackResponse;
    try {
      aiPack = await generateAiStudyPack({
        extractedText: rawExtractedText,
        subject,
        topic: topic || undefined,
        fileName: fileMeta?.name
      });
    } catch (err: any) {
      console.warn('AI generation error:', err);
      setIsProcessing(false);
      setProcessingSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], status: 'failed' },
        prev[4],
        prev[5]
      ]);
      setProcessingError({
        title: 'Study Pack Synthesis Failure',
        message: err?.message || 'AI service was unable to structure revision notes from the extracted content.',
        stageId: 'creating_notes',
        technicalDetails: String(err)
      });
      return;
    }

    // Stage 4 completed -> Stage 5: Generating practice quiz (in_progress)
    setProcessingSteps((prev) => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], status: 'completed' },
      { ...prev[4], status: 'in_progress' },
      prev[5]
    ]);

    await new Promise((r) => setTimeout(r, 550));

    // Stage 5 completed -> Stage 6: Study pack ready (in_progress / completed)
    setProcessingSteps((prev) => [
      prev[0],
      prev[1],
      prev[2],
      prev[3],
      { ...prev[4], status: 'completed' },
      { ...prev[5], status: 'completed' }
    ]);

    // Assemble full study session
    const newSession = transformAiResponseToSession(aiPack, subject, topic, rawExtractedText, fileMeta);

    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    setActiveSession(newSession);
    setQuizAnswers({});

    // Also automatically register new note in the Obsidian Knowledge Vault
    const noteId = 'vault-' + newSession.id;
    const noteContent = convertSessionToMarkdownWithWikiLinks(newSession);
    const newVaultNote: VaultNote = {
      id: noteId,
      title: newSession.title,
      folderPath: [newSession.subject, topic || 'Lectures'].filter(Boolean),
      content: noteContent,
      sessionId: newSession.id,
      tags: [newSession.subject.toLowerCase(), 'study-pack', 'exam-prep'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVaultNotes((prev) => [newVaultNote, ...prev.filter((n) => n.id !== noteId)]);
    setActiveNoteId(noteId);
    setNavigationHistory((prev) => [noteId, ...prev]);
    setHistoryIndex(0);

    // Intentional celebration moment before automatic navigation
    await new Promise((r) => setTimeout(r, 700));

    setIsProcessing(false);
    setCurrentScreen('notes');

    addToast({
      type: 'success',
      title: 'Study Pack Ready!',
      message: `Generated revision notes and 5-question quiz for "${newSession.title}".`
    });
  };

  const retryProcessing = () => {
    setProcessingError(null);
    startProcessingFlow();
  };

  const setQuizAnswer = (questionNum: number, optionId: 'A' | 'B' | 'C' | 'D') => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionNum]: optionId
    }));
  };

  const resetQuizState = () => {
    setQuizAnswers({});
    if (activeSession) {
      const updated = { ...activeSession, latestAttempt: undefined };
      setActiveSession(updated);
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    }
  };

  const submitQuizAttempt = (): QuizAttempt | null => {
    if (!activeSession || !activeSession.quiz) return null;

    const total = activeSession.quiz.length;
    let score = 0;

    activeSession.quiz.forEach((q) => {
      if (quizAnswers[q.questionNumber] === q.correctOptionId) {
        score += 1;
      }
    });

    const percentage = Math.round((score / total) * 100);
    const masteryLevel: 'Mastered' | 'Proficient' | 'Needs Review' =
      percentage >= 80 ? 'Mastered' : percentage >= 60 ? 'Proficient' : 'Needs Review';

    const attempt: QuizAttempt = {
      sessionId: activeSession.id,
      score,
      totalQuestions: total,
      percentage,
      timeSpentSeconds: 90,
      selectedAnswers: { ...quizAnswers },
      completedAt: new Date().toISOString(),
      masteryLevel
    };

    const updatedSession: StudyFlowSession = {
      ...activeSession,
      latestAttempt: attempt,
      updatedAt: new Date().toISOString()
    };

    setActiveSession(updatedSession);
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));

    return attempt;
  };

  return (
    <StudyFlowContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        sessions,
        activeSession,
        setActiveSession,
        loadSampleSession,
        // Vault / Knowledge Base
        vaultNotes,
        activeNoteId,
        activeNote,
        openVaultNote,
        openOrCreateVaultNote,
        createVaultNote,
        updateVaultNoteContent,
        deleteVaultNote,
        navigationHistory,
        historyIndex,
        canGoBack,
        canGoForward,
        navigateBack,
        navigateForward,
        expandedFolders,
        toggleFolder,
        // Upload Draft
        draftInput,
        setDraftInput,
        setSelectedFile,
        clearSelectedFile,
        startProcessingFlow,
        retryProcessing,
        processingSteps,
        isProcessing,
        cancelProcessing,
        processingError,
        latestExtractionResult,
        quizAnswers,
        setQuizAnswer,
        submitQuizAttempt,
        resetQuizState,
        toasts,
        addToast,
        removeToast,
        isExportModalOpen,
        setIsExportModalOpen,
        theme,
        toggleTheme,
        startNewFlow
      }}
    >
      {children}
    </StudyFlowContext.Provider>
  );
};

export const useStudyFlow = () => {
  const context = useContext(StudyFlowContext);
  if (!context) {
    throw new Error('useStudyFlow must be used within a StudyFlowProvider');
  }
  return context;
};

