import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { VaultNote } from '../../types';
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  BookOpen,
  FolderPlus,
  FilePlus,
  X,
  ChevronLeft,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Button } from '../common/Button';

interface VaultSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface FolderNode {
  name: string;
  fullPath: string[];
  subFolders: Record<string, FolderNode>;
  notes: VaultNote[];
}

export const VaultSidebar: React.FC<VaultSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const {
    vaultNotes,
    activeNoteId,
    openVaultNote,
    createVaultNote,
    expandedFolders,
    toggleFolder
  } = useStudyFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteFolder, setNewNoteFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState('');

  // Persistent user-created empty folders
  const [customFolders, setCustomFolders] = useState<string[][]>(() => {
    const saved = localStorage.getItem('studyflow_custom_folders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse custom folders', e);
      }
    }
    return [
      ['Data Structures', 'Trees'],
      ['Data Structures', 'Graphs'],
      ['Distributed Systems', 'Consensus'],
      ['Biology', 'Cellular Biology']
    ];
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('studyflow_custom_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  // Extract all known folder paths for suggestions
  const allFolderPaths = useMemo(() => {
    const paths = new Set<string>();
    customFolders.forEach((p) => paths.add(p.join('/')));
    vaultNotes.forEach((note) => {
      if (note.folderPath && note.folderPath.length > 0) {
        let current = '';
        note.folderPath.forEach((seg) => {
          current = current ? `${current}/${seg}` : seg;
          paths.add(current);
        });
      }
    });
    return Array.from(paths).sort();
  }, [customFolders, vaultNotes]);

  // Build hierarchical folder tree
  const folderTree = useMemo(() => {
    const root: FolderNode = {
      name: 'Study Vault',
      fullPath: [],
      subFolders: {},
      notes: []
    };

    // 1. Ensure all custom empty folders exist in the tree
    customFolders.forEach((pathSegments) => {
      let current = root;
      pathSegments.forEach((segment) => {
        if (!current.subFolders[segment]) {
          current.subFolders[segment] = {
            name: segment,
            fullPath: [...current.fullPath, segment],
            subFolders: {},
            notes: []
          };
        }
        current = current.subFolders[segment];
      });
    });

    // 2. Filter notes if searching
    const filteredNotes = searchQuery.trim()
      ? vaultNotes.filter(
          (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.folderPath.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : vaultNotes;

    // 3. Populate notes into tree
    filteredNotes.forEach((note) => {
      let current = root;
      note.folderPath.forEach((folderName) => {
        if (!current.subFolders[folderName]) {
          current.subFolders[folderName] = {
            name: folderName,
            fullPath: [...current.fullPath, folderName],
            subFolders: {},
            notes: []
          };
        }
        current = current.subFolders[folderName];
      });
      current.notes.push(note);
    });

    return root;
  }, [vaultNotes, customFolders, searchQuery]);

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const folders = newNoteFolder
      .split('/')
      .map((f) => f.trim())
      .filter(Boolean);

    const targetFolderPath = folders.length > 0 ? folders : ['General'];

    createVaultNote({
      title: newNoteTitle.trim(),
      folderPath: targetFolderPath,
      content: `# ${newNoteTitle.trim()}\n\nStart writing notes or link to other concepts using \`[[Concept Name]]\`.\n`
    });

    // Also register the folder if new
    if (folders.length > 0) {
      setCustomFolders((prev) => {
        const key = targetFolderPath.join('/');
        if (prev.some((p) => p.join('/') === key)) return prev;
        return [...prev, targetFolderPath];
      });
    }

    setNewNoteTitle('');
    setNewNoteFolder('');
    setIsCreatingNote(false);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const parentSegments = newFolderParent
      .split('/')
      .map((f) => f.trim())
      .filter(Boolean);

    const fullSegments = [...parentSegments, newFolderName.trim()];
    const folderKey = fullSegments.join('/');

    setCustomFolders((prev) => {
      if (prev.some((p) => p.join('/') === folderKey)) return prev;
      return [...prev, fullSegments];
    });

    // Auto expand newly created folder and its parents
    let currentPath = '';
    fullSegments.forEach((segment) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      if (expandedFolders[currentPath] === false) {
        toggleFolder(currentPath);
      }
    });

    setNewFolderName('');
    setNewFolderParent('');
    setIsCreatingFolder(false);
  };

  // Render recursive folder tree node
  const renderFolderNode = (node: FolderNode, depth: number = 0) => {
    const folderKey = node.fullPath.join('/');
    // When searching, auto-expand folders that contain matches; otherwise check expandedFolders (default: true)
    const isExpanded = searchQuery.trim().length > 0 ? true : (expandedFolders[folderKey] ?? true);
    const hasChildren = Object.keys(node.subFolders).length > 0 || node.notes.length > 0;

    return (
      <div key={folderKey || 'root'} className="space-y-0.5">
        {node.fullPath.length > 0 && (
          <div
            onClick={() => toggleFolder(folderKey)}
            style={{ paddingLeft: `${Math.max(6, depth * 12)}px` }}
            className={cn(
              'flex items-center justify-between py-1 px-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors select-none group',
              isExpanded
                ? 'text-text-primary hover:bg-surface-hover'
                : 'text-text-secondary hover:bg-surface-hover'
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Expand/Collapse Arrow Button - Clicking arrow strictly toggles this folder */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folderKey);
                }}
                className="w-4 h-4 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0"
                aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Folder Icon */}
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-amber-500 transition-colors" />
              )}

              {/* Folder Name */}
              <span className="truncate font-semibold text-xs tracking-tight">{node.name}</span>
            </div>

            {/* Child items counter badge */}
            <span className="text-[10px] text-text-muted font-mono opacity-60 pr-1">
              {node.notes.length + Object.keys(node.subFolders).length}
            </span>
          </div>
        )}

        {/* Sub-folders and Notes Container */}
        {(isExpanded || node.fullPath.length === 0) && (
          <div className="space-y-0.5">
            {Object.values(node.subFolders).map((subNode) =>
              renderFolderNode(subNode, depth + 1)
            )}

            {node.notes.map((note) => {
              const isActive = activeNoteId === note.id;
              const hasQuiz = !!note.sessionId;

              return (
                <div
                  key={note.id}
                  onClick={() => openVaultNote(note.id)}
                  style={{ paddingLeft: `${Math.max(16, (depth + 1) * 14 + 6)}px` }}
                  className={cn(
                    'flex items-center justify-between py-1 px-1.5 rounded-md text-xs cursor-pointer transition-all select-none group relative',
                    isActive
                      ? 'bg-brand/15 text-brand font-bold border-l-2 border-brand shadow-xs'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary font-normal'
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isActive
                          ? 'text-brand'
                          : 'text-text-muted group-hover:text-text-secondary'
                      )}
                    />
                    <span className="truncate">{note.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pr-1">
                    {hasQuiz && (
                      <span
                        title="Linked to Practice Quiz"
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // COLLAPSED SIDEBAR: Sleek, Intentional Icon Rail (NO ROTATED/SQUEEZED TEXT)
  // =========================================================================
  if (isCollapsed) {
    return (
      <aside className="w-12 shrink-0 bg-surface border-r border-border p-2 flex flex-col items-center justify-between no-print transition-colors select-none z-20">
        <div className="space-y-2 flex flex-col items-center w-full">
          {/* 1. Re-open / Expand Sidebar Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-brand flex items-center justify-center transition-colors shadow-xs"
            title="Open Study Vault (Expand Sidebar)"
            aria-label="Expand Study Vault"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* 2. Quick Search Button (Expands and focuses search) */}
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              setTimeout(() => searchInputRef.current?.focus(), 150);
            }}
            className="w-8 h-8 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
            title="Search Vault"
            aria-label="Search Vault"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 3. Quick New Note Action */}
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              setIsCreatingNote(true);
            }}
            className="w-8 h-8 rounded-lg hover:bg-brand/15 text-text-muted hover:text-brand flex items-center justify-center transition-colors"
            title="Create New Note"
            aria-label="Create New Note"
          >
            <FilePlus className="w-4 h-4" />
          </button>

          {/* 4. Quick New Folder Action */}
          <button
            type="button"
            onClick={() => {
              onToggleCollapse();
              setIsCreatingFolder(true);
            }}
            className="w-8 h-8 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
            title="Create New Folder"
            aria-label="Create New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Note Count Indicator */}
        <div
          className="w-7 h-7 rounded-md bg-surface-secondary text-text-muted flex items-center justify-center text-[10px] font-mono font-bold"
          title={`${vaultNotes.length} notes in vault`}
        >
          {vaultNotes.length}
        </div>
      </aside>
    );
  }

  // =========================================================================
  // EXPANDED SIDEBAR: Obsidian-Style Hierarchical File Explorer
  // =========================================================================
  return (
    <aside className="w-72 sm:w-80 shrink-0 bg-surface-secondary/60 border-r border-border flex flex-col h-full no-print select-none transition-colors">
      {/* 1. Sidebar Header */}
      <div className="p-3 border-b border-border space-y-2.5 bg-surface/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                STUDY VAULT
              </h3>
              <p className="text-[10px] text-text-muted font-medium">
                {vaultNotes.length} interconnected notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* New Note Button */}
            <button
              type="button"
              onClick={() => {
                setIsCreatingNote(true);
                setIsCreatingFolder(false);
              }}
              className="p-1.5 rounded-md text-text-muted hover:text-brand hover:bg-brand/10 transition-colors"
              title="New Note"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>

            {/* New Folder Button */}
            <button
              type="button"
              onClick={() => {
                setIsCreatingFolder(true);
                setIsCreatingNote(false);
              }}
              className="p-1.5 rounded-md text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            {/* Collapse Sidebar Button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault & links..."
            className="w-full pl-7 pr-7 py-1.5 rounded-lg border border-border text-xs text-text-primary placeholder:text-text-muted bg-surface focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 text-text-muted hover:text-text-primary absolute right-1.5 top-1/2 -translate-y-1/2"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Inline New Note Creator Form */}
      {isCreatingNote && (
        <form onSubmit={handleCreateNoteSubmit} className="p-3 bg-surface border-b border-brand/30 shadow-subtle space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand flex items-center gap-1">
              <FilePlus className="w-3 h-3 text-brand" />
              <span>Create New Note</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNote(false)}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Note title (e.g. Dijkstra's Algorithm)..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            autoFocus
            required
          />
          <input
            type="text"
            value={newNoteFolder}
            onChange={(e) => setNewNoteFolder(e.target.value)}
            placeholder="Folder path (e.g. Data Structures/Graphs)..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            list="known-folders-list"
          />
          <datalist id="known-folders-list">
            {allFolderPaths.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingNote(false)}
              className="text-xs h-7 py-0"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs h-7 py-0">
              Create Note
            </Button>
          </div>
        </form>
      )}

      {/* 3. Inline New Folder Creator Form */}
      {isCreatingFolder && (
        <form onSubmit={handleCreateFolderSubmit} className="p-3 bg-surface border-b border-amber-500/30 shadow-subtle space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
              <FolderPlus className="w-3 h-3 text-amber-500" />
              <span>Create New Folder</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name (e.g. Algorithms)..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            autoFocus
            required
          />
          <input
            type="text"
            value={newFolderParent}
            onChange={(e) => setNewFolderParent(e.target.value)}
            placeholder="Parent folder (optional, e.g. Data Structures)..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            list="parent-folders-list"
          />
          <datalist id="parent-folders-list">
            {allFolderPaths.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingFolder(false)}
              className="text-xs h-7 py-0"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs h-7 py-0 bg-amber-600 hover:bg-amber-700">
              Create Folder
            </Button>
          </div>
        </form>
      )}

      {/* 4. Obsidian Folder & File Tree View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        {renderFolderNode(folderTree)}

        {vaultNotes.length === 0 && (
          <div className="p-6 text-center text-text-muted text-xs space-y-2">
            <Folder className="w-8 h-8 text-text-muted/60 mx-auto" />
            <p>Your vault is empty. Upload a lecture or create a note.</p>
          </div>
        )}
      </div>

      {/* 5. Footer Actions (+ New Note / + New Folder) */}
      <div className="p-2.5 border-t border-border bg-surface/50 text-xs text-text-muted flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setIsCreatingNote(true);
            setIsCreatingFolder(false);
          }}
          className="flex-1 py-1 px-2 rounded-md bg-surface hover:bg-surface-hover border border-border text-text-primary font-semibold flex items-center justify-center gap-1 text-[11px] transition-colors shadow-2xs"
        >
          <Plus className="w-3 h-3 text-brand" />
          <span>New Note</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsCreatingFolder(true);
            setIsCreatingNote(false);
          }}
          className="flex-1 py-1 px-2 rounded-md bg-surface hover:bg-surface-hover border border-border text-text-primary font-semibold flex items-center justify-center gap-1 text-[11px] transition-colors shadow-2xs"
        >
          <FolderPlus className="w-3 h-3 text-amber-500" />
          <span>New Folder</span>
        </button>
      </div>
    </aside>
  );
};
