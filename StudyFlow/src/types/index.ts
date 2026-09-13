export type AppScreen = 'workspace' | 'upload' | 'processing' | 'notes' | 'graph' | 'quiz' | 'export';

export type SourceType = 'text' | 'file' | 'url';
export type FocusArea = 'comprehensive' | 'exam_prep' | 'quick_summary';

export interface MaterialInput {
  id: string;
  title: string;
  subject: string;
  sourceType: SourceType;
  content: string;
  fileName?: string;
  fileSize?: string;
  url?: string;
  wordCount: number;
  readingTimeMinutes: number;
  focusArea: FocusArea;
  createdAt: string;
}

export type ConceptImportance = 'high-yield' | 'core' | 'definition';

export interface KeyConcept {
  id: string;
  title: string;
  importance: ConceptImportance;
  summary: string;
  bulletPoints: string[];
  keyTakeaway?: string;
}

export interface FormulaDefinition {
  id: string;
  term: string;
  type: 'formula' | 'term' | 'principle';
  definition: string;
  formulaOrSyntax?: string;
  contextOrUsage?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface RevisionNotes {
  id: string;
  title: string;
  subject: string;
  generatedDate: string;
  estimatedStudyTimeMinutes: number;
  executiveSummary: string;
  coreConcepts: KeyConcept[];
  cheatSheet: FormulaDefinition[];
  flashcards: Flashcard[];
  highYieldExamTips: string[];
}

export interface QuizOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  prompt: string;
  options: QuizOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  topicTag: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  contextSnippet?: string;
}

export interface QuizAttempt {
  sessionId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  selectedAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  completedAt: string;
  masteryLevel: 'Mastered' | 'Proficient' | 'Needs Review';
}

export interface StudyFlowSession {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  material: MaterialInput;
  notes: RevisionNotes;
  quiz: QuizQuestion[];
  latestAttempt?: QuizAttempt;
  status: 'ready' | 'processing' | 'completed';
}

export type ProcessingStageId =
  | 'upload_received'
  | 'reading_material'
  | 'understanding_concepts'
  | 'creating_notes'
  | 'generating_quiz'
  | 'pack_ready';

export interface ProcessingStep {
  id: number;
  stageId: ProcessingStageId;
  label: string;
  description: string;
  detail?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ProcessingError {
  title: string;
  message: string;
  stageId?: ProcessingStageId;
  technicalDetails?: string;
}

export interface VaultNote {
  id: string;
  title: string;
  folderPath: string[]; // e.g. ["Data Structures", "Trees"]
  content: string; // Markdown text containing [[Wiki Links]]
  sessionId?: string; // Associated StudyFlowSession if generated or linked to a quiz
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
}

export interface BacklinkReference {
  sourceNoteId: string;
  sourceNoteTitle: string;
  sourceFolderPath: string[];
  snippet: string;
}

export interface WikiLinkMatch {
  raw: string;
  targetTitle: string;
  exists: boolean;
  targetNoteId?: string;
}

