import { motion } from 'motion/react';
import { Archive, Folder, Plus, Settings, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useState } from 'react';
import { ExportModal } from './ExportModal';

export function Sidebar() {
  const { workspaces, currentWorkspaceId, setCurrentWorkspace, addWorkspace } = useStore();
  const location = useLocation();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleCreateWorkspace = () => {
    const name = prompt('Nom du nouvel espace de travail :');
    if (name) addWorkspace(name);
  };

  return (
    <>
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen text-zinc-400 font-sans"
      >
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-zinc-100 font-bold text-lg tracking-tight">Benin-Lab</h1>
          <p className="text-xs text-zinc-500 mt-1">Architecte de Connaissance</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
            Espaces de Travail
          </div>
          <div className="space-y-1 px-2">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setCurrentWorkspace(ws.id)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                  currentWorkspaceId === ws.id 
                    ? "bg-zinc-800 text-zinc-100" 
                    : "hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Folder size={16} />
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <button
              onClick={handleCreateWorkspace}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              <span>Nouvel Espace</span>
            </button>
          </div>

          <div className="mt-8 px-4 mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
            Navigation
          </div>
          <div className="space-y-1 px-2">
            <Link
              to="/"
              className={clsx(
                "w-full block px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                location.pathname === '/' 
                  ? "bg-zinc-800 text-zinc-100" 
                  : "hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <Folder size={16} />
              <span>Notes Actives</span>
            </Link>
            <Link
              to="/archives"
              className={clsx(
                "w-full block px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                location.pathname === '/archives' 
                  ? "bg-zinc-800 text-zinc-100" 
                  : "hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <Archive size={16} />
              <span>Archives</span>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 space-y-1">
          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-full px-2 py-2 rounded-md hover:bg-zinc-800/30"
          >
            <Download size={16} />
            <span>Exporter Données</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-full px-2 py-2 rounded-md hover:bg-zinc-800/30">
            <Settings size={16} />
            <span>Paramètres</span>
          </button>
        </div>
      </motion.aside>
      
      {isExportOpen && <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />}
    </>
  );
}

