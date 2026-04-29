import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Ic, Btn, Badge } from './ui';
import type { MindMapData, MindMapNode } from '../pages/api/sessions/mindmap';

// ── Branch colour palette ─────────────────────────────────────────────────────
const BRANCH_COLORS = [
  '#7B5CF5', '#60A5FA', '#4ADE80', '#F0A030',
  '#F472B6', '#9D82FF', '#34D399', '#FB923C',
];

// ── Node data shape ───────────────────────────────────────────────────────────
interface MindNodeData extends Record<string, unknown> {
  label:       string;
  color:       string;
  nodeType:    'root' | 'branch' | 'leaf';
  parentLabel?: string;
  childCount:  number;
}

// ── Invisible handle helper (all 4 sides so edges can route any direction) ────
function AllHandles({ color }: { color: string }) {
  const s: React.CSSProperties = {
    background: color,
    width: 8, height: 8,
    border: `2px solid ${color}`,
    borderRadius: '50%',
    opacity: 0,            // invisible — just needed for edge routing
  };
  return (
    <>
      <Handle type="source" position={Position.Top}    id="st" style={s} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} id="sb" style={s} isConnectable={false} />
      <Handle type="source" position={Position.Left}   id="sl" style={s} isConnectable={false} />
      <Handle type="source" position={Position.Right}  id="sr" style={s} isConnectable={false} />
      <Handle type="target" position={Position.Top}    id="tt" style={s} isConnectable={false} />
      <Handle type="target" position={Position.Bottom} id="tb" style={s} isConnectable={false} />
      <Handle type="target" position={Position.Left}   id="tl" style={s} isConnectable={false} />
      <Handle type="target" position={Position.Right}  id="tr" style={s} isConnectable={false} />
    </>
  );
}

// ── Custom node components ────────────────────────────────────────────────────

function RootNode({ data, selected }: NodeProps) {
  const d = data as MindNodeData;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${d.color}30 0%, ${d.color}12 100%)`,
      border: `2.5px solid ${selected ? d.color : d.color + 'cc'}`,
      borderRadius: 20,
      padding: '16px 24px',
      minWidth: 160, maxWidth: 220,
      textAlign: 'center',
      boxShadow: selected
        ? `0 0 40px ${d.color}70, 0 4px 24px rgba(0,0,0,0.5)`
        : `0 0 24px ${d.color}35, 0 4px 16px rgba(0,0,0,0.4)`,
      cursor: 'pointer',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    }}>
      <AllHandles color={d.color} />
      <div style={{
        fontFamily: 'var(--font-heading, system-ui)',
        fontWeight: 800, fontSize: 15,
        color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3,
      }}>
        {d.label}
      </div>
      <div style={{ fontSize: 10, color: d.color, marginTop: 5, fontWeight: 600, opacity: 0.8 }}>
        ROOT TOPIC
      </div>
    </div>
  );
}

function BranchNode({ data, selected }: NodeProps) {
  const d = data as MindNodeData;
  return (
    <div style={{
      background: selected ? `${d.color}28` : `${d.color}14`,
      border: `2px solid ${selected ? d.color : d.color + '70'}`,
      borderRadius: 14,
      padding: '10px 16px',
      minWidth: 110, maxWidth: 170,
      textAlign: 'center',
      boxShadow: selected
        ? `0 0 24px ${d.color}50, 0 2px 12px rgba(0,0,0,0.35)`
        : `0 2px 8px rgba(0,0,0,0.2)`,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
    }}>
      <AllHandles color={d.color} />
      <div style={{
        fontFamily: 'var(--font-heading, system-ui)',
        fontWeight: 700, fontSize: 13, color: d.color, lineHeight: 1.4,
      }}>
        {d.label}
      </div>
    </div>
  );
}

function LeafNode({ data, selected }: NodeProps) {
  const d = data as MindNodeData;
  return (
    <div style={{
      background: selected ? `${d.color}16` : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${selected ? d.color + '90' : d.color + '40'}`,
      borderRadius: 10,
      padding: '7px 12px',
      minWidth: 90, maxWidth: 155,
      textAlign: 'center',
      boxShadow: selected ? `0 0 14px ${d.color}40` : 'none',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
    }}>
      <AllHandles color={d.color} />
      <div style={{
        fontFamily: 'var(--font-heading, system-ui)',
        fontWeight: 500, fontSize: 11.5,
        color: selected ? '#fff' : 'rgba(255,255,255,0.78)',
        lineHeight: 1.45,
      }}>
        {d.label}
      </div>
    </div>
  );
}

