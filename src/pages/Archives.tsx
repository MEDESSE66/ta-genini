import { useStore } from '../store/useStore';
import { Layout } from '../components/Layout';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Archive, RefreshCcw, Trash2 } from 'lucide-react';

export function Archives() {
  const { notes, updateNote, deleteNote } = useStore();
  const archivedNotes = notes.filter((n) => n.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleRestore = (id: string) => {
    updateNote(id, { isArchived: false });
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-zinc-800 rounded-full text-zinc-400">
                <Archive size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-zinc-100">Archives</h1>
                <p className="text-zinc-500">Notes retirées de l'espace de travail actif.</p>
            </div>
        </div>

        <div className="grid gap-4">
          {archivedNotes.map((note) => (
            <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-medium text-zinc-200 truncate">{note.title || 'Sans titre'}</h3>
                <p className="text-sm text-zinc-500 truncate mt-1">{note.content || 'Pas de contenu...'}</p>
                <span className="text-xs text-zinc-600 mt-2 block">
                  Modifié {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(note.id)}
                  className="p-2 text-zinc-400 hover:text-green-400 hover:bg-zinc-800 rounded-md transition-colors"
                  title="Restaurer"
                >
                  <RefreshCcw size={18} />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                  title="Supprimer définitivement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {archivedNotes.length === 0 && (
            <div className="text-center py-12 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg">
              Aucune note archivée.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
