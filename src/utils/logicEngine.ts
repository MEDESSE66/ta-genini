import { Note } from '../store/useStore';

export interface LogicRule {
  id: string;
  name: string;
  check: (note: Note) => boolean;
  message: string;
  actionLabel?: string;
}

export const LOGIC_RULES: LogicRule[] = [
  {
    id: 'title-length',
    name: 'Titre court',
    check: (note) => note.title.length < 5,
    message: 'Le titre est trop court pour être explicite.',
  },
  {
    id: 'content-empty',
    name: 'Contenu vide',
    check: (note) => note.content.length === 0,
    message: 'La note est vide. Ajoutez une description.',
  },
  {
    id: 'no-tags',
    name: 'Aucun tag',
    check: (note) => !note.tags || note.tags.length === 0,
    message: 'Aucun tag associé. Catégorisez cette idée.',
  },
  {
    id: 'raw-status',
    name: 'Statut Brut',
    check: (note) => note.status === 'raw' && note.content.length > 100,
    message: 'Le contenu est substantiel. Pensez à passer en statut "Incubation".',
  },
];

export function evaluateNote(note: Note): string[] {
  return LOGIC_RULES.filter(rule => rule.check(note)).map(rule => rule.message);
}

export function calculateProgress(note: Note): number {
  let score = 0;
  if (note.title.length > 5) score += 20;
  if (note.content.length > 50) score += 30;
  if (note.tags && note.tags.length > 0) score += 20;
  if (note.status !== 'raw') score += 30;
  return Math.min(score, 100);
}