const NODE_TYPES: NodeTypes = {
  mindRoot:   RootNode   as unknown as NodeTypes[string],
  mindBranch: BranchNode as unknown as NodeTypes[string],
  mindLeaf:   LeafNode   as unknown as NodeTypes[string],
};

// ── Layout engine ─────────────────────────────────────────────────────────────
function buildRadialLayout(aiNodes: MindMapNode[]): { nodes: Node[]; edges: Edge[] } {
  const root = aiNodes.find(n => n.type === 'root');
  if (!root) return { nodes: [], edges: [] };

  const childMap: Record<string, MindMapNode[]> = {};
  for (const n of aiNodes) {
    if (!n.parentId) continue;
    (childMap[n.parentId] ??= []).push(n);
  }

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];
  const branches = childMap[root.id] ?? [];

  // Root node
  rfNodes.push({
    id: root.id, type: 'mindRoot',
    position: { x: 0, y: 0 },
    data: {
      label: root.label, color: '#7B5CF5',
      nodeType: 'root', childCount: branches.length,
    } satisfies MindNodeData,
  });

  const BRANCH_R = 320;
  const LEAF_R   = 580;

  branches.forEach((branch, bi) => {
    const color = BRANCH_COLORS[bi % BRANCH_COLORS.length];
    const angle = (2 * Math.PI * bi) / branches.length - Math.PI / 2;
    const bx    = Math.cos(angle) * BRANCH_R;
    const by    = Math.sin(angle) * BRANCH_R;
    const leaves = childMap[branch.id] ?? [];

    rfNodes.push({
      id: branch.id, type: 'mindBranch',
      position: { x: bx, y: by },
      data: {
        label: branch.label, color,
        nodeType: 'branch',
        parentLabel: root.label,
        childCount: leaves.length,
      } satisfies MindNodeData,
    });

    rfEdges.push({
      id: `e-${root.id}-${branch.id}`,
      source: root.id, target: branch.id,
      type: 'default',
      style: { stroke: color, strokeWidth: 2.5, opacity: 0.75 },
    });

    leaves.forEach((leaf, li) => {
      const spread    = (Math.PI * 0.5) / Math.max(leaves.length, 1);
      const halfSpread = (spread * (leaves.length - 1)) / 2;
      const leafAngle  = angle + spread * li - halfSpread;
      const lx = Math.cos(leafAngle) * LEAF_R;
      const ly = Math.sin(leafAngle) * LEAF_R;

      rfNodes.push({
        id: leaf.id, type: 'mindLeaf',
        position: { x: lx, y: ly },
        data: {
          label: leaf.label, color,
          nodeType: 'leaf',
          parentLabel: branch.label,
          childCount: 0,
        } satisfies MindNodeData,
      });

      rfEdges.push({
        id: `e-${branch.id}-${leaf.id}`,
        source: branch.id, target: leaf.id,
        type: 'default',
        style: { stroke: color, strokeWidth: 1.5, opacity: 0.5 },
      });
    });
  });

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Node info panel ───────────────────────────────────────────────────────────
function NodeInfoPanel({
  node, onClose,
}: {
  node: Node;
  onClose: () => void;
}) {
  const d = node.data as MindNodeData;
  const typeLabel =
    d.nodeType === 'root'   ? 'Root Topic'   :
    d.nodeType === 'branch' ? 'Main Branch'  : 'Concept';
  const typeColor =
    d.nodeType === 'root'   ? 'purple' :
    d.nodeType === 'branch' ? 'blue'   : 'green';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${d.color}50`,
      borderRadius: 16,
      padding: '16px 18px',
      minWidth: 220, maxWidth: 280,
      boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${d.color}20`,
      animation: 'fadeIn 0.15s ease',
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${d.color}20`, border: `1.5px solid ${d.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ic
            n={d.nodeType === 'root' ? 'sparkles' : d.nodeType === 'branch' ? 'book' : 'target'}
            size={17}
            color={d.color}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Ic n="x" size={14} color="var(--text-muted)" />
        </button>
      </div>

      {/* Type badge */}
      <div style={{ marginBottom: 8 }}>
        <Badge color={typeColor} sm>{typeLabel}</Badge>
      </div>

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
        color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 10,
      }}>
        {d.label}
      </div>

      {/* Meta info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {d.parentLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n="right" size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Under <strong style={{ color: d.color }}>{d.parentLabel}</strong>
            </span>
          </div>
        )}
        {d.childCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n="cards" size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{d.childCount}</strong> sub-concept{d.childCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {d.childCount === 0 && d.nodeType === 'leaf' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic n="gem" size={12} color={d.color} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Key concept</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ title }: { title?: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40,
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.08)} }
      `}</style>
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(123,92,245,0.3)', animation: 'pulse-ring 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: '2px solid rgba(96,165,250,0.3)', animation: 'pulse-ring 2s ease-in-out infinite 0.4s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid transparent', borderTopColor: '#7B5CF5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Generating Mind Map…
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          AI is mapping {title ? `"${title}"` : 'your session'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, opacity: 0.45 }}>
        {['Topic', 'Branch A', 'Branch B', 'Concept'].map((t, i) => (
          <div key={i} style={{
            padding: '5px 11px', borderRadius: 8,
            background: BRANCH_COLORS[i] + '20', border: `1px solid ${BRANCH_COLORS[i]}40`,
            fontSize: 11, color: BRANCH_COLORS[i], fontFamily: 'var(--font-heading)',
            animation: `pulse-ring 2s ease-in-out infinite ${i * 0.18}s`,
          }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MindMapView({ sessionId }: { sessionId?: string }) {
  const [phase,     setPhase]     = useState<'loading' | 'error' | 'ready'>('loading');
  const [error,     setError]     = useState<string | null>(null);
  const [title,     setTitle]     = useState('');
  const [nodeCount, setNodeCount] = useState(0);
  const [cached,    setCached]    = useState(false);
  const [selected,  setSelected]  = useState<Node | null>(null);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // ── Load data ───────────────────────────────────────────────────────────────
  function loadMindMap(sessTitle: string, summary?: string, objectives?: string[], subtopics?: string[]) {
    const cKey = `sb_mm_${sessionId}`;
    const cached = (() => { try { const r = localStorage.getItem(cKey); return r ? JSON.parse(r) : null; } catch { return null; } })();
    if (cached) {
      const { nodes, edges } = buildRadialLayout((cached as MindMapData).nodes);
      setRfNodes(nodes); setRfEdges(edges);
      setNodeCount((cached as MindMapData).nodes.length);
      setCached(true); setPhase('ready'); return;
    }

    fetch('/api/sessions/mindmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, title: sessTitle, summary, learningObjectives: objectives, subtopics }),
    })
      .then(r => r.json())
      .then((data: { mindmap?: MindMapData; cached?: boolean; error?: string }) => {
        if (data.error) throw new Error(data.error);
        try { localStorage.setItem(cKey, JSON.stringify(data.mindmap)); } catch { /* */ }
        const { nodes, edges } = buildRadialLayout(data.mindmap!.nodes);
        setRfNodes(nodes); setRfEdges(edges);
        setNodeCount(data.mindmap!.nodes.length);
        setCached(data.cached ?? false); setPhase('ready');
      })
      .catch(err => { setError(err.message); setPhase('error'); });
  }

  useEffect(() => {
    if (!sessionId) { setError('No session ID provided. Open this from a study session.'); setPhase('error'); return; }
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then((ctx: { error?: string; allSessions?: Array<{ id: string; title: string; summary?: string; learningObjectives?: string[]; subtopics?: string[] }> }) => {
        if (ctx.error) throw new Error(ctx.error);
        const sess = ctx.allSessions?.find(s => s.id === sessionId) ?? ctx.allSessions?.[0];
        if (!sess) throw new Error('Session not found.');
        setTitle(sess.title);
        loadMindMap(sess.title, sess.summary, sess.learningObjectives, sess.subtopics);
      })
      .catch(err => { setError(err instanceof Error ? err.message : 'Failed to load.'); setPhase('error'); });
  }, [sessionId]);

  // ── Regenerate ──────────────────────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    if (!sessionId) return;
    try { localStorage.removeItem(`sb_mm_${sessionId}`); } catch { /* */ }
    setSelected(null); setPhase('loading');
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then((ctx: { allSessions?: Array<{ id: string; title: string; summary?: string; learningObjectives?: string[]; subtopics?: string[] }> }) => {
        const sess = ctx.allSessions?.find(s => s.id === sessionId) ?? ctx.allSessions?.[0];
        if (!sess) throw new Error('Session not found.');
        return fetch('/api/sessions/mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: '', title: sess.title, summary: sess.summary, learningObjectives: sess.learningObjectives, subtopics: sess.subtopics }),
        });
      })
      .then(r => r.json())
      .then((data: { mindmap?: MindMapData; error?: string }) => {
        if (data.error) throw new Error(data.error);
        try { localStorage.setItem(`sb_mm_${sessionId}`, JSON.stringify(data.mindmap)); } catch { /* */ }
        const { nodes, edges } = buildRadialLayout(data.mindmap!.nodes);
        setRfNodes(nodes); setRfEdges(edges);
        setNodeCount(data.mindmap!.nodes.length); setCached(false); setPhase('ready');
      })
      .catch(err => { setError(err.message); setPhase('error'); });
  }, [sessionId]);

  // ── Node click ──────────────────────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(prev => prev?.id === node.id ? null : node);
  }, []);

  const onPaneClick = useCallback(() => setSelected(null), []);

  // ── Error ───────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
        <Ic n="x" size={28} color="var(--red)" />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320 }}>{error}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn v="ghost" size="sm" onClick={() => history.back()}><Ic n="left" size={13} /> Go Back</Btn>
          {sessionId && <Btn v="primary" size="sm" onClick={handleRegenerate}><Ic n="refresh" size={13} color="#fff" /> Retry</Btn>}
        </div>
      </div>
    );
  }

  if (phase === 'loading') return <LoadingScreen title={title || undefined} />;

  // ── Canvas ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        .react-flow__background { opacity: 0.35; }
        .react-flow__controls { background: var(--bg-elevated) !important; border: 1px solid var(--border) !important; border-radius: 10px !important; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important; }
        .react-flow__controls-button { background: transparent !important; border: none !important; border-bottom: 1px solid var(--border) !important; color: var(--text-secondary) !important; }
        .react-flow__controls-button:hover { background: var(--bg-card) !important; }
        .react-flow__controls-button:last-child { border-bottom: none !important; }
        .react-flow__controls-button svg { fill: var(--text-secondary) !important; }
        .react-flow__minimap { background: var(--bg-elevated) !important; border: 1px solid var(--border) !important; border-radius: 10px !important; }
        .react-flow__minimap-mask { fill: rgba(4,6,20,0.7) !important; }
        .react-flow__attribution { display: none !important; }
        .react-flow__edge-path { transition: stroke-width 0.15s; }
        .react-flow__node:hover .react-flow__node-mindLeaf > div,
        .react-flow__node:hover .react-flow__node-mindBranch > div { filter: brightness(1.1); }
      `}</style>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 20px', background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Btn v="ghost" size="sm" onClick={() => sessionId
            ? window.location.href = `/platform/session?sessionId=${sessionId}`
            : history.back()}>
            <Ic n="left" size={13} /> Session
          </Btn>
          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
          <Ic n="sparkles" size={16} color="#4ADE80" />
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
            color: 'var(--text-primary)',
            maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge color="green"  sm>{nodeCount} concepts</Badge>
          {cached && <Badge color="purple" sm>Cached</Badge>}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click a node for details</span>
          <Btn v="ghost" size="sm" onClick={handleRegenerate}>
            <Ic n="refresh" size={13} /> Regenerate
          </Btn>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={NODE_TYPES}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.15}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(255,255,255,0.06)" />
          <Controls showInteractive={false} />
          <MiniMap zoomable pannable nodeStrokeWidth={3} style={{ bottom: 20, right: 20 }} />

          {/* Legend */}
          <Panel position="top-right">
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '11px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Legend
              </div>
              {[
                { label: 'Root Topic',  color: '#7B5CF5', rx: 10 },
                { label: 'Main Branch', color: '#60A5FA', rx: 7  },
                { label: 'Concept',     color: 'rgba(255,255,255,0.5)', rx: 5 },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 13, height: 13, borderRadius: item.rx, background: item.color + '25', border: `1.5px solid ${item.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                🖱 Drag to move nodes<br />
                ⚲ Scroll to zoom<br />
                👆 Click node for info
              </div>
            </div>
          </Panel>

          {/* Node info panel */}
          {selected && (
            <Panel position="bottom-left">
              <NodeInfoPanel node={selected} onClose={() => setSelected(null)} />
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}
