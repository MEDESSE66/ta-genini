import { useStore, NoteStatus } from '../store/useStore';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Save, Trash2, Archive, Share2, Activity, Map, FileText, CheckCircle, Plus, X } from 'lucide-react';
import clsx from 'clsx';
import { evaluateNote, calculateProgress } from '../utils/logicEngine';
import { MindMap } from './MindMap';

import { ArrowLeft } from 'lucide-react';

interface NoteEditorProps {
  noteId: string | null;
  onBack?: () => void;
}

export function NoteEditor({ noteId, onBack }: NoteEditorProps) {
  const { notes, updateNote, archiveNote, deleteNote } = useStore();
  const note = notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'map'>('edit');
  const [logicMessages, setLogicMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setExamples(note.examples || []);
      const messages = evaluateNote(note);
      setLogicMessages(messages);
      setProgress(calculateProgress(note));
    }
  }, [noteId, note]);

  // Auto-save logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (noteId && (title !== note?.title || content !== note?.content || JSON.stringify(examples) !== JSON.stringify(note?.examples))) {
        updateNote(noteId, { title, content, examples });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, examples, noteId]);

  const handleStatusChange = (status: NoteStatus) => {
    if (noteId) updateNote(noteId, { status });
  };

  const addExample = () => {
    setExamples([...examples, '']);
  };

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const removeExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    setExamples(newExamples);
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
        <div className="flex-1 mr-4 flex items-center gap-2">
            {onBack && (
                <button onClick={onBack} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div className="flex-1">
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
        <div className={clsx("flex-1 flex flex-col relative overflow-y-auto", logicMessages.length > 0 ? "w-3/4" : "w-full")}>
            {viewMode === 'edit' && (
                <div className="flex flex-col min-h-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 bg-transparent p-8 resize-none focus:outline-none text-zinc-300 font-mono text-sm leading-relaxed min-h-[50vh]"
                        placeholder="Commencez à écrire..."
                        spellCheck={true}
                        lang="fr"
                    />
                    
                    <div className="p-4 md:p-8 pt-0 border-t border-zinc-800/50 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={() => setShowExamples(!showExamples)}
                                className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 hover:text-zinc-200 transition-colors"
                            >
                                <span>Exemples Concrets ({examples.length})</span>
                                <span className={clsx("transition-transform", showExamples ? "rotate-180" : "")}>
                                    ▼
                                </span>
                            </button>
                            {showExamples && (
                                <button 
                                    onClick={addExample}
                                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-900/20 px-3 py-1.5 rounded-full border border-indigo-500/30"
                                >
                                    <Plus size={14} />
                                    Ajouter
                                </button>
                            )}
                        </div>
                        
                        {showExamples && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                {examples.map((ex, idx) => (
                                    <div key={idx} className="flex gap-3 items-start group bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                        <span className="text-zinc-500 font-mono text-xs mt-2 bg-zinc-800 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                                        <textarea
                                            value={ex}
                                            onChange={(e) => updateExample(idx, e.target.value)}
                                            className="flex-1 bg-transparent text-zinc-300 text-sm focus:outline-none min-h-[60px] resize-y placeholder-zinc-600"
                                            placeholder={`Décrivez l'exemple #${idx + 1}...`}
                                        />
                                        <button 
                                            onClick={() => removeExample(idx)}
                                            className="text-zinc-600 hover:text-red-400 p-1 rounded hover:bg-red-900/10 transition-colors"
                                            title="Supprimer l'exemple"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {examples.length === 0 && (
                                    <div className="text-zinc-600 text-sm italic border border-dashed border-zinc-800 rounded-lg p-6 text-center bg-zinc-900/20">
                                        Aucun exemple pour le moment. Ajoutez-en un pour illustrer votre idée.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {viewMode === 'preview' && (
                <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                    {examples.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-zinc-800">
                            <h3 className="text-xl font-bold text-zinc-200 mb-4">Exemples Concrets</h3>
                            {examples.map((ex, idx) => (
                                <div key={idx} className="mb-6 bg-zinc-900/30 p-4 rounded-lg border-l-2 border-indigo-500">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Exemple #{idx + 1}</span>
                                    <div className="whitespace-pre-wrap text-zinc-300">{ex}</div>
                                </div>
                            ))}
                        </div>
                    )}
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
