export type SupportedFileType = 'pdf' | 'docx' | 'pptx';

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
  fileType: SupportedFileType;
  subject: string;
  topic?: string;
  extractedText: string;
  metadata: DocumentMetadata;
}

export type ExtractionErrorCode =
  | 'UNSUPPORTED_FORMAT'
  | 'CORRUPTED_FILE'
  | 'EMPTY_FILE'
  | 'SIZE_EXCEEDED'
  | 'EXTRACTION_FAILED'
  | 'MISSING_FILE';

export interface ExtractionErrorResponse {
  error: string;
  code: ExtractionErrorCode;
  details?: string;
}
