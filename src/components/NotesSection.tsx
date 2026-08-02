import React, { useRef } from 'react';
import { Plus, Check, FileText } from 'lucide-react';
import { DayNote } from '../types';

interface NotesSectionProps {
  selectedDate: string;
  notes: DayNote[];
  theme: 'standard' | 'autumn' | 'gray' | 'bright';
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

const themeStylesMap: Record<'standard' | 'autumn' | 'gray' | 'bright', ThemeStyles> = {
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
    outerBg: 'bg-[#F5E6DB]', 
    cardBg: 'bg-[#FDF9F6]/90',   
    cardHoverBg: 'hover:bg-white',
    plusBtnBg: 'bg-[#FDF9F6]/90',
    plusBtnHoverBg: 'hover:bg-white',
    plusBtnText: 'text-[#B55D2B]',
    headerIconBg: 'bg-[#6B2D14]',
    headerIconColor: 'text-white',
    textColor: 'text-[#6B2D14]',
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
    headerIconBg: 'bg-[#27272A]',
    headerIconColor: 'text-white',
    textColor: 'text-[#27272A]',
    subtextColor: 'text-[#71717A]',
    borderColor: 'border-black/5'
  },
  bright: {
    outerBg: 'bg-[#EADCF5]', 
    cardBg: 'bg-[#F8F3FC]/90',   
    cardHoverBg: 'hover:bg-white',
    plusBtnBg: 'bg-[#F8F3FC]/90',
    plusBtnHoverBg: 'hover:bg-white',
    plusBtnText: 'text-[#EC4899]',
    headerIconBg: 'bg-[#2F217A]',
    headerIconColor: 'text-white',
    textColor: 'text-[#2F217A]',
    subtextColor: 'text-[#69569F]',
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

  // Filter notes for the active date
  const dayNotes = notes.filter(n => n.date === selectedDate);
  const hasNotes = dayNotes.length > 0;

  const styles = themeStylesMap[theme] || themeStylesMap.standard;

  return (
    <div className="border-t border-[#6D9773]/20 pt-6">
      {/* Outer elegant container, styled dynamically according to the chosen theme */}
      <div className={`${styles.outerBg} p-5 rounded-[28px] shadow-xl border border-black/5 relative overflow-hidden transition-all duration-300`}>
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div 
            onClick={onOpenStorage}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Перейти в архив заметок"
          >
            {/* Conditional icon styled matching the theme */}
            {hasNotes ? (
              <div className={`w-5 h-5 rounded-full ${styles.headerIconBg} flex items-center justify-center ${styles.headerIconColor} shadow-sm`}>
                <Check size={11} strokeWidth={4} />
              </div>
            ) : (
              <div className="text-[#FF9F0A] group-hover:scale-105 transition-transform duration-150">
                <FileText size={18} className={styles.plusBtnText} />
              </div>
            )}

            <span className={`text-[17px] font-bold ${styles.textColor} tracking-tight leading-none transition-colors`}>
              Заметки
            </span>
          </div>

          {/* Plus action button nested in theme colors */}
          <button
            onClick={onAddNote}
            className={`w-8 h-8 rounded-full ${styles.plusBtnBg} ${styles.plusBtnHoverBg} transition-colors flex items-center justify-center ${styles.plusBtnText} active:scale-95 shadow-sm border border-black/5`}
            title="Добавить заметку"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Swipeable sliding list for notes (Image 2 style) */}
        {hasNotes && (
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pt-4 pb-1 scroll-smooth select-none cursor-grab active:cursor-grabbing"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {dayNotes.map(note => (
              <div
                key={note.id}
                onClick={() => onEditNote(note)}
                className={`flex-none w-[170px] min-h-[150px] max-h-[180px] ${styles.cardBg} ${styles.cardHoverBg} p-4 rounded-2xl border border-black/5 flex flex-col justify-between cursor-pointer transition-all duration-200 snap-start active:scale-98 shadow-md`}
              >
                <div>
                  <h4 className={`font-bold text-[15px] ${styles.textColor} line-clamp-1 tracking-tight leading-snug`}>
                    {note.title || 'Без названия'}
                  </h4>
                  <p className={`text-[13px] ${styles.subtextColor} mt-2 leading-relaxed line-clamp-4 font-normal font-sans break-words whitespace-pre-wrap`}>
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Subtle empty padding block at the end to support nice swipe preview */}
            <div className="flex-none w-2 h-1" />
          </div>
        )}

      </div>
    </div>
  );
}
