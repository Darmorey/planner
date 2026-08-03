import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Search, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { DayNote } from '../types';
import { parseLocalDate } from '../utils/taskHelpers';
import { ThemeId } from '../utils/themeTypes';

interface NotesStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: DayNote[];
  theme: ThemeId;
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
  rootText: string;
  titleText: string;
  bodyText: string;
  mutedIcon: string;
  searchText: string;
  searchPlaceholder: string;
  cardBorder: string;
  divider: string;
}

const themeStorageStyles: Record<ThemeId, StorageStyles> = {
  standard: {
    mainBg: 'bg-[#D1D9CA]',
    headerBg: 'bg-[#D1D9CA]',
    searchBg: 'bg-white',
    noteCardBg: 'bg-white',
    noteCardHoverBorder: 'hover:border-[#0C3B2E]/25',
    noteDateColor: 'text-[#50685B]',
    addBtnBg: 'bg-[#0C3B2E]',
    addBtnHoverBg: 'hover:bg-[#07251D]',
    addBtnText: 'text-white',
    headerIconBg: 'bg-[#0C3B2E]',
    headerIconText: 'text-white',
    rootText: 'text-[#0C3B2E]',
    titleText: 'text-[#0C3B2E]',
    bodyText: 'text-[#3D5A4C]',
    mutedIcon: 'text-[#6D9773]',
    searchText: 'text-[#0C3B2E]',
    searchPlaceholder: 'placeholder-[#8AA094]',
    cardBorder: 'border-[#0C3B2E]/8',
    divider: 'border-[#0C3B2E]/10',
  },
  autumn: {
    mainBg: 'bg-[#F3EEE8]',
    headerBg: 'bg-[#F3EEE8]',
    searchBg: 'bg-white',
    noteCardBg: 'bg-white',
    noteCardHoverBorder: 'hover:border-[#A67C5D]/30',
    noteDateColor: 'text-[#8C6D5F]',
    addBtnBg: 'bg-[#5C4033]',
    addBtnHoverBg: 'hover:bg-[#4A3329]',
    addBtnText: 'text-white',
    headerIconBg: 'bg-[#A67C5D]',
    headerIconText: 'text-white',
    rootText: 'text-[#5C4033]',
    titleText: 'text-[#5C4033]',
    bodyText: 'text-[#6B5344]',
    mutedIcon: 'text-[#A67C5D]',
    searchText: 'text-[#5C4033]',
    searchPlaceholder: 'placeholder-[#B5A49A]',
    cardBorder: 'border-[#5C4033]/8',
    divider: 'border-[#5C4033]/10',
  },
  gray: {
    mainBg: 'bg-[#ECECED]',
    headerBg: 'bg-[#ECECED]',
    searchBg: 'bg-white',
    noteCardBg: 'bg-white',
    noteCardHoverBorder: 'hover:border-[#71717A]/30',
    noteDateColor: 'text-zinc-500',
    addBtnBg: 'bg-[#3F3F46]',
    addBtnHoverBg: 'hover:bg-[#27272A]',
    addBtnText: 'text-white',
    headerIconBg: 'bg-[#71717A]',
    headerIconText: 'text-white',
    rootText: 'text-[#27272A]',
    titleText: 'text-[#27272A]',
    bodyText: 'text-zinc-600',
    mutedIcon: 'text-zinc-400',
    searchText: 'text-[#27272A]',
    searchPlaceholder: 'placeholder-zinc-400',
    cardBorder: 'border-zinc-200',
    divider: 'border-zinc-100',
  },
  bright: {
    mainBg: 'bg-[#F0EEF5]',
    headerBg: 'bg-[#F0EEF5]',
    searchBg: 'bg-white',
    noteCardBg: 'bg-white',
    noteCardHoverBorder: 'hover:border-[#7B74A8]/30',
    noteDateColor: 'text-[#6A6396]',
    addBtnBg: 'bg-[#3D3A5C]',
    addBtnHoverBg: 'hover:bg-[#2F2C48]',
    addBtnText: 'text-white',
    headerIconBg: 'bg-[#7B74A8]',
    headerIconText: 'text-white',
    rootText: 'text-[#3D3A5C]',
    titleText: 'text-[#3D3A5C]',
    bodyText: 'text-[#5A5678]',
    mutedIcon: 'text-[#7B74A8]',
    searchText: 'text-[#3D3A5C]',
    searchPlaceholder: 'placeholder-[#A8A3C2]',
    cardBorder: 'border-[#3D3A5C]/8',
    divider: 'border-[#3D3A5C]/10',
  },
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

  const formatNoteDate = (dateStr?: string): string => {
    if (!dateStr) return 'Каждый день';
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

  const filteredNotes = notes.filter(note => {
    const titleMatch = (note.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (note.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const leftColNotes = filteredNotes.filter((_, idx) => idx % 2 === 0);
  const rightColNotes = filteredNotes.filter((_, idx) => idx % 2 !== 0);

  const styles = themeStorageStyles[theme] || themeStorageStyles.standard;

  const renderNoteCard = (note: DayNote) => (
    <div
      key={note.id}
      onClick={() => onEditNote(note)}
      className={`${styles.noteCardBg} p-4 rounded-3xl border ${styles.cardBorder} ${styles.noteCardHoverBorder} active:scale-[0.98] transition-all cursor-pointer relative group shadow-sm flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-[15px] ${styles.titleText} tracking-tight leading-snug break-words pr-2 line-clamp-2`}>
            {note.title || 'Без названия'}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Вы действительно хотите удалить эту заметку?')) {
                onDeleteNote(note.id);
              }
            }}
            className={`p-1 hover:bg-black/5 ${styles.mutedIcon} hover:text-red-500 rounded-full transition-all shrink-0 opacity-0 group-hover:opacity-100`}
            title="Удалить заметку"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <p className={`text-[13px] ${styles.bodyText} leading-relaxed font-normal whitespace-pre-wrap break-words line-clamp-[12]`}>
          {note.content}
        </p>
      </div>

      <div className={`mt-3.5 pt-2.5 border-t ${styles.divider} flex items-center gap-1.5 text-[10px] font-semibold ${styles.noteDateColor} uppercase tracking-wider select-none`}>
        <Calendar size={10} className="opacity-70" />
        <span>{formatNoteDate(note.date)}</span>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 ${styles.mainBg} ${styles.rootText} z-50 flex flex-col overflow-hidden animate-fade-in font-sans`}>
      <header className={`px-4 py-3 flex items-center justify-between border-b ${styles.divider} ${styles.headerBg}`}>
        <button
          onClick={onClose}
          className={`p-1 ${styles.mutedIcon} hover:opacity-80 transition-colors hover:bg-black/5 rounded-full active:scale-95`}
          aria-label="Назад"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-[26px] h-[26px] rounded ${styles.headerIconBg} flex items-center justify-center shadow-md`}>
            <FileText size={15} className={styles.headerIconText} strokeWidth={2.5} />
          </div>
          <span className={`text-[17px] font-bold tracking-tight ${styles.titleText} select-none`}>
            Заметки
          </span>
        </div>

        <button
          className={`p-1.5 ${styles.mutedIcon} hover:opacity-80 transition-colors hover:bg-black/5 rounded-full active:scale-95`}
          aria-label="Опции"
        >
          <MoreHorizontal size={22} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
        <div className="relative">
          <div className={`absolute inset-y-0 left-3.5 flex items-center pointer-events-none ${styles.mutedIcon}`}>
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 ${styles.searchBg} rounded-2xl text-[15px] ${styles.searchText} ${styles.searchPlaceholder} focus:outline-none focus:ring-1 focus:ring-black/5 border ${styles.cardBorder} transition-all shadow-sm`}
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-3">
            <FileText size={48} className={`${styles.mutedIcon} animate-pulse`} />
            <p className={`text-sm font-medium ${styles.bodyText}`}>Нет сохраненных заметок</p>
            <p className={`text-xs ${styles.mutedIcon} max-w-xs`}>
              {searchQuery ? 'Заметок по этому запросу не найдено.' : 'Создайте свою первую заметку, нажав на кнопку «+» внизу!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 items-start">
            <div className="space-y-3.5">{leftColNotes.map(renderNoteCard)}</div>
            <div className="space-y-3.5">{rightColNotes.map(renderNoteCard)}</div>
          </div>
        )}
      </div>

      <button
        onClick={onAddNote}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full ${styles.addBtnBg} ${styles.addBtnHoverBg} ${styles.addBtnText} shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group`}
        title="Добавить новую заметку"
      >
        <Plus size={26} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
}
