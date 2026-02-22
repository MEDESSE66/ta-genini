import { useState } from 'react';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';
import { Layout } from '../components/Layout';

export function Workspace() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="flex h-full">
        <NoteList selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />
        <div className="flex-1 h-full overflow-hidden">
            {selectedNoteId ? (
                <NoteEditor noteId={selectedNoteId} />
            ) : (
                <div className="flex items-center justify-center h-full text-zinc-600">
                    <p>Sélectionnez une note pour commencer.</p>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
