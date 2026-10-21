import { DayNote } from '../types';

/** Apply saved drag order; notes without an entry keep stable fallback by createdAt (newer first). */
export function sortNotesByCustomOrder(notes: DayNote[], orderIds: string[]): DayNote[] {
  if (!orderIds.length) {
    return [...notes].sort((a, b) => b.createdAt - a.createdAt);
  }
  const rank = new Map(orderIds.map((id, index) => [id, index]));
  return [...notes].sort((a, b) => {
    const rankA = rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const rankB = rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return b.createdAt - a.createdAt;
  });
}

export function syncNoteOrder(orderIds: string[], notes: DayNote[]): string[] {
  const ids = new Set(notes.map(n => n.id));
  const cleaned = orderIds.filter(id => ids.has(id));
  for (const note of notes) {
    if (!cleaned.includes(note.id)) cleaned.push(note.id);
  }
  return cleaned;
}

export function noteOrderFromNotes(notes: DayNote[]): string[] {
  return [...notes].sort((a, b) => b.createdAt - a.createdAt).map(n => n.id);
}
