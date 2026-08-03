import React, { useRef } from 'react';
import { Plus, Check, FileText } from 'lucide-react';
import { DayNote } from '../types';
import { ThemeId } from '../utils/themeTypes';

interface NotesSectionProps {
  selectedDate: string;
  notes: DayNote[];
  theme: ThemeId;
  onAddNote: () => void;
  onEditNote: (note: DayNote) => void;
  onOpenStorage: () => void;
}

interface ThemeStyles {
  outerBg: string;
  cardBg: string;
  cardHoverBg: string;
  plusBtnBg: string;
  plusBtnHoverBg: string;
  plusBtnText: string;
  headerIconBg: string;
  headerIconColor: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
}

const themeStylesMap: Record<ThemeId, ThemeStyles> = {
  standard: {
    outerBg: 'bg-[#D1D9CA]',
    cardBg: 'bg-[#E3EAE0]/90',
    cardHoverBg: 'hover:bg-[#EDF2EB]',
    plusBtnBg: 'bg-[#E3EAE0]/90',
    plusBtnHoverBg: 'hover:bg-[#EDF2EB]',
    plusBtnText: 'text-[#0C3B2E]',
    headerIconBg: 'bg-[#0C3B2E]',
    headerIconColor: 'text-white',
    textColor: 'text-[#0C3B2E]',
    subtextColor: 'text-[#50685B]',
    borderColor: 'border-black/5'
  },
  autumn: {
    outerBg: 'bg-[#EDE4DB]',
    cardBg: 'bg-[#FDF9F6]/90',
    cardHoverBg: 'hover:bg-white',
    plusBtnBg: 'bg-[#FDF9F6]/90',
    plusBtnHoverBg: 'hover:bg-white',
    plusBtnText: 'text-[#A67C5D]',
    headerIconBg: 'bg-[#5C4033]',
    headerIconColor: 'text-white',
    textColor: 'text-[#5C4033]',
    subtextColor: 'text-[#8C6D5F]',
    borderColor: 'border-black/5'
  },
  gray: {
    outerBg: 'bg-[#EAEAEA]',
    cardBg: 'bg-[#F5F5F5]/90',
    cardHoverBg: 'hover:bg-white',
    plusBtnBg: 'bg-[#F5F5F5]/90',
    plusBtnHoverBg: 'hover:bg-white',
    plusBtnText: 'text-[#71717A]',
    headerIconBg: 'bg-[#3F3F46]',
    headerIconColor: 'text-white',
    textColor: 'text-[#27272A]',
    subtextColor: 'text-[#71717A]',
    borderColor: 'border-black/5'
  },
  bright: {
    outerBg: 'bg-[#E8E5F2]',
    cardBg: 'bg-[#F7F5FB]/90',
    cardHoverBg: 'hover:bg-white',
    plusBtnBg: 'bg-[#F7F5FB]/90',
    plusBtnHoverBg: 'hover:bg-white',
    plusBtnText: 'text-[#7B74A8]',
    headerIconBg: 'bg-[#3D3A5C]',
    headerIconColor: 'text-white',
    textColor: 'text-[#3D3A5C]',
    subtextColor: 'text-[#6A6396]',
    borderColor: 'border-black/5'
  }
};

export default function NotesSection({
  selectedDate,
  notes,
  theme,
  onAddNote,
  onEditNote,
  onOpenStorage
}: NotesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const styles = themeStylesMap[theme] || themeStylesMap.standard;

  const dayNotes = notes
    .filter(n => !n.date || n.date === selectedDate)
    .sort((a, b) => {
      // Day-specific notes first, then everyday notes
      const aPinned = a.date ? 1 : 0;
      const bPinned = b.date ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return b.createdAt - a.createdAt;
    });

  return (
    <div className={`${styles.outerBg} rounded-2xl p-4 border ${styles.borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onOpenStorage}
          className="flex items-center gap-2 group"
        >
          <div className={`w-7 h-7 rounded-lg ${styles.headerIconBg} flex items-center justify-center`}>
            <FileText size={14} className={styles.headerIconColor} />
          </div>
          <div className="text-left">
            <span className={`text-sm font-bold ${styles.textColor} group-hover:underline`}>Заметки дня</span>
            <p className={`text-[10px] ${styles.subtextColor}`}>Все заметки →</p>
          </div>
        </button>
        <button
          onClick={onAddNote}
          className={`w-8 h-8 rounded-xl ${styles.plusBtnBg} ${styles.plusBtnHoverBg} ${styles.plusBtnText} flex items-center justify-center transition-colors`}
          title="Добавить заметку"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {dayNotes.length === 0 ? (
        <p className={`text-xs ${styles.subtextColor} text-center py-4`}>Нет заметок на этот день</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pt-1 pb-1 scroll-smooth select-none cursor-grab active:cursor-grabbing"
        >
          {dayNotes.map(note => (
            <button
              key={note.id}
              onClick={() => onEditNote(note)}
              className={`snap-start shrink-0 w-[180px] text-left ${styles.cardBg} ${styles.cardHoverBg} rounded-xl p-3 border ${styles.borderColor} transition-colors`}
            >
              <div className="flex items-start gap-1.5 mb-1">
                <Check size={12} className={`${styles.subtextColor} mt-0.5 shrink-0 opacity-50`} />
                <span className={`text-xs font-bold ${styles.textColor} line-clamp-1`}>{note.title || 'Без названия'}</span>
              </div>
              {!note.date && (
                <p className={`text-[9px] font-bold uppercase tracking-wider ${styles.subtextColor} mb-1 opacity-70`}>
                  Каждый день
                </p>
              )}
              <p className={`text-[11px] ${styles.subtextColor} line-clamp-3 leading-relaxed`}>{note.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
