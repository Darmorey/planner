import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { DayNote } from '../types';

interface NoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: DayNote | null; // Null means we're adding a new note
  selectedDate: string;
  theme: 'standard' | 'autumn' | 'gray' | 'bright';
  onSave: (noteData: { id?: string; title: string; content: string; date: string }) => void;
  onDelete?: (id: string) => void;
}

interface EditModalStyles {
  modalBg: string;             
  inputBg: string;             
  inputFocusRing: string;      
  saveBtnBg: string;           
  saveBtnHoverBg: string;      
  saveBtnText: string;
  placeholderColor: string;
  labelColor: string;
  subtextColor: string;
  titleColor: string;
  closeBtnColor: string;
  calMonthColor: string;
  calDateColor: string;
  deleteBtnBg: string;
  deleteBtnText: string;
  deleteBtnBorder: string;
  scrollbarThumbColor: string;
}

const themeEditStyles: Record<'standard' | 'autumn' | 'gray' | 'bright', EditModalStyles> = {
  standard: {
    modalBg: 'bg-[#D1D9CA]',
    inputBg: 'bg-[#E3EAE0]/85 focus:bg-white',
    inputFocusRing: 'focus:ring-[#0C3B2E]/20 focus:border-[#0C3B2E]/40',
    saveBtnBg: 'bg-white/90',
    saveBtnHoverBg: 'hover:bg-white',
    saveBtnText: 'text-[#0C3B2E]',
    placeholderColor: 'placeholder-[#5C7769]',
    labelColor: 'text-[#0C3B2E]',
    subtextColor: 'text-[#50685B]',
    titleColor: 'text-[#0C3B2E]',
    closeBtnColor: 'text-[#50685B] hover:bg-[#0C3B2E]/5 hover:text-[#0C3B2E]',
    calMonthColor: 'text-[#A26D3C]',
    calDateColor: 'text-[#0C3B2E]',
    deleteBtnBg: 'bg-white/90',
    deleteBtnText: 'text-[#8A3730]',
    deleteBtnBorder: 'border-black/5',
    scrollbarThumbColor: '#0C3B2E'
  },
  autumn: {
    modalBg: 'bg-[#F5E6DB]',
    inputBg: 'bg-[#FDF9F6] focus:bg-white',
    inputFocusRing: 'focus:ring-[#853C1F]/20 focus:border-[#853C1F]/40',
    saveBtnBg: 'bg-white/90',
    saveBtnHoverBg: 'hover:bg-white',
    saveBtnText: 'text-[#6B2D14]',
    placeholderColor: 'placeholder-[#AA9287]',
    labelColor: 'text-[#6B2D14]',
    subtextColor: 'text-[#8C6D5F]',
    titleColor: 'text-[#6B2D14]',
    closeBtnColor: 'text-[#8C6D5F] hover:bg-[#6B2D14]/5 hover:text-[#6B2D14]',
    calMonthColor: 'text-[#B55D2B]',
    calDateColor: 'text-[#6B2D14]',
    deleteBtnBg: 'bg-white/90',
    deleteBtnText: 'text-[#9C3823]',
    deleteBtnBorder: 'border-black/5',
    scrollbarThumbColor: '#6B2D14'
  },
  gray: {
    modalBg: 'bg-[#EAEAEA]',
    inputBg: 'bg-[#F5F5F5] focus:bg-white',
    inputFocusRing: 'focus:ring-[#27272A]/20 focus:border-[#27272A]/40',
    saveBtnBg: 'bg-white/90',
    saveBtnHoverBg: 'hover:bg-white',
    saveBtnText: 'text-[#27272A]',
    placeholderColor: 'placeholder-[#8E8E93]',
    labelColor: 'text-[#27272A]',
    subtextColor: 'text-[#71717A]',
    titleColor: 'text-[#27272A]',
    closeBtnColor: 'text-[#71717A] hover:bg-[#27272A]/5 hover:text-[#27272A]',
    calMonthColor: 'text-[#71717A]',
    calDateColor: 'text-[#27272A]',
    deleteBtnBg: 'bg-white/90',
    deleteBtnText: 'text-[#71717A]',
    deleteBtnBorder: 'border-black/5',
    scrollbarThumbColor: '#27272A'
  },
  bright: {
    modalBg: 'bg-[#EADCF5]',
    inputBg: 'bg-[#F8F3FC] focus:bg-white',
    inputFocusRing: 'focus:ring-[#2F217A]/20 focus:border-[#2F217A]/40',
    saveBtnBg: 'bg-white/90',
    saveBtnHoverBg: 'hover:bg-white',
    saveBtnText: 'text-[#EC4899]',
    placeholderColor: 'placeholder-[#A594C5]',
    labelColor: 'text-[#2F217A]',
    subtextColor: 'text-[#69569F]',
    titleColor: 'text-[#2F217A]',
    closeBtnColor: 'text-[#69569F] hover:bg-[#2F217A]/5 hover:text-[#2F217A]',
    calMonthColor: 'text-[#EC4899]',
    calDateColor: 'text-[#2F217A]',
    deleteBtnBg: 'bg-white/90',
    deleteBtnText: 'text-[#BE185D]',
    deleteBtnBorder: 'border-black/5',
    scrollbarThumbColor: '#2F217A'
  }
};

