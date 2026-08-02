import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Search, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { DayNote } from '../types';
import { formatLocalDate, parseLocalDate } from '../utils/taskHelpers';

interface NotesStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: DayNote[];
  theme: 'standard' | 'autumn' | 'gray' | 'bright';
  onAddNote: () => void;
  onEditNote: (note: DayNote) => void;
  onDeleteNote: (id: string) => void;
}

interface StorageStyles {
  mainBg: string;             
  headerBg: string;           
  searchBg: string;           
  noteCardBg: string;         
  noteCardHoverBorder: string;
  noteDateColor: string;      
  addBtnBg: string;           
  addBtnHoverBg: string;
  addBtnText: string;
  headerIconBg: string;
  headerIconText: string;
}

const themeStorageStyles: Record<'standard' | 'autumn' | 'gray' | 'bright', StorageStyles> = {
  standard: {
    mainBg: 'bg-[#042018]',       
    headerBg: 'bg-[#042018]',
    searchBg: 'bg-[#0C3B2E]',
    noteCardBg: 'bg-[#0C3B2E]',
    noteCardHoverBorder: 'hover:border-[#FFBA00]/30',
    noteDateColor: 'text-emerald-100/70',
    addBtnBg: 'bg-[#FFBA00]',
    addBtnHoverBg: 'hover:bg-[#E0A300]',
    addBtnText: 'text-[#0C3B2E]',
    headerIconBg: 'bg-[#FFBA00]',
    headerIconText: 'text-[#042018]'
  },
  autumn: {
    mainBg: 'bg-[#421A0B]',       
    headerBg: 'bg-[#421A0B]',
    searchBg: 'bg-[#6B2D14]',
    noteCardBg: 'bg-[#6B2D14]',
    noteCardHoverBorder: 'hover:border-[#F4C175]/30',
    noteDateColor: 'text-orange-100/70',
    addBtnBg: 'bg-[#F4C175]',
    addBtnHoverBg: 'hover:bg-[#E2AF5F]',
    addBtnText: 'text-[#6B2D14]',
    headerIconBg: 'bg-[#F4C175]',
    headerIconText: 'text-[#421A0B]'
  },
  gray: {
    mainBg: 'bg-[#18181B]',       
    headerBg: 'bg-[#18181B]',
    searchBg: 'bg-[#27272A]',
    noteCardBg: 'bg-[#27272A]',
    noteCardHoverBorder: 'hover:border-[#A1A1AA]/30',
    noteDateColor: 'text-zinc-400',
    addBtnBg: 'bg-[#3F3F46]',
    addBtnHoverBg: 'hover:bg-[#52525B]',
    addBtnText: 'text-white',
    headerIconBg: 'bg-[#A1A1AA]',
    headerIconText: 'text-[#18181B]'
  },
  bright: {
    mainBg: 'bg-[#150D40]',       
    headerBg: 'bg-[#150D40]',
    searchBg: 'bg-[#2F217A]',
    noteCardBg: 'bg-[#2F217A]',
    noteCardHoverBorder: 'hover:border-[#EC4899]/30',
    noteDateColor: 'text-fuchsia-200/70',
    addBtnBg: 'bg-[#EC4899]',
    addBtnHoverBg: 'hover:bg-[#D63C87]',
    addBtnText: 'text-[#150D40]',
    headerIconBg: 'bg-[#EC4899]',
    headerIconText: 'text-[#150D40]'
  }
};

