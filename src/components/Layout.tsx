import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-hidden relative flex flex-col w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-zinc-800 rounded">
                <Menu size={20} className="text-zinc-400" />
            </button>
            <span className="font-bold text-sm tracking-tight text-zinc-200">Benin-Lab</span>
            <div className="w-6" /> {/* Spacer for centering */}
        </div>
        {children}
      </main>
    </div>
  );
}
