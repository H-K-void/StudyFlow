import { VaultNote, BacklinkReference, StudyFlowSession } from '../types';

/**
 * Normalizes a note title for case-insensitive matching and linking
 */
export function normalizeNoteTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Extracts all [[Target Note]] link titles from markdown text
 */
export function extractWikiLinks(content: string): string[] {
  if (!content) return [];
  const regex = /\[\[(.*?)\]\]/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1].trim();
    if (raw && !matches.includes(raw)) {
      matches.push(raw);
    }
  }
  return matches;
}

/**
 * Finds a note by title (case-insensitive)
 */
export function findNoteByTitle(title: string, allNotes: VaultNote[]): VaultNote | undefined {
  const norm = normalizeNoteTitle(title);
  return allNotes.find((n) => normalizeNoteTitle(n.title) === norm);
}

/**
 * Finds all notes in the vault that link to the target note via [[Target Note]]
 */
export function findBacklinks(
  targetTitle: string,
  currentNoteId: string,
  allNotes: VaultNote[]
): BacklinkReference[] {
  if (!targetTitle) return [];
  const normTarget = normalizeNoteTitle(targetTitle);
  const backlinks: BacklinkReference[] = [];

  for (const note of allNotes) {
    if (note.id === currentNoteId) continue; // Do not list self-links

    const links = extractWikiLinks(note.content);
    const hasMatch = links.some((l) => normalizeNoteTitle(l) === normTarget);

    if (hasMatch) {
      // Extract snippet around the wiki link
      const lines = note.content.split(/\r?\n/);
      let contextSnippet = '';
      for (const line of lines) {
        if (line.toLowerCase().includes(`[[${normTarget}]]`) || line.toLowerCase().includes(normTarget)) {
          contextSnippet = line.replace(/^[#\-*\d.\s]+/, '').trim();
          break;
        }
      }

      if (!contextSnippet) {
        contextSnippet = note.content.slice(0, 120).trim() + '...';
      }

      backlinks.push({
        sourceNoteId: note.id,
        sourceNoteTitle: note.title,
        sourceFolderPath: note.folderPath,
        snippet: contextSnippet
      });
    }
  }

  return backlinks;
}

/**
 * Formats a StudyFlowSession into a rich interconnected Markdown document with wiki links
 */
export function convertSessionToMarkdownWithWikiLinks(session: StudyFlowSession): string {
  const { notes, subject } = session;
  let md = `# ${session.title}\n\n`;
  md += `**Subject:** [[${subject}]] | **Estimated Revision Time:** ${notes.estimatedStudyTimeMinutes} mins\n\n`;
  md += `## 💡 Executive Summary\n\n${notes.executiveSummary}\n\n---\n\n`;

  md += `## 🎯 Core Concepts & Principles\n\n`;
  notes.coreConcepts.forEach((concept, idx) => {
    md += `### ${idx + 1}. [[${concept.title}]]\n`;
    md += `${concept.summary}\n\n`;
    concept.bulletPoints.forEach((pt) => {
      md += `- ${pt}\n`;
    });
    if (concept.keyTakeaway) {
      md += `\n> **Key Takeaway:** ${concept.keyTakeaway}\n`;
    }
    md += `\n`;
  });

  md += `---\n\n`;

  if (notes.cheatSheet && notes.cheatSheet.length > 0) {
    md += `## ⚡ Quick Reference & Formula Table\n\n`;
    md += `| Concept / Term | Classification | Definition & Rules |\n`;
    md += `| :--- | :--- | :--- |\n`;
    notes.cheatSheet.forEach((item) => {
      const cleanDef = item.definition.replace(/\|/g, '\\|');
      md += `| [[${item.term}]] | \`${item.type}\` | ${cleanDef} |\n`;
    });
    md += `\n`;

    // Formulas code blocks if present
    const formulaItems = notes.cheatSheet.filter((i) => i.formulaOrSyntax);
    if (formulaItems.length > 0) {
      md += `### 📐 Formula Syntax & Code Patterns\n\n`;
      formulaItems.forEach((f) => {
        md += `#### [[${f.term}]]\n\`\`\`text\n${f.formulaOrSyntax}\n\`\`\`\n\n`;
      });
    }
  }

  if (notes.highYieldExamTips && notes.highYieldExamTips.length > 0) {
    md += `---\n\n## ⚠️ High-Yield Exam Pitfalls\n\n`;
    notes.highYieldExamTips.forEach((tip) => {
      md += `> ⚠️ ${tip}\n>\n`;
    });
    md += `\n`;
  }

  md += `---\n\n## ✅ Active Revision Checklist\n\n`;
  md += `- [ ] Read and understand the executive summary\n`;
  notes.coreConcepts.forEach((c) => {
    md += `- [ ] Master core concept: [[${c.title}]]\n`;
  });
  md += `- [ ] Complete the 5-Question Practice Quiz with 80%+ accuracy\n\n`;

  return md;
}

export interface GraphNode {
  id: string;
  title: string;
  folderPath: string[];
  primaryFolder: string;
  tags?: string[];
  linkCount: number;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceTitle: string;
  targetTitle: string;
}

export interface VaultGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  folderColors: Record<string, string>;
}

const PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1'  // indigo
];

/**
 * Builds nodes and link connections from Vault Notes and [[Wiki Links]]
 */
export function buildVaultGraphData(allNotes: VaultNote[]): VaultGraphData {
  const nodeMap = new Map<string, GraphNode>();
  const folderColors: Record<string, string> = {};
  let colorIdx = 0;

  // 1. Initialize nodes
  allNotes.forEach((note) => {
    const primaryFolder = note.folderPath[0] || 'General';
    if (!folderColors[primaryFolder]) {
      folderColors[primaryFolder] = PALETTE[colorIdx % PALETTE.length];
      colorIdx++;
    }

    nodeMap.set(note.id, {
      id: note.id,
      title: note.title,
      folderPath: note.folderPath,
      primaryFolder,
      tags: note.tags,
      linkCount: 0,
      radius: 12
    });
  });

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // 2. Discover edges from [[Wiki Links]]
  allNotes.forEach((note) => {
    const links = extractWikiLinks(note.content);

    links.forEach((targetTitle) => {
      const targetNote = findNoteByTitle(targetTitle, allNotes);
      if (targetNote && targetNote.id !== note.id) {
        // Unique edge key regardless of direction
        const edgeKey = [note.id, targetNote.id].sort().join('--');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            id: edgeKey,
            source: note.id,
            target: targetNote.id,
            sourceTitle: note.title,
            targetTitle: targetNote.title
          });

          // Increment link degrees
          const srcNode = nodeMap.get(note.id);
          const tgtNode = nodeMap.get(targetNote.id);
          if (srcNode) srcNode.linkCount++;
          if (tgtNode) tgtNode.linkCount++;
        }
      }
    });
  });

  // 3. Compute dynamic node radius based on connection degree
  const nodes = Array.from(nodeMap.values()).map((node) => {
    const baseRadius = 14;
    const scaledRadius = Math.min(32, baseRadius + node.linkCount * 3.5);
    return {
      ...node,
      radius: scaledRadius
    };
  });

  return {
    nodes,
    edges,
    folderColors
  };
}