export default function NoteEditModal({
  isOpen,
  onClose,
  note,
  selectedDate,
  theme,
  onSave,
  onDelete
 }: NoteEditModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setDate(note.date || selectedDate);
      } else {
        setTitle('');
        setContent('');
        setDate(selectedDate);
      }
    }
  }, [isOpen, note, selectedDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) {
      alert('Заполните название или описание заметки.');
      return;
    }
    onSave({
      id: note?.id,
      title: title.trim(),
      content: content.trim(),
      date: date
    });
    onClose();
  };

  const getRussianDateParts = (dateStr: string) => {
    if (!dateStr) return { day: '1', month: 'Янв' };
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10).toString();
      const m = parseInt(parts[1], 10);
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      return { day, month: months[m - 1] || 'Янв' };
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const day = parsed.getDate().toString();
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      return { day, month: months[parsed.getMonth()] };
    }
    return { day: '1', month: 'Янв' };
  };

  const styles = themeEditStyles[theme] || themeEditStyles.standard;
  const dateParts = getRussianDateParts(date);

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[60] animate-fade-in font-sans">
      <div className={`${styles.modalBg} text-white rounded-3xl w-full max-w-5xl h-[88vh] border border-black/5 shadow-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden`}>
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 transition-all duration-150 rounded-full ${styles.closeBtnColor}`}
        >
          <X size={18} />
        </button>

        <div className="mb-4 select-none pr-8 shrink-0">
          <h3 className={`text-2xl font-bold tracking-tight ${styles.titleColor}`}>
            {note ? 'Редактировать заметку' : 'Новая заметка'}
          </h3>
          <p className={`text-[13px] ${styles.subtextColor} font-medium mt-0.5`}>
            {note ? 'Внесите изменения в вашу заметку' : 'Запишите идеи, планы или списки'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 gap-4 mt-2">
          
          {/* Note Title Input */}
          <div className="shrink-0">
            <input
              type="text"
              placeholder="Название"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={`w-full ${styles.inputBg} border border-black/5 rounded-2xl px-4 py-3.5 text-lg font-bold ${styles.titleColor} focus:outline-none focus:ring-1 ${styles.inputFocusRing} transition-all ${styles.placeholderColor}`}
            />
          </div>

          {/* Note Content Textarea */}
          <div className="flex-1 min-h-0 flex flex-col">
            <textarea
              placeholder="Описание"
              value={content}
              onChange={e => setContent(e.target.value)}
              className={`flex-1 w-full ${styles.inputBg} border border-black/5 rounded-2xl px-5 py-4 text-base ${styles.titleColor} focus:outline-none focus:ring-1 ${styles.inputFocusRing} transition-all ${styles.placeholderColor} resize-none leading-relaxed overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb-color)] [&::-webkit-scrollbar-thumb]:rounded-full`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `${styles.scrollbarThumbColor} transparent`,
                '--scrollbar-thumb-color': styles.scrollbarThumbColor,
              } as React.CSSProperties}
            />
          </div>

          {/* Bottom Action row */}
          <div className="flex items-center gap-4 pt-4 border-t border-black/5 w-full shrink-0">
            {/* Tear-off calendar date selection button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.();
                  } catch (err) {
                    dateInputRef.current?.click?.();
                  }
                }}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/90 border border-black/5 shadow-sm select-none hover:bg-white active:scale-95 transition-all duration-150"
                title="Выбрать дату"
              >
                <span className={`text-[9px] font-extrabold ${styles.calMonthColor} uppercase tracking-wider leading-none`}>
                  {dateParts.month}
                </span>
                <span className={`text-[17px] font-bold ${styles.calDateColor} tracking-tight leading-none mt-0.5`}>
                  {dateParts.day}
                </span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-[48px]"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className={`flex-1 py-3 px-4 h-12 rounded-xl font-bold text-sm tracking-wide ${styles.saveBtnBg} ${styles.saveBtnHoverBg} ${styles.saveBtnText} shadow-sm border border-black/5 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5`}
            >
              <Save size={15} />
              <span>Сохранить</span>
            </button>

            {/* Delete Button */}
            {note && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Вы действительно хотите удалить эту заметку?')) {
                    onDelete(note.id);
                    onClose();
                  }
                }}
                className={`py-3 px-4 h-12 rounded-xl font-bold text-sm ${styles.deleteBtnBg} hover:bg-white ${styles.deleteBtnText} border ${styles.deleteBtnBorder} shadow-sm active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5`}
                title="Удалить заметку"
              >
                <Trash2 size={15} />
                <span>Удалить</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
