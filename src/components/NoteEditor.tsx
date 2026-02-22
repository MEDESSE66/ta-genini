import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Save, Trash2, Archive, Share2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import clsx from 'clsx';

interface NoteEditorProps {
  noteId: string | null;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, updateNote, archiveNote, deleteNote } = useStore();
  const note = notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setAiAnalysis(null); // Reset analysis on note switch
    }
  }, [noteId, note]);

  const handleSave = () => {
    if (noteId) {
      updateNote(noteId, { title, content });
    }
  };

  // Auto-save on unmount or change? 
  // For now, manual save or blur could work, but let's stick to simple onChange updates for local state
  // and a save button or auto-save effect.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (noteId && (title !== note?.title || content !== note?.content)) {
        updateNote(noteId, { title, content });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, content, noteId]);

  const handleAnalyze = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            setAiAnalysis("Clé API manquante. Configurez GEMINI_API_KEY.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey });
        
        // Prepare context from other notes for global linking
        const otherNotesContext = notes
            .filter(n => n.id !== noteId && !n.isArchived)
            .map(n => `- [${n.title}] (ID: ${n.id}) dans l'espace: ${n.workspaceId}`)
            .join('\n');

        const prompt = `Analyse la note suivante et identifie des connexions sémantiques avec les autres notes existantes de la base de connaissances.
        
        Note Actuelle:
        Titre: ${title}
        Contenu: ${content}
        
        Autres Notes Disponibles (Contexte Global):
        ${otherNotesContext}
        
        Tâche:
        1. Suggère 3 idées connexes ou extensions conceptuelles basées sur le contenu.
        2. Identifie explicitement les notes existantes (parmi la liste fournie) qui ont une forte résonance sémantique. Explique pourquoi en une phrase courte.
        
        Format de réponse: Markdown, concis, liste à puces.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-latest",
          contents: prompt,
        });
        
        if (response.text) {
          setAiAnalysis(response.text);
        } else {
          setAiAnalysis("Aucune analyse générée.");
        }
    } catch (error) {
        console.error("AI Error:", error);
        setAiAnalysis("Erreur lors de l'analyse IA.");
    } finally {
        setIsAnalyzing(false);
    }
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
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-xl font-bold text-zinc-100 focus:outline-none w-full mr-4 placeholder-zinc-600"
          placeholder="Titre de la note..."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors text-xs uppercase tracking-wider font-medium"
          >
            {isPreview ? 'Éditer' : 'Aperçu'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 rounded-md transition-colors"
            title="Analyse IA"
          >
            <Sparkles size={18} className={isAnalyzing ? "animate-pulse" : ""} />
          </button>
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
        <div className={clsx("flex-1 flex flex-col", aiAnalysis ? "w-2/3" : "w-full")}>
            {isPreview ? (
            <div className="flex-1 p-8 overflow-y-auto prose prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            ) : (
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-transparent p-8 resize-none focus:outline-none text-zinc-300 font-mono text-sm leading-relaxed"
                placeholder="Commencez à écrire..."
            />
            )}
        </div>

        {aiAnalysis && (
            <div className="w-80 border-l border-zinc-800 bg-zinc-900/20 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                        <Sparkles size={12} />
                        Analyse IA
                    </h3>
                    <button onClick={() => setAiAnalysis(null)} className="text-zinc-500 hover:text-zinc-300">&times;</button>
                </div>
                <div className="prose prose-invert prose-sm text-zinc-400">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
