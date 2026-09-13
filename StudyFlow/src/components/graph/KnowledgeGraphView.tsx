import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useStudyFlow } from '../../context/StudyFlowContext';
import { buildVaultGraphData, GraphNode, GraphEdge } from '../../utils/wikiLinks';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  FileText,
  Search,
  Folder,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface KnowledgeGraphViewProps {
  onOpenNoteInEditor?: (noteId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ onOpenNoteInEditor }) => {
  const {
    vaultNotes,
    activeNoteId,
    openVaultNote,
    setCurrentScreen,
    theme
  } = useStudyFlow();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Graph state & physics
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(activeNoteId);

  // Dragging states
  const isDraggingCanvas = useRef(false);
  const isDraggingNode = useRef<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  // Simulation node positions & velocities in ref for 60fps rendering without React re-render lag
  const simNodesRef = useRef<(GraphNode & { x: number; y: number; vx: number; vy: number })[]>([]);
  const animFrameId = useRef<number | null>(null);

  const graphData = useMemo(() => {
    return buildVaultGraphData(vaultNotes);
  }, [vaultNotes]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    vaultNotes.forEach((n) => {
      if (n.folderPath[0]) set.add(n.folderPath[0]);
    });
    return Array.from(set);
  }, [vaultNotes]);

  // Find active / selected node details
  const inspectedNode = useMemo(() => {
    const targetId = selectedNodeId || activeNoteId;
    return graphData.nodes.find((n) => n.id === targetId) || graphData.nodes[0] || null;
  }, [graphData.nodes, selectedNodeId, activeNoteId]);

  // Connected nodes to inspected node
  const connectedEdges = useMemo(() => {
    if (!inspectedNode) return [];
    return graphData.edges.filter(
      (e) => e.source === inspectedNode.id || e.target === inspectedNode.id
    );
  }, [graphData.edges, inspectedNode]);

  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (inspectedNode) {
      set.add(inspectedNode.id);
      connectedEdges.forEach((e) => {
        set.add(e.source);
        set.add(e.target);
      });
    }
    return set;
  }, [inspectedNode, connectedEdges]);

  // Initialize simulation positions
  useEffect(() => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Preserve existing node positions if they already exist
    const existingMap = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    simNodesRef.current.forEach((n) => {
      existingMap.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy });
    });

    const angleStep = (2 * Math.PI) / Math.max(1, graphData.nodes.length);
    const radius = Math.min(220, 40 * Math.sqrt(graphData.nodes.length));

    simNodesRef.current = graphData.nodes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy
        };
      }

      const angle = idx * angleStep;
      // Add slight jitter
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;

      return {
        ...n,
        x: centerX + radius * Math.cos(angle) + jitterX,
        y: centerY + radius * Math.sin(angle) + jitterY,
        vx: 0,
        vy: 0
      };
    });
  }, [graphData.nodes]);

  // Center pan initially
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2 - 400, y: rect.height / 2 - 300 });
    }
  }, []);

  // Update selectedNodeId when activeNoteId changes
  useEffect(() => {
    if (activeNoteId) {
      setSelectedNodeId(activeNoteId);
    }
  }, [activeNoteId]);

  // 60FPS Force Simulation & Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

    // Color tokens
    const bgColor = isDark ? '#090d16' : '#f8fafc';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    const edgeColor = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.25)';
    const highlightedEdgeColor = isDark ? '#38bdf8' : '#2563eb';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const textMutedColor = isDark ? '#94a3b8' : '#64748b';

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 1. Draw subtle background grid
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.save();
      // Apply pan & zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw coordinate dots / grid
      const gridSize = 40;
      const startX = -pan.x / zoom - 200;
      const startY = -pan.y / zoom - 200;
      const endX = startX + rect.width / zoom + 400;
      const endY = startY + rect.height / zoom + 400;

      ctx.fillStyle = gridColor;
      for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
        for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Physics Simulation Step
      const nodes = simNodesRef.current;
      const k = 140; // ideal spring distance
      const centerGravity = 0.0008;
      const damping = 0.88;

      // Center of canvas
      const centerX = rect.width / (2 * zoom) - pan.x / zoom;
      const centerY = rect.height / (2 * zoom) - pan.y / zoom;

      // 1. Repulsion between all node pairs (Coulomb)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);

          const force = (k * k) / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (isDraggingNode.current !== n1.id) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (isDraggingNode.current !== n2.id) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 2. Attraction along edges (Hooke's Spring)
      const nodePosMap = new Map(nodes.map((n) => [n.id, n]));
      graphData.edges.forEach((edge) => {
        const src = nodePosMap.get(edge.source);
        const tgt = nodePosMap.get(edge.target);
        if (src && tgt) {
          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const displacement = dist - k;
          const springForce = displacement * 0.035;

          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;

          if (isDraggingNode.current !== src.id) {
            src.vx += fx;
            src.vy += fy;
          }
          if (isDraggingNode.current !== tgt.id) {
            tgt.vx -= fx;
            tgt.vy -= fy;
          }
        }
      });

      // 3. Gravity towards center & velocity integration
      nodes.forEach((n) => {
        if (isDraggingNode.current !== n.id) {
          n.vx += (centerX - n.x) * centerGravity;
          n.vy += (centerY - n.y) * centerGravity;

          n.vx *= damping;
          n.vy *= damping;

          n.x += n.vx;
          n.y += n.vy;
        }
      });

      // 4. Render Edges
      graphData.edges.forEach((edge) => {
        const src = nodePosMap.get(edge.source);
        const tgt = nodePosMap.get(edge.target);
        if (!src || !tgt) return;

        const isHighlighted =
          (selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId)) ||
          (hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId));

        const isDimmed =
          (selectedNodeId || hoveredNodeId) && !isHighlighted;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isHighlighted) {
          ctx.strokeStyle = highlightedEdgeColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = highlightedEdgeColor;
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = isDimmed ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : edgeColor;
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 5. Render Nodes
      nodes.forEach((n) => {
        const isSelected = n.id === selectedNodeId;
        const isHovered = n.id === hoveredNodeId;
        const isConnected = connectedNodeIds.has(n.id);
        const isFilteredOut =
          (selectedFolder !== 'all' && n.primaryFolder !== selectedFolder) ||
          (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()));

        const isDimmed = isFilteredOut || ((selectedNodeId || hoveredNodeId) && !isConnected && !isSelected && !isHovered);

        const nodeColor = graphData.folderColors[n.primaryFolder] || '#3b82f6';

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.2 : 1;

        // Outer glow halo for selected / hovered node
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = `${nodeColor}40`;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 16;
          ctx.fill();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ffffff' : isDark ? '#0f172a' : '#ffffff';
        ctx.fill();

        ctx.lineWidth = isSelected ? 3.5 : 2.5;
        ctx.strokeStyle = nodeColor;
        ctx.stroke();

        // Inner core dot for hub nodes
        if (n.linkCount > 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, Math.max(3, n.radius * 0.35), 0, 2 * Math.PI);
          ctx.fillStyle = nodeColor;
          ctx.fill();
        }

        // Node Title Label
        const labelText = n.title;
        ctx.font = `${isSelected ? 'bold 12px' : '600 11px'} sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Text background badge for readability
        const textWidth = ctx.measureText(labelText).width;
        const labelY = n.y + n.radius + 5;

        ctx.fillStyle = isDark ? 'rgba(9, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(n.x - textWidth / 2 - 4, labelY - 2, textWidth + 8, 16);

        ctx.fillStyle = isSelected ? nodeColor : isHovered ? (isDark ? '#fff' : '#000') : textColor;
        ctx.fillText(labelText, n.x, labelY);

        ctx.restore();
      });

      ctx.restore();
      ctx.restore();

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [pan, zoom, selectedNodeId, hoveredNodeId, selectedFolder, searchQuery, theme, graphData, connectedNodeIds]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom
      };
    },
    [pan, zoom]
  );

  // Find node under mouse
  const getNodeAtPos = useCallback(
    (worldX: number, worldY: number) => {
      const nodes = simNodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = worldX - n.x;
        const dy = worldY - n.y;
        if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) {
          return n;
        }
      }
      return null;
    },
    []
  );

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const world = screenToWorld(screenX, screenY);

    const hitNode = getNodeAtPos(world.x, world.y);
    if (hitNode) {
      isDraggingNode.current = hitNode.id;
      setSelectedNodeId(hitNode.id);
      openVaultNote(hitNode.id);
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: screenX - pan.x, y: screenY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    mousePos.current = { x: screenX, y: screenY };

    if (isDraggingNode.current) {
      const world = screenToWorld(screenX, screenY);
      const node = simNodesRef.current.find((n) => n.id === isDraggingNode.current);
      if (node) {
        node.x = world.x;
        node.y = world.y;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingCanvas.current) {
      setPan({
        x: screenX - dragStart.current.x,
        y: screenY - dragStart.current.y
      });
    } else {
      const world = screenToWorld(screenX, screenY);
      const hitNode = getNodeAtPos(world.x, world.y);
      setHoveredNodeId(hitNode ? hitNode.id : null);
    }
  };

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
    isDraggingNode.current = null;
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.max(0.3, Math.min(3.5, zoom * zoomFactor));

    // Zoom towards mouse pointer
    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    });
    setZoom(newZoom);
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.5, prev * 1.25));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.3, prev * 0.8));
  };

  const handleResetZoom = () => {
    setZoom(1);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2 - 400, y: rect.height / 2 - 300 });
    }
  };

  const handleCenterOnSelected = () => {
    if (!inspectedNode || !canvasRef.current) return;
    const node = simNodesRef.current.find((n) => n.id === inspectedNode.id);
    if (node) {
      const rect = canvasRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - node.x * zoom,
        y: rect.height / 2 - node.y * zoom
      });
    }
  };

  const handleOpenActiveNote = () => {
    if (inspectedNode) {
      openVaultNote(inspectedNode.id);
      if (onOpenNoteInEditor) {
        onOpenNoteInEditor(inspectedNode.id);
      } else {
        setCurrentScreen('notes');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden transition-colors">
      {/* 1. Top Knowledge Graph Control Bar */}
      <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: View Title & Subject Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary leading-none flex items-center gap-2">
                <span>Knowledge Graph</span>
                <Badge variant="primary" size="sm">
                  {graphData.nodes.length} Notes • {graphData.edges.length} Links
                </Badge>
              </h2>
            </div>
          </div>

          {/* Folder Category Filter */}
          <div className="flex items-center gap-1 bg-surface-secondary px-2 py-1 rounded-lg border border-border text-xs">
            <Folder className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              aria-label="Filter notes by folder"
              className="bg-transparent text-text-primary text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-text-primary">All Folders</option>
              {folders.map((f) => (
                <option key={f} value={f} className="bg-surface text-text-primary">
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph..."
              className="bg-surface-secondary border border-border pl-8 pr-3 py-1 rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand w-36 sm:w-48"
            />
          </div>
        </div>

        {/* Right: Zoom controls & Return to Editor */}
        <div className="flex items-center gap-2">
          {/* Zoom controls button group */}
          <div className="flex items-center bg-surface-secondary rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCenterOnSelected}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-brand transition-colors"
              title="Center on Selected Note"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Return to Normal Note Editor Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenActiveNote}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            className="text-xs shadow-glow"
          >
            <span>Open Note Editor</span>
          </Button>
        </div>
      </div>

      {/* 2. Interactive Canvas Surface */}
      <div className="flex-1 relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* 3. Floating Node Inspector Panel (Obsidian Graph Inspector Style) */}
        {inspectedNode && (
          <div className="absolute top-4 right-4 z-10 w-72 sm:w-80 bg-surface/95 backdrop-blur-md rounded-2xl border border-border p-4 shadow-elevated animate-in fade-in slide-in-from-right-4 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-border">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                  {inspectedNode.folderPath.join(' / ') || 'Study Vault'}
                </span>
                <h3 className="text-sm font-bold text-text-primary truncate" title={inspectedNode.title}>
                  {inspectedNode.title}
                </h3>
              </div>
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: graphData.folderColors[inspectedNode.primaryFolder] || '#3b82f6' }}
              />
            </div>

            {/* Connections count & list */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Direct Wiki Connections:</span>
                <span className="font-bold text-brand">{connectedEdges.length} Links</span>
              </div>

              {connectedEdges.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {connectedEdges.map((edge) => {
                    const otherTitle =
                      edge.source === inspectedNode.id ? edge.targetTitle : edge.sourceTitle;
                    const otherId =
                      edge.source === inspectedNode.id ? edge.target : edge.source;

                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => {
                          setSelectedNodeId(otherId);
                          openVaultNote(otherId);
                        }}
                        className="w-full text-left px-2 py-1 rounded bg-surface-secondary hover:bg-brand/10 hover:text-brand border border-border text-[11px] font-medium text-text-secondary flex items-center justify-between transition-colors group"
                      >
                        <span className="truncate">[[{otherTitle}]]</span>
                        <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-text-muted italic">
                  No internal wiki links yet. Use [[Note Title]] in the editor to connect concepts.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenActiveNote}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              className="w-full text-xs"
            >
              Open in Document Editor
            </Button>
          </div>
        )}

        {/* 4. Canvas Floating Controls Hint */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border text-[11px] text-text-muted shadow-2xs font-medium">
          <span>💡 Drag canvas to pan • Scroll to zoom • Drag nodes to reposition • Click to inspect</span>
        </div>
      </div>
    </div>
  );
};
