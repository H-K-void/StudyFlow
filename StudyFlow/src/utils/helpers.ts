import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StudyFlowSession } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function generateMarkdownExport(session: StudyFlowSession): string {
  const { notes, quiz } = session;
  let md = `# 📚 ${session.title}\n\n`;
  md += `**Subject:** ${session.subject} | **Generated:** ${formatDate(session.createdAt)} | **Estimated Revision Time:** ${notes.estimatedStudyTimeMinutes} mins\n\n`;
  md += `---\n\n`;

  md += `## 💡 Executive Summary\n\n${notes.executiveSummary}\n\n`;

  md += `## 🎯 High-Yield Core Concepts\n\n`;
  notes.coreConcepts.forEach((c, idx) => {
    md += `### ${idx + 1}. ${c.title} (${c.importance.toUpperCase()})\n`;
    md += `${c.summary}\n\n`;
    c.bulletPoints.forEach((pt) => {
      md += `- ${pt}\n`;
    });
    if (c.keyTakeaway) {
      md += `\n> **Key Takeaway:** ${c.keyTakeaway}\n`;
    }
    md += `\n`;
  });

  if (notes.cheatSheet && notes.cheatSheet.length > 0) {
    md += `## ⚡ Terminology & Quick Cheat Sheet\n\n`;
    notes.cheatSheet.forEach((item) => {
      md += `#### ${item.term} *(${item.type})*\n`;
      md += `${item.definition}\n`;
      if (item.formulaOrSyntax) {
        md += `\`\`\`text\n${item.formulaOrSyntax}\n\`\`\`\n`;
      }
      md += `\n`;
    });
  }

  if (notes.highYieldExamTips && notes.highYieldExamTips.length > 0) {
    md += `## 🚀 Exam Traps & High-Yield Tips\n\n`;
    notes.highYieldExamTips.forEach((tip) => {
      md += `- ⚠️ ${tip}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## 📝 5-Question Practice Quiz\n\n`;
  quiz.forEach((q) => {
    md += `### Question ${q.questionNumber}: ${q.prompt}\n`;
    md += `*Tag: ${q.topicTag} | Difficulty: ${q.difficulty}*\n\n`;
    q.options.forEach((opt) => {
      const isCorrectMark = opt.id === q.correctOptionId ? ' ✓ (Correct)' : '';
      md += `- **[${opt.id}]** ${opt.text}${isCorrectMark}\n`;
    });
    md += `\n> **Explanation:** ${q.options.find((o) => o.id === q.correctOptionId)?.explanation || ''}\n\n`;
  });

  md += `\n---\n*Exported from StudyFlow AI*`;
  return md;
}

export function downloadFile(filename: string, content: string, mimeType: string = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface SubjectDomainInfo {
  domain: 'mathematics' | 'programming' | 'physics' | 'biology' | 'theory' | 'general';
  label: string;
  focusHighlights: string[];
}

export function getSubjectDomainInfo(subject: string, topic: string = ''): SubjectDomainInfo {
  const combined = `${subject} ${topic}`.toLowerCase();

  if (
    /math|calculus|algebra|geometry|trigonometry|statistics|probability|discrete math|linear algebra|arithmetic|differential|integral|matrix|matrices|number theory/i.test(
      combined
    )
  ) {
    return {
      domain: 'mathematics',
      label: 'Mathematics & Equations',
      focusHighlights: ['Formulas & Equations', 'Step-oriented reasoning', 'Boundary conditions']
    };
  }

  if (
    /program|coding|software|computer science|data structure|algorithm|javascript|python|typescript|java\b|c\+\+|rust|golang|web dev|database|sql|nosql|frontend|backend|api|operating system|networking|cybersecurity|machine learning|deep learning|ai\b/i.test(
      combined
    )
  ) {
    return {
      domain: 'programming',
      label: 'Programming & CS',
      focusHighlights: ['Syntax & Algorithms', 'Time/Space Complexity', 'Edge cases & code logic']
    };
  }

  if (
    /physics|thermodynamics|mechanics|electromagnet|quantum|optics|kinematics|fluid dynamics|astrophysics|circuits|electronics|electrical|mechanical/i.test(
      combined
    )
  ) {
    return {
      domain: 'physics',
      label: 'Physics & Engineering',
      focusHighlights: ['Governing Laws', 'Formulas & SI Units', 'Proportional scaling']
    };
  }

  if (
    /bio|anatomy|physiology|genetics|medicine|medical|microbiology|pharmacology|pathology|immunology|biochem|ecology|zoology|botany|cellular|neuroscience/i.test(
      combined
    )
  ) {
    return {
      domain: 'biology',
      label: 'Biology & Life Sciences',
      focusHighlights: ['Terminology & Definitions', 'Cellular Processes & Pathways', 'Structure-Function']
    };
  }

  if (
    /history|philosophy|psychology|sociology|literature|law|legal|economics|political|politics|ethics|business|management|marketing|linguistics|anthropology|finance/i.test(
      combined
    )
  ) {
    return {
      domain: 'theory',
      label: 'Theory & Humanities',
      focusHighlights: ['Definitions & Frameworks', 'Model Comparisons', 'Causal Arguments']
    };
  }

  return {
    domain: 'general',
    label: 'Academic Revision',
    focusHighlights: ['Core Concepts', 'Definitions', 'Diagnostic Quiz']
  };
}

