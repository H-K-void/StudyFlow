import AdmZip from 'adm-zip';

export interface PptxExtractionOutput {
  text: string;
  slideCount: number;
  headingsFound: string[];
}

export async function extractTextFromPptx(buffer: Buffer): Promise<PptxExtractionOutput> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PPTX file buffer is empty (0 bytes).');
  }

  // Check PK ZIP magic bytes
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error('Invalid or corrupted PPTX: File is not a valid PowerPoint presentation archive.');
  }

  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Filter and sort slide xml files: ppt/slides/slide1.xml, slide2.xml, etc.
    const slideEntries = zipEntries
      .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.entryName))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.entryName.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });

    if (slideEntries.length === 0) {
      throw new Error('PPTX presentation contains no slide entries or is in an unsupported presentation format.');
    }

    const slideTexts: string[] = [];
    const headings: string[] = [];

    slideEntries.forEach((entry, idx) => {
      const xml = entry.getData().toString('utf8');

      // Extract paragraphs (<a:p>...</a:p>)
      const paragraphMatches = xml.match(/<a:p[\s>][\s\S]*?<\/a:p>/gi) || [];
      const paragraphsInSlide: string[] = [];

      for (const pXml of paragraphMatches) {
        // Extract all text tags within paragraph: <a:t>text</a:t>
        const textMatches = pXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi);
        if (textMatches && textMatches.length > 0) {
          const pText = textMatches
            .map((t) => t.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean)
            .join(' ');

          if (pText) {
            paragraphsInSlide.push(pText);
          }
        }
      }

      if (paragraphsInSlide.length > 0) {
        const slideTitle = paragraphsInSlide[0];
        if (slideTitle && slideTitle.length < 100 && !headings.includes(slideTitle)) {
          headings.push(slideTitle);
        }

        slideTexts.push(`[Slide ${idx + 1}]\n` + paragraphsInSlide.join('\n'));
      }
    });

    const fullText = slideTexts.join('\n\n').trim();

    if (!fullText) {
      throw new Error('PPTX presentation was opened but contains no readable textual content in slides (may contain only images or flattened graphics).');
    }

    return {
      text: fullText,
      slideCount: slideEntries.length,
      headingsFound: headings.slice(0, 10)
    };
  } catch (err: any) {
    if (err?.message?.includes('PPTX')) {
      throw err;
    }
    throw new Error(`Failed to extract text from PowerPoint PPTX presentation: ${err?.message || 'Corrupted presentation archive.'}`);
  }
}
