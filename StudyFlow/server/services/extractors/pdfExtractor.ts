import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface PdfExtractionOutput {
  text: string;
  pageCount: number;
  metadata?: any;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<PdfExtractionOutput> {
  // 1. Verify minimal buffer and PDF magic number
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF file buffer is empty (0 bytes).');
  }

  const header = buffer.toString('utf-8', 0, Math.min(buffer.length, 10));
  if (!header.includes('%PDF-')) {
    throw new Error('Invalid or corrupted PDF: File does not start with a valid %PDF- header.');
  }

  try {
    const data = await pdfParse(buffer, {
      pagerender: function (pageData: any) {
        return pageData.getTextContent().then(function (textContent: any) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        });
      }
    });

    const cleanText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      text: cleanText,
      pageCount: data.numpages || 1,
      metadata: data.info || {}
    };
  } catch (err: any) {
    if (err?.message?.includes('Password') || err?.name === 'PasswordException') {
      throw new Error('The uploaded PDF is password-protected and cannot be parsed.');
    }
    throw new Error(`Failed to parse PDF document: ${err?.message || 'Corrupted or unreadable format.'}`);
  }
}
