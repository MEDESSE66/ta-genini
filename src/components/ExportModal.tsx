import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { notes, workspaces } = useStore();
  const [format, setFormat] = useState<'json' | 'markdown'>('json');

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      workspaces,
      notes,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `benin-lab-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Markdown Export (Zip would be better, but single file for now)
      let mdContent = `# Benin-Lab Export\n\nGenerated: ${new Date().toISOString()}\n\n`;
      
      workspaces.forEach(ws => {
        mdContent += `## Workspace: ${ws.name}\n\n`;
        const wsNotes = notes.filter(n => n.workspaceId === ws.id);
        wsNotes.forEach(note => {
          mdContent += `### ${note.title}\n\n${note.content}\n\n---\n\n`;
        });
      });

      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `benin-lab-export-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-zinc-100">Exporter les Données</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormat('json')}
                    className={`p-4 rounded-md border text-center transition-colors ${
                      format === 'json'
                        ? 'bg-indigo-900/20 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <span className="block font-mono font-bold text-lg mb-1">JSON</span>
                    <span className="text-xs opacity-70">Backup complet</span>
                  </button>
                  <button
                    onClick={() => setFormat('markdown')}
                    className={`p-4 rounded-md border text-center transition-colors ${
                      format === 'markdown'
                        ? 'bg-indigo-900/20 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <span className="block font-mono font-bold text-lg mb-1">MD</span>
                    <span className="text-xs opacity-70">Lisible</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Download size={18} />
                Exporter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
