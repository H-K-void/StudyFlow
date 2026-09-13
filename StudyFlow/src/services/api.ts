export interface DocumentMetadata {
  charCount: number;
  wordCount: number;
  pageCount?: number;
  slideCount?: number;
  paragraphCount?: number;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  extractedAt: string;
  mimeType?: string;
  headingsFound?: string[];
}

export interface DocumentProcessingResult {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx';
  subject: string;
  topic?: string;
  extractedText: string;
  metadata: DocumentMetadata;
}

export interface ApiProcessDocumentParams {
  file: File;
  subject: string;
  topic?: string;
}

export interface AiGeneratedSection {
  heading: string;
  points: string[];
}

export interface AiGeneratedKeyTerm {
  term: string;
  definition: string;
}

export interface AiGeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AiStudyPackResponse {
  title: string;
  subject: string;
  summary: string;
  sections: AiGeneratedSection[];
  keyTerms: AiGeneratedKeyTerm[];
  quiz: AiGeneratedQuizQuestion[];
}

export interface GenerateStudyPackParams {
  extractedText: string;
  subject: string;
  topic?: string;
  fileName?: string;
}

export async function uploadAndExtractDocument(params: ApiProcessDocumentParams): Promise<DocumentProcessingResult> {
  const { file, subject, topic } = params;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', subject);
  if (topic) {
    formData.append('topic', topic);
  }

  const response = await fetch('/api/process-document', {
    method: 'POST',
    body: formData
  });

  const json = await response.json();

  if (!response.ok) {
    const message = json.error || json.details || `Server returned error (${response.status})`;
    throw new Error(message);
  }

  return json.data as DocumentProcessingResult;
}

export async function generateAiStudyPack(params: GenerateStudyPackParams): Promise<AiStudyPackResponse> {
  const response = await fetch('/api/generate-study-pack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const json = await response.json();

  if (!response.ok) {
    const message = json.error || json.details || `AI Generation failed (${response.status})`;
    throw new Error(message);
  }

  return json.data as AiStudyPackResponse;
}
