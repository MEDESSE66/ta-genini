import { useState } from 'react';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';
import { Layout } from '../components/Layout';
import clsx from 'clsx';

export function Workspace() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="flex h-full relative">
        <div className={clsx(
            "h-full w-full md:w-auto transition-transform duration-300 absolute md:relative z-10 bg-zinc-950 md:bg-transparent",
            selectedNoteId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}>
            <NoteList selectedNoteId={selectedNoteId} onSelectNote={setSelectedNoteId} />
        </div>
        <div className={clsx(
            "flex-1 h-full overflow-hidden w-full absolute md:relative z-0",
            selectedNoteId ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
            {selectedNoteId ? (
                <NoteEditor noteId={selectedNoteId} onBack={() => setSelectedNoteId(null)} />
            ) : (
                <div className="hidden md:flex items-center justify-center h-full text-zinc-600">
                    <p>Sélectionnez une note pour commencer.</p>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
