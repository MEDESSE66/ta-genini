import { useStore } from '../store/useStore';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';

interface NoteListProps {
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export function NoteList({ selectedNoteId, onSelectNote }: NoteListProps) {
  const { notes, currentWorkspaceId, addNote } = useStore();
  const [search, setSearch] = useState('');

  const filteredNotes = notes
    .filter(
      (n) =>
        n.workspaceId === currentWorkspaceId &&
        !n.isArchived &&
        (n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.content.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleCreateNote = () => {
    if (currentWorkspaceId) {
      const exampleContent = `# Idée Principale

## Contexte
Décrivez le contexte ici...

## Points Clés
- Point 1
- Point 2

## Actions
- [ ] À faire`;
      addNote(currentWorkspaceId, 'Nouvelle Note', exampleContent);
    }
  };

  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Notes</h2>
        <button
          onClick={handleCreateNote}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-9 pr-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600 placeholder-zinc-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={clsx(
              "w-full text-left p-3 rounded-md transition-all group",
              selectedNoteId === note.id
                ? "bg-zinc-800 border-l-2 border-indigo-500"
                : "hover:bg-zinc-800/30 border-l-2 border-transparent"
            )}
          >
            <h3 className={clsx(
              "font-medium text-sm truncate",
              selectedNoteId === note.id ? "text-zinc-100" : "text-zinc-300 group-hover:text-zinc-200"
            )}>
              {note.title || 'Sans titre'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 truncate">
              {note.content || 'Pas de contenu...'}
            </p>
            <span className="text-[10px] text-zinc-600 mt-2 block">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: fr })}
            </span>
          </button>
        ))}
        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-sm">
            Aucune note trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