export default function NotesStorageModal({
  isOpen,
  onClose,
  notes,
  theme,
  onAddNote,
  onEditNote,
  onDeleteNote
}: NotesStorageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Format Russian readable date for notes
  const formatNoteDate = (dateStr: string): string => {
    try {
      const d = parseLocalDate(dateStr);
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  // Filter notes based on user search query
  const filteredNotes = notes.filter(note => {
    const titleMatch = (note.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (note.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  // Split into left and right columns for beautiful realistic layout as in the image
  const leftColNotes = filteredNotes.filter((_, idx) => idx % 2 === 0);
  const rightColNotes = filteredNotes.filter((_, idx) => idx % 2 !== 0);

  const styles = themeStorageStyles[theme] || themeStorageStyles.standard;

  return (
    <div className={`fixed inset-0 ${styles.mainBg} text-white z-50 flex flex-col overflow-hidden animate-fade-in font-sans`}>
      
      {/* Header Bar matching Reference 3 */}
      <header className={`px-4 py-3 flex items-center justify-between border-b border-white/5 ${styles.headerBg}`}>
        {/* Back button */}
        <button
          onClick={onClose}
          className="p-1 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full active:scale-95"
          aria-label="Назад"
        >
          <ChevronLeft size={26} />
        </button>

        {/* Center Title and Icon */}
        <div className="flex items-center gap-2">
          <div className={`w-[26px] h-[26px] rounded ${styles.headerIconBg} flex items-center justify-center shadow-md`}>
            <FileText size={15} className={styles.headerIconText} strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white select-none">
            Заметки
          </span>
        </div>

        {/* Options Menu Button */}
        <button
          className="p-1.5 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full active:scale-95"
          aria-label="Опции"
        >
          <MoreHorizontal size={22} />
        </button>
      </header>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
        
        {/* Search Input matching Reference 3 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400/80">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 ${styles.searchBg} rounded-2xl text-[15px] text-white placeholder-[#8E8E93] focus:outline-none focus:ring-1 focus:ring-white/10 border border-white/5 transition-all`}
          />
        </div>

        {/* Grid Flow containing Notes */}
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-3">
            <FileText size={48} className="text-slate-600 animate-pulse" />
            <p className="text-sm font-medium text-slate-400">Нет сохраненных заметок</p>
            <p className="text-xs text-slate-500 max-w-xs">
              {searchQuery ? 'Заметок по этому запросу не найдено.' : 'Создайте свою первую заметку, нажав на кнопку «+» внизу!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 items-start">
            {/* Left Column */}
            <div className="space-y-3.5">
              {leftColNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onEditNote(note)}
                  className={`${styles.noteCardBg} p-4 rounded-3xl border border-white/5 ${styles.noteCardHoverBorder} active:scale-[0.98] transition-all cursor-pointer relative group card shadow-lg flex flex-col justify-between`}
                >
                  <div>
                    {/* Header containing title and delete button option */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[15px] text-white tracking-tight leading-snug break-words pr-2 line-clamp-2">
                        {note.title || 'Без названия'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Вы действительно хотите удалить эту заметку?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 hover:bg-white/10 text-slate-300 hover:text-red-450 rounded-full transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        title="Удалить заметку"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-[13px] text-[#E5E5EA] leading-relaxed font-normal whitespace-pre-wrap break-words line-clamp-[12]">
                      {note.content}
                    </p>
                  </div>

                  {/* Note calendar day/date footer */}
                  <div className={`mt-3.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-semibold ${styles.noteDateColor} uppercase tracking-wider select-none`}>
                    <Calendar size={10} className="opacity-70" />
                    <span>{formatNoteDate(note.date)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {rightColNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onEditNote(note)}
                  className={`${styles.noteCardBg} p-4 rounded-3xl border border-white/5 ${styles.noteCardHoverBorder} active:scale-[0.98] transition-all cursor-pointer relative group card shadow-lg flex flex-col justify-between`}
                >
                  <div>
                    {/* Header and title */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[15px] text-white tracking-tight leading-snug break-words pr-2 line-clamp-2">
                        {note.title || 'Без названия'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Вы действительно хотите удалить эту заметку?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 hover:bg-white/10 text-slate-300 hover:text-red-450 rounded-full transition-all shrink-0 opacity-0 group-hover:opacity-100"
                        title="Удалить заметку"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <p className="text-[13px] text-[#E5E5EA] leading-relaxed font-normal whitespace-pre-wrap break-words line-clamp-[12]">
                      {note.content}
                    </p>
                  </div>

                  {/* Note footer calendar date badge */}
                  <div className={`mt-3.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-semibold ${styles.noteDateColor} uppercase tracking-wider select-none`}>
                    <Calendar size={10} className="opacity-70" />
                    <span>{formatNoteDate(note.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Button (FAB) matching Reference 3 */}
      <button
        onClick={onAddNote}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full ${styles.addBtnBg} ${styles.addBtnText} shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group border border-white/10`}
        title="Добавить новую заметку"
      >
        <Plus size={26} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>

    </div>
  );
}
