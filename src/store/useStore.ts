import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type NoteStatus = 'raw' | 'incubating' | 'refined' | 'completed';

export interface Note {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  linkedNoteIds: string[];
  status: NoteStatus;
  progress: number; // 0 to 100
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

interface AppState {
  workspaces: Workspace[];
  notes: Note[];
  currentWorkspaceId: string | null;
  
  // Actions
  addWorkspace: (name: string, description?: string) => void;
  setCurrentWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  
  addNote: (workspaceId: string, title: string, content: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  archiveNote: (id: string) => void;
  deleteNote: (id: string) => void;
  
  // Linking
  linkNotes: (sourceId: string, targetId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      workspaces: [
        { id: 'default', name: 'Benin-Heritage', description: 'Espace par défaut' },
        { id: 'personal', name: 'Projets-Perso', description: 'Projets personnels' },
        { id: 'research', name: 'Recherche-Libre', description: 'Exploration et veille' },
      ],
      notes: [],
      currentWorkspaceId: 'default',

      addWorkspace: (name, description) => set((state) => ({
        workspaces: [...state.workspaces, { id: uuidv4(), name, description }],
      })),

      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

      deleteWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        notes: state.notes.filter((n) => n.workspaceId !== id),
        currentWorkspaceId: state.currentWorkspaceId === id ? state.workspaces[0]?.id || null : state.currentWorkspaceId,
      })),

      addNote: (workspaceId, title, content) => set((state) => ({
        notes: [
          {
            id: uuidv4(),
            title,
            content,
            workspaceId,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchived: false,
            linkedNoteIds: [],
            status: 'raw',
            progress: 0,
          },
          ...state.notes,
        ],
      })),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        ),
      })),

      archiveNote: (id) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, isArchived: true, updatedAt: new Date().toISOString() } : n
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),

      linkNotes: (sourceId, targetId) => set((state) => ({
        notes: state.notes.map((n) => {
          if (n.id === sourceId && !n.linkedNoteIds.includes(targetId)) {
            return { ...n, linkedNoteIds: [...n.linkedNoteIds, targetId] };
          }
          if (n.id === targetId && !n.linkedNoteIds.includes(sourceId)) {
            return { ...n, linkedNoteIds: [...n.linkedNoteIds, sourceId] };
          }
          return n;
        }),
      })),
    }),
    {
      name: 'benin-lab-storage',
    }
  )
);
