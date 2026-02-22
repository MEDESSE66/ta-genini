import { useStore, NoteStatus } from '../store/useStore';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Save, Trash2, Archive, Share2, Activity, Map, FileText, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { evaluateNote, calculateProgress } from '../utils/logicEngine';
import { MindMap } from './MindMap';

interface NoteEditorProps {
  noteId: string | null;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote, archiveNote, deleteNote } = useStore();
  const note = notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'map'>('edit');
  const [logicMessages, setLogicMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      const messages = evaluateNote(note);
      setLogicMessages(messages);
      setProgress(calculateProgress(note));
    }
  }, [noteId, note]);

  // Auto-save logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (noteId && (title !== note?.title || content !== note?.content)) {
        updateNote(noteId, { title, content });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, noteId]);

  const handleStatusChange = (status: NoteStatus) => {
    if (noteId) updateNote(noteId, { status });
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        Sélectionnez une note ou créez-en une nouvelle.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
        <div className="flex-1 mr-4">
            <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-xl font-bold text-zinc-100 focus:outline-none w-full placeholder-zinc-600"
            placeholder="Titre de la note..."
            spellCheck={true}
            lang="fr"
            />
            <div className="flex items-center gap-2 mt-1">
                <span className={clsx(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                    note.status === 'raw' ? "border-zinc-700 text-zinc-500" :
                    note.status === 'incubating' ? "border-yellow-900 text-yellow-500" :
                    note.status === 'refined' ? "border-blue-900 text-blue-500" :
                    "border-green-900 text-green-500"
                )}>
                    {note.status}
                </span>
                <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 rounded-md p-1 mr-2 border border-zinc-800">
            <button
                onClick={() => setViewMode('edit')}
                className={clsx("p-1.5 rounded transition-colors", viewMode === 'edit' ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}
                title="Éditeur"
            >
                <FileText size={16} />
            </button>
            <button
                onClick={() => setViewMode('preview')}
                className={clsx("p-1.5 rounded transition-colors", viewMode === 'preview' ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}
                title="Aperçu Markdown"
            >
                <Activity size={16} />
            </button>
            <button
                onClick={() => setViewMode('map')}
                className={clsx("p-1.5 rounded transition-colors", viewMode === 'map' ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}
                title="Carte Mentale"
            >
                <Map size={16} />
            </button>
          </div>

          <button
            onClick={() => archiveNote(note.id)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
            title="Archiver"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={clsx("flex-1 flex flex-col relative", logicMessages.length > 0 ? "w-3/4" : "w-full")}>
            {viewMode === 'edit' && (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 bg-transparent p-8 resize-none focus:outline-none text-zinc-300 font-mono text-sm leading-relaxed"
                    placeholder="Commencez à écrire..."
                    spellCheck={true}
                    lang="fr"
                />
            )}
            {viewMode === 'preview' && (
                <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            )}
            {viewMode === 'map' && (
                <MindMap noteId={note.id} />
            )}
        </div>

        {/* Logic / Workflow Sidebar */}
        <div className="w-72 border-l border-zinc-800 bg-zinc-900/20 flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Workflow</h3>
                <div className="space-y-2">
                    {(['raw', 'incubating', 'refined', 'completed'] as NoteStatus[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={clsx(
                                "w-full text-left px-3 py-2 rounded text-xs font-medium border transition-all flex items-center justify-between",
                                note.status === s 
                                    ? "bg-indigo-900/20 border-indigo-500/50 text-indigo-300" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                            )}
                        >
                            <span className="capitalize">{s}</span>
                            {note.status === s && <CheckCircle size={12} />}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Recommandations</h3>
                {logicMessages.length > 0 ? (
                    <ul className="space-y-3">
                        {logicMessages.map((msg, idx) => (
                            <li key={idx} className="text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded border border-zinc-800/50 flex gap-2">
                                <div className="w-1 h-full bg-yellow-500/50 rounded-full shrink-0" />
                                {msg}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-xs text-zinc-600 italic text-center py-4">
                        Aucune action requise. Continuez !
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
