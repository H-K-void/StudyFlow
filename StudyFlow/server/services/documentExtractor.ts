import {
  DocumentProcessingResult,
  DocumentMetadata,
  SupportedFileType
} from '../types';
import { extractTextFromPdf } from './extractors/pdfExtractor';
import { extractTextFromDocx } from './extractors/docxExtractor';
import { extractTextFromPptx } from './extractors/pptxExtractor';

function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface ProcessDocumentOptions {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  subject: string;
  topic?: string;
}

export async function processDocument(options: ProcessDocumentOptions): Promise<DocumentProcessingResult> {
  const { buffer, fileName, mimeType, subject, topic } = options;

  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty (0 bytes).');
  }

  // Determine file type from extension
  const ext = fileName.split('.').pop()?.toLowerCase() as SupportedFileType | undefined;

  if (!ext || !['pdf', 'docx', 'pptx'].includes(ext)) {
    throw new Error(`Unsupported file type ".${ext || 'unknown'}". Supported formats: PDF, DOCX, PPTX.`);
  }

  let extractedText = '';
  let pageCount: number | undefined;
  let slideCount: number | undefined;
  let paragraphCount: number | undefined;
  let headingsFound: string[] = [];

  switch (ext) {
    case 'pdf': {
      const res = await extractTextFromPdf(buffer);
      extractedText = res.text;
      pageCount = res.pageCount;
      break;
    }
    case 'docx': {
      const res = await extractTextFromDocx(buffer);
      extractedText = res.text;
      paragraphCount = res.paragraphCount;
      headingsFound = res.headingsFound;
      break;
    }
    case 'pptx': {
      const res = await extractTextFromPptx(buffer);
      extractedText = res.text;
      slideCount = res.slideCount;
      headingsFound = res.headingsFound;
      break;
    }
  }

  const wordCount = calculateWordCount(extractedText);
  const charCount = extractedText.length;

  const metadata: DocumentMetadata = {
    charCount,
    wordCount,
    pageCount,
    slideCount,
    paragraphCount,
    fileSizeBytes: buffer.length,
    fileSizeFormatted: formatFileSize(buffer.length),
    extractedAt: new Date().toISOString(),
    mimeType,
    headingsFound: headingsFound.length > 0 ? headingsFound : undefined
  };

  const normalizedResult: DocumentProcessingResult = {
    fileName,
    fileType: ext,
    subject: subject.trim(),
    topic: topic?.trim() || undefined,
    extractedText,
    metadata
  };

  return normalizedResult;
}
