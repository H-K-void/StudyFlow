import { extractTextFromPdf } from './services/extractors/pdfExtractor';
import { extractTextFromDocx } from './services/extractors/docxExtractor';
import { extractTextFromPptx } from './services/extractors/pptxExtractor';
import { processDocument } from './services/documentExtractor';
import AdmZip from 'adm-zip';

async function runTests() {
  console.log('🧪 Starting Document Extraction Pipeline Verification...\n');

  // Test 1: Corrupted/invalid file detection
  try {
    const garbage = Buffer.from('Not a real PDF or ZIP file');
    await extractTextFromPdf(garbage);
    console.error('❌ Failed: Should have rejected garbage PDF buffer');
  } catch (e: any) {
    console.log('✅ Passed: Corrupted PDF validation caught error ->', e.message);
  }

  // Test 2: Empty file detection
  try {
    const emptyBuf = Buffer.alloc(0);
    await processDocument({
      buffer: emptyBuf,
      fileName: 'empty.docx',
      subject: 'Data Structures'
    });
    console.error('❌ Failed: Should have rejected empty buffer');
  } catch (e: any) {
    console.log('✅ Passed: Empty file rejected ->', e.message);
  }

  // Test 3: Synthetic PPTX with slides
  try {
    const zip = new AdmZip();
    const slide1Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:t>Trees and Graphs in Computer Science</a:t></a:p>
          <a:p><a:t>Binary Search Trees guarantee O(log N) search when balanced.</a:t></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    const slide2Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:t>Graph Traversals: BFS and DFS</a:t></a:p>
          <a:p><a:t>BFS uses a Queue; DFS uses a Stack or recursion.</a:t></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.addFile('ppt/slides/slide1.xml', Buffer.from(slide1Xml, 'utf8'));
    zip.addFile('ppt/slides/slide2.xml', Buffer.from(slide2Xml, 'utf8'));
    const pptxBuffer = zip.toBuffer();

    const pptxResult = await processDocument({
      buffer: pptxBuffer,
      fileName: 'Lecture_Trees_and_Graphs.pptx',
      subject: 'Data Structures',
      topic: 'Trees and Graphs'
    });

    console.log('✅ Passed: PPTX text extraction ->', {
      fileName: pptxResult.fileName,
      fileType: pptxResult.fileType,
      subject: pptxResult.subject,
      topic: pptxResult.topic,
      slideCount: pptxResult.metadata.slideCount,
      wordCount: pptxResult.metadata.wordCount,
      headingsFound: pptxResult.metadata.headingsFound
    });

  } catch (e: any) {
    console.error('❌ PPTX extraction failed:', e);
  }

  console.log('\n🎉 Document Extraction Pipeline Verification Complete!\n');
}

runTests();
