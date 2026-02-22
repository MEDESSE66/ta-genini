import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';

interface MindMapProps {
  noteId: string;
}

export function MindMap({ noteId }: MindMapProps) {
  const { notes, linkNotes } = useStore();
  const currentNote = notes.find(n => n.id === noteId);
  
  // Initial nodes based on current note and linked notes
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  if (currentNote) {
    initialNodes.push({
      id: currentNote.id,
      position: { x: 250, y: 250 },
      data: { label: currentNote.title },
      type: 'input', // Central node
      style: { background: '#3f3f46', color: '#fff', border: '1px solid #71717a', borderRadius: '8px', padding: '10px' }
    });

    currentNote.linkedNoteIds.forEach((linkedId, index) => {
      const linkedNote = notes.find(n => n.id === linkedId);
      if (linkedNote) {
        const angle = (index / currentNote.linkedNoteIds.length) * 2 * Math.PI;
        const radius = 200;
        initialNodes.push({
          id: linkedNote.id,
          position: { 
            x: 250 + radius * Math.cos(angle), 
            y: 250 + radius * Math.sin(angle) 
          },
          data: { label: linkedNote.title },
          style: { background: '#18181b', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px' }
        });
        initialEdges.push({
          id: `e-${currentNote.id}-${linkedNote.id}`,
          source: currentNote.id,
          target: linkedNote.id,
          animated: true,
          style: { stroke: '#6366f1' }
        });
      }
    });
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when noteId changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [noteId, notes]);

  const onConnect = useCallback(
    (params: Connection) => {
        setEdges((eds) => addEdge(params, eds));
        if (params.source && params.target) {
            linkNotes(params.source, params.target);
        }
    },
    [setEdges, linkNotes],
  );

  return (
    <div className="w-full h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Background color="#27272a" gap={16} />
        <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400" />
      </ReactFlow>
    </div>
  );
}
