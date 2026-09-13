import mammoth from 'mammoth';

export interface DocxExtractionOutput {
  text: string;
  paragraphCount: number;
  headingsFound: string[];
}

export async function extractTextFromDocx(buffer: Buffer): Promise<DocxExtractionOutput> {
  if (!buffer || buffer.length === 0) {
    throw new Error('DOCX file buffer is empty (0 bytes).');
  }

  // Check PK ZIP magic bytes
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error('Invalid or corrupted DOCX: File is not a valid OpenXML document package.');
  }

  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    const text = (rawResult.value || '').trim();

    if (!text) {
      throw new Error('DOCX document was successfully opened but contains no readable textual content.');
    }

    // Identify rough paragraph count & headings
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const headings: string[] = [];

    // Also extract html to discover explicit headings if available
    try {
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const headingMatches = htmlResult.value.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
      if (headingMatches) {
        headingMatches.forEach((h) => {
          const cleanH = h.replace(/<[^>]+>/g, '').trim();
          if (cleanH) headings.push(cleanH);
        });
      }
    } catch {
      // Non-critical, fallback to line discovery
    }

    return {
      text,
      paragraphCount: Math.max(1, paragraphs.length),
      headingsFound: headings.slice(0, 10)
    };
  } catch (err: any) {
    throw new Error(`Failed to extract text from Word DOCX file: ${err?.message || 'Corrupted archive or invalid document structure.'}`);
  }
}
