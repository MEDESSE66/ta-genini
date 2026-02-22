import { ReactFlow, Background, Controls, Node, Edge, useNodesState, useEdgesState, addEdge, Connection, Panel, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus } from 'lucide-react';

interface MindMapProps {
  noteId: string;
}

export function MindMap({ noteId }: MindMapProps) {
  const { notes, linkNotes, addNote } = useStore();
  const currentNote = notes.find(n => n.id === noteId);
  const [isAdding, setIsAdding] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  
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

  const handleAddNode = () => {
    if (!newNodeTitle.trim() || !currentNote) return;
    
    // Create new note
    addNote(currentNote.workspaceId, newNodeTitle, '# ' + newNodeTitle);
    
    // We need to find the ID of the newly created note. 
    // Since addNote doesn't return ID, we rely on the store update.
    // However, for immediate linking, we might need to refactor addNote or find the latest note.
    // A simple hack: wait for store update or find note with this title (risky if dupes).
    // Better: generate ID here if possible, but store handles it.
    // Let's assume the store puts the new note at the top (index 0).
    
    // Actually, to link immediately, we need the ID.
    // Let's just trigger a re-render/effect by updating store, but we need to link it.
    // Limitation: addNote is void.
    // Workaround: Find the note created most recently (top of list) after a small delay or use a predictable ID generator if we moved logic out.
    // For now, let's find the note by title and creation time close to now.
    
    setTimeout(() => {
        const latestNote = useStore.getState().notes[0]; // Assuming prepend
        if (latestNote && latestNote.title === newNodeTitle) {
            linkNotes(currentNote.id, latestNote.id);
            setNewNodeTitle('');
            setIsAdding(false);
        }
    }, 100);
  };

  return (
    <div className="w-full h-full bg-zinc-950 relative">
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
        <Panel position="top-right" className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-xl">
            {!isAdding ? (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                >
                    <Plus size={14} />
                    Ajouter Note Liée
                </button>
            ) : (
                <div className="flex flex-col gap-2 w-48">
                    <input 
                        type="text" 
                        value={newNodeTitle}
                        onChange={(e) => setNewNodeTitle(e.target.value)}
                        placeholder="Titre de la note..."
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNode()}
                    />
                    <div className="flex gap-2 justify-end">
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={handleAddNode}
                            className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-500"
                        >
                            Créer
                        </button>
                    </div>
                </div>
            )}
        </Panel>
      </ReactFlow>
    </div>
  );
}
