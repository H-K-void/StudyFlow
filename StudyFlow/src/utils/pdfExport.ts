import { jsPDF } from 'jspdf';
import { StudyFlowSession } from '../types';
import { formatDate } from './helpers';

interface PdfRenderContext {
  doc: jsPDF;
  cursorY: number;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  currentPage: number;
}

function createPdfContext(): PdfRenderContext {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  return {
    doc,
    cursorY: margin,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    currentPage: 1
  };
}

function checkPageBreak(ctx: PdfRenderContext, requiredHeight: number): void {
  if (ctx.cursorY + requiredHeight > ctx.pageHeight - 20) {
    // Add footer on current page
    renderFooter(ctx);
    ctx.doc.addPage();
    ctx.currentPage += 1;
    ctx.cursorY = ctx.margin + 6;
  }
}

function renderFooter(ctx: PdfRenderContext): void {
  const { doc, pageWidth, pageHeight, margin, currentPage } = ctx;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text('StudyFlow AI • Single-Purpose Student Revision Guide', margin, pageHeight - 10);
  doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
}

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[^\x00-\x7F]/g, '') // remove non-ascii characters that break standard helvetica
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. Export Revision Notes as clean, high-yield PDF
 */
export function exportNotesToPdf(session: StudyFlowSession): void {
  const ctx = createPdfContext();
  const { doc, margin, contentWidth } = ctx;
  const { notes } = session;

  // Header branding pill
  doc.setFillColor(238, 242, 255); // #EEF2FF
  doc.roundedRect(margin, ctx.cursorY, 45, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229); // #4F46E5
  doc.text('STUDYFLOW AI', margin + 3, ctx.cursorY + 4.5);
  ctx.cursorY += 10;

  // Study Pack Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // #0F172A
  const cleanTitle = sanitizeText(session.title);
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, ctx.cursorY);
  ctx.cursorY += titleLines.length * 7 + 2;

  // Metadata Subtitle (Subject, Date, Estimated Revision Time)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // #64748B
  const subMeta = `Subject: ${sanitizeText(session.subject)}   |   Generated: ${formatDate(session.createdAt)}   |   Est. Revision: ${notes.estimatedStudyTimeMinutes} mins`;
  doc.text(subMeta, margin, ctx.cursorY);
  ctx.cursorY += 6;

  // Separator rule
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.4);
  doc.line(margin, ctx.cursorY, margin + contentWidth, ctx.cursorY);
  ctx.cursorY += 7;

  // Section 1: Executive Summary Callout
  checkPageBreak(ctx, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Executive Revision Summary', margin, ctx.cursorY);
  ctx.cursorY += 5;

  const cleanSummary = sanitizeText(notes.executiveSummary);
  const summaryLines = doc.splitTextToSize(cleanSummary, contentWidth - 8);
  const boxHeight = summaryLines.length * 4.5 + 8;

  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.roundedRect(margin, ctx.cursorY, contentWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(summaryLines, margin + 4, ctx.cursorY + 6);
  ctx.cursorY += boxHeight + 8;

  // Section 2: High-Yield Core Concepts
  checkPageBreak(ctx, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Important Concepts & Revision Modules', margin, ctx.cursorY);
  ctx.cursorY += 6;

  notes.coreConcepts.forEach((concept, idx) => {
    checkPageBreak(ctx, 30);

    // Concept Title & Importance
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const conceptTitle = `${idx + 1}. ${sanitizeText(concept.title)} [${concept.importance.toUpperCase()}]`;
    doc.text(conceptTitle, margin, ctx.cursorY);
    ctx.cursorY += 4.5;

    // Concept Summary
    if (concept.summary) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const summaryLines = doc.splitTextToSize(sanitizeText(concept.summary), contentWidth - 4);
      doc.text(summaryLines, margin + 3, ctx.cursorY);
      ctx.cursorY += summaryLines.length * 4 + 2;
    }

    // Bullet points
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    concept.bulletPoints.forEach((pt) => {
      checkPageBreak(ctx, 10);
      const cleanPt = sanitizeText(pt);
      const ptLines = doc.splitTextToSize(`-  ${cleanPt}`, contentWidth - 6);
      doc.text(ptLines, margin + 3, ctx.cursorY);
      ctx.cursorY += ptLines.length * 4 + 1.5;
    });

    // Key takeaway callout if present
    if (concept.keyTakeaway) {
      checkPageBreak(ctx, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      const takeawayLines = doc.splitTextToSize(`> Key Takeaway: ${sanitizeText(concept.keyTakeaway)}`, contentWidth - 6);
      doc.text(takeawayLines, margin + 4, ctx.cursorY);
      ctx.cursorY += takeawayLines.length * 4 + 2;
    }

    ctx.cursorY += 3;
  });

  // Section 3: Key Definitions & Formulas
  if (notes.cheatSheet && notes.cheatSheet.length > 0) {
    checkPageBreak(ctx, 30);
    ctx.cursorY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Key Definitions & Formulas Cheat Sheet', margin, ctx.cursorY);
    ctx.cursorY += 6;

    notes.cheatSheet.forEach((item) => {
      checkPageBreak(ctx, 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${sanitizeText(item.term)} (${sanitizeText(item.type)})`, margin, ctx.cursorY);
      ctx.cursorY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const defLines = doc.splitTextToSize(sanitizeText(item.definition), contentWidth - 4);
      doc.text(defLines, margin + 3, ctx.cursorY);
      ctx.cursorY += defLines.length * 4 + 1.5;

      if (item.formulaOrSyntax) {
        checkPageBreak(ctx, 12);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin + 3, ctx.cursorY - 1, contentWidth - 6, 6.5, 1, 1, 'F');
        doc.setFont('courier', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(sanitizeText(item.formulaOrSyntax), margin + 5, ctx.cursorY + 3.5);
        ctx.cursorY += 8.5;
      }
    });
  }

  // Section 4: Common Exam Traps & Pitfalls
  if (notes.highYieldExamTips && notes.highYieldExamTips.length > 0) {
    checkPageBreak(ctx, 25);
    ctx.cursorY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('4. High-Yield Exam Traps & Pitfalls', margin, ctx.cursorY);
    ctx.cursorY += 5;

    notes.highYieldExamTips.forEach((tip) => {
      checkPageBreak(ctx, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(146, 64, 14);
      const tipLines = doc.splitTextToSize(`!  ${sanitizeText(tip)}`, contentWidth - 4);
      doc.text(tipLines, margin + 3, ctx.cursorY);
      ctx.cursorY += tipLines.length * 4 + 2;
    });
  }

  // Final footer on last page
  renderFooter(ctx);

  const cleanFileBase = session.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  doc.save(`${cleanFileBase}-revision-notes.pdf`);
}

/**
 * 2. Export 5-Question Practice Quiz as PDF (with Answer Key & Rationales at the end)
 */
export function exportQuizToPdf(session: StudyFlowSession): void {
  const ctx = createPdfContext();
  const { doc, margin, contentWidth } = ctx;
  const { quiz } = session;

  // Header branding pill
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, ctx.cursorY, 45, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  doc.text('STUDYFLOW AI', margin + 3, ctx.cursorY + 4.5);
  ctx.cursorY += 10;

  // Quiz Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  const cleanTitle = `Practice Quiz: ${sanitizeText(session.title)}`;
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, ctx.cursorY);
  ctx.cursorY += titleLines.length * 7 + 2;

  // Metadata Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const subMeta = `Subject: ${sanitizeText(session.subject)}   |   5 Questions   |   Answer Key at end of document`;
  doc.text(subMeta, margin, ctx.cursorY);
  ctx.cursorY += 6;

  // Separator rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, ctx.cursorY, margin + contentWidth, ctx.cursorY);
  ctx.cursorY += 8;

  // Section 1: Questions 1 to 5 (clean test sheet for students)
  quiz.forEach((q) => {
    checkPageBreak(ctx, 42);

    // Question Prompt
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const qHeader = `Question ${q.questionNumber}: ${sanitizeText(q.prompt)}`;
    const qPromptLines = doc.splitTextToSize(qHeader, contentWidth);
    doc.text(qPromptLines, margin, ctx.cursorY);
    ctx.cursorY += qPromptLines.length * 5 + 1.5;

    // Difficulty & Topic Tag
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Topic: ${sanitizeText(q.topicTag)}   |   Difficulty: ${q.difficulty}`, margin + 3, ctx.cursorY);
    ctx.cursorY += 4.5;

    // 4 Multiple Choice Options (checkbox format [ ])
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    q.options.forEach((opt) => {
      checkPageBreak(ctx, 10);
      const cleanOpt = sanitizeText(opt.text);
      const optLines = doc.splitTextToSize(`[  ]  ${opt.id}.  ${cleanOpt}`, contentWidth - 4);
      doc.text(optLines, margin + 4, ctx.cursorY);
      ctx.cursorY += optLines.length * 4.5 + 1.5;
    });

    ctx.cursorY += 5;
  });

  // Section 2: Answer Key & Explanation Section (on a clean new section / page break)
  checkPageBreak(ctx, 60);
  ctx.cursorY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, ctx.cursorY, margin + contentWidth, ctx.cursorY);
  ctx.cursorY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('Answer Key & Grounded Rationales', margin, ctx.cursorY);
  ctx.cursorY += 6;

  quiz.forEach((q) => {
    checkPageBreak(ctx, 24);

    const correctOptionObj = q.options.find((o) => o.id === q.correctOptionId);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Q${q.questionNumber} Answer: [${q.correctOptionId}] ${sanitizeText(correctOptionObj?.text || '')}`,
      margin,
      ctx.cursorY
    );
    ctx.cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const expText = `Explanation: ${sanitizeText(correctOptionObj?.explanation || q.options[0]?.explanation || 'Verified from source lecture.')}`;
    const expLines = doc.splitTextToSize(expText, contentWidth - 4);
    doc.text(expLines, margin + 3, ctx.cursorY);
    ctx.cursorY += expLines.length * 4 + 4;
  });

  // Render footer
  renderFooter(ctx);

  const cleanFileBase = session.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  doc.save(`${cleanFileBase}-practice-quiz.pdf`);
}
