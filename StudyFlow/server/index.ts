import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { processDocument } from './services/documentExtractor';
import { generateStudyPack } from './services/aiGenerator';
import { ExtractionErrorResponse } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // Allow Vite frontend during local development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// Configure Multer in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'pptx'];

    if (ext && allowed.includes(ext)) {
      cb(null, true);
    } else {
      const err: any = new Error(`Unsupported file type ".${ext || 'unknown'}". Supported formats: PDF, DOCX, PPTX.`);
      err.code = 'UNSUPPORTED_FORMAT';
      cb(err, false);
    }
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  res.json({
    status: 'ok',
    service: 'StudyFlow AI Engine & Document Pipeline',
    supportedFormats: ['PDF', 'DOCX', 'PPTX'],
    maxFileSize: '25 MB',
    aiProvider: hasGemini ? 'Google Gemini' : hasOpenAI ? 'OpenAI' : 'Grounded Synthesis Engine',
    timestamp: new Date().toISOString()
  });
});

// 1. Document extraction endpoint
app.post('/api/process-document', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const subject = (req.body.subject || '').trim();
    const topic = (req.body.topic || '').trim();

    if (!file) {
      const errResp: ExtractionErrorResponse = {
        error: 'No file uploaded. Please attach a PDF, DOCX, or PPTX lecture file.',
        code: 'MISSING_FILE'
      };
      return res.status(400).json(errResp);
    }

    if (file.size === 0 || file.buffer.length === 0) {
      const errResp: ExtractionErrorResponse = {
        error: `Uploaded file "${file.originalname}" is empty (0 bytes).`,
        code: 'EMPTY_FILE'
      };
      return res.status(400).json(errResp);
    }

    if (!subject) {
      const errResp: ExtractionErrorResponse = {
        error: 'Subject / Course field is required.',
        code: 'EXTRACTION_FAILED',
        details: 'Please specify the subject (e.g. Data Structures, Cell Biology).'
      };
      return res.status(400).json(errResp);
    }

    const result = await processDocument({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subject,
      topic: topic || undefined
    });

    if (!result.extractedText || result.extractedText.length < 5) {
      const errResp: ExtractionErrorResponse = {
        error: `Could not extract readable text from "${file.originalname}". The file may contain scanned non-OCR images or empty slides.`,
        code: 'EXTRACTION_FAILED'
      };
      return res.status(422).json(errResp);
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err: any) {
    console.error('Document processing error:', err);
    const errResp: ExtractionErrorResponse = {
      error: err?.message || 'An unexpected error occurred during document parsing.',
      code: err?.code || 'EXTRACTION_FAILED',
      details: err?.details || String(err)
    };
    return res.status(422).json(errResp);
  }
});

// 2. AI Study Pack Synthesis Endpoint
app.post('/api/generate-study-pack', async (req: Request, res: Response) => {
  try {
    const { extractedText, subject, topic, fileName } = req.body;

    if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length < 5) {
      return res.status(400).json({
        error: 'Extracted lecture material is missing or too short to generate a study pack.',
        code: 'EMPTY_CONTENT'
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return res.status(400).json({
        error: 'Subject / Course name is required.',
        code: 'MISSING_SUBJECT'
      });
    }

    const studyPack = await generateStudyPack({
      extractedText: extractedText.trim(),
      subject: subject.trim(),
      topic: topic?.trim() || undefined,
      fileName: fileName?.trim() || undefined
    });

    return res.status(200).json({
      success: true,
      data: studyPack
    });

  } catch (err: any) {
    console.error('AI Study Pack generation error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate AI study pack.',
      details: String(err)
    });
  }
});

// Centralized error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const errResp: ExtractionErrorResponse = {
        error: 'File size exceeds the 25 MB maximum upload limit.',
        code: 'SIZE_EXCEEDED'
      };
      return res.status(413).json(errResp);
    }
  }

  const errResp: ExtractionErrorResponse = {
    error: err?.message || 'Internal server error.',
    code: err?.code || 'EXTRACTION_FAILED'
  };
  return res.status(400).json(errResp);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 StudyFlow AI Backend Engine running on http://localhost:${PORT}`);
});

export { app, server };
