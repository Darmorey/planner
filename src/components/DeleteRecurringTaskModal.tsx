import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, CalendarDays, CalendarX } from 'lucide-react';
import { parseLocalDate } from '../utils/taskHelpers';
import { ThemeId } from '../utils/themeTypes';

interface DeleteRecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  dateStr: string;
  theme: ThemeId;
  onDeleteOccurrence: () => void;
  onDeleteAll: () => void;
}

interface MiniThemeStyles {
  headerText: string;
  iconBg: string;
  iconColor: string;
  buttonCurrentBg: string;
  buttonAllBg: string;
  modalBg: string;
  bodyText: string;
  mutedText: string;
  closeBtn: string;
}

const themeStylesMap: Record<ThemeId, MiniThemeStyles> = {
  standard: {
    headerText: 'text-[#0C3B2E]',
    iconBg: 'bg-[#E3EAE0]',
    iconColor: 'text-[#0C3B2E]',
    buttonCurrentBg: 'bg-[#6D9773]/15 text-[#0C3B2E] border-[#6D9773]/30 hover:bg-[#6D9773]/25',
    buttonAllBg: 'bg-[#0C3B2E] text-white hover:bg-[#154E3F] shadow-sm shadow-[#0C3B2E]/10',
    modalBg: 'bg-white',
    bodyText: 'text-slate-700',
    mutedText: 'text-slate-500',
    closeBtn: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
  },
  forestDark: {
    headerText: 'text-[#E8F0EA]',
    iconBg: 'bg-[#134A3A]',
    iconColor: 'text-[#C9A227]',
    buttonCurrentBg: 'bg-[#6D9773]/20 text-[#E8F0EA] border-[#6D9773]/35 hover:bg-[#6D9773]/30',
    buttonAllBg: 'bg-[#C9A227] text-[#042018] hover:bg-[#B89220] shadow-sm shadow-black/20',
    modalBg: 'bg-[#0C3B2E]',
    bodyText: 'text-emerald-50/90',
    mutedText: 'text-emerald-100/55',
    closeBtn: 'text-emerald-100/50 hover:text-[#E8F0EA] hover:bg-white/5',
  },
  autumn: {
    headerText: 'text-[#5C4033]',
    iconBg: 'bg-[#EDE4DB]',
    iconColor: 'text-[#5C4033]',
    buttonCurrentBg: 'bg-[#A67C5D]/15 text-[#5C4033] border-[#A67C5D]/30 hover:bg-[#A67C5D]/25',
    buttonAllBg: 'bg-[#5C4033] text-white hover:bg-[#4A3329] shadow-sm shadow-[#5C4033]/10',
    modalBg: 'bg-white',
    bodyText: 'text-slate-700',
    mutedText: 'text-slate-500',
    closeBtn: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
  },
  gray: {
    headerText: 'text-[#27272A]',
    iconBg: 'bg-[#EAEAEA]',
    iconColor: 'text-[#27272A]',
    buttonCurrentBg: 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200',
    buttonAllBg: 'bg-[#27272A] text-white hover:bg-[#3F3F46] shadow-sm shadow-black/10',
    modalBg: 'bg-white',
    bodyText: 'text-slate-700',
    mutedText: 'text-slate-500',
    closeBtn: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
  },
  bright: {
    headerText: 'text-[#3D3A5C]',
    iconBg: 'bg-[#E8E5F2]',
    iconColor: 'text-[#3D3A5C]',
    buttonCurrentBg: 'bg-[#7B74A8]/15 text-[#3D3A5C] border-[#7B74A8]/30 hover:bg-[#7B74A8]/25',
    buttonAllBg: 'bg-[#3D3A5C] text-white hover:bg-[#2F2C48] shadow-sm shadow-[#3D3A5C]/10',
    modalBg: 'bg-white',
    bodyText: 'text-slate-700',
    mutedText: 'text-slate-500',
    closeBtn: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
  },
};

/**
 * Formats a YYYY-MM-DD date string to DD.MM.YYYY
 */
function formatPrettyRussianDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

export default function DeleteRecurringTaskModal({
  isOpen,
  onClose,
  taskTitle,
  dateStr,
  theme,
  onDeleteOccurrence,
  onDeleteAll,
}: DeleteRecurringTaskModalProps) {
  const styles = themeStylesMap[theme] || themeStylesMap.standard;
  const formattedDate = formatPrettyRussianDate(dateStr);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
            className={`${styles.modalBg} rounded-3xl w-full max-w-md border border-black/5 shadow-2xl p-6 flex flex-col relative z-10 overflow-hidden`}
          >
            {/* Header Close button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${styles.closeBtn}`}
              title="Закрыть"
            >
              <X size={18} />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-5 pb-3 border-b border-black/5">
              <div className={`p-3 rounded-2xl ${styles.iconBg} ${styles.iconColor} shrink-0`}>
                <CalendarX size={24} />
              </div>
              <div className="pr-6">
                <h3 className={`text-base font-bold leading-snug ${styles.headerText}`}>
                  Регулярная задача
                </h3>
                <p className={`text-xs font-medium mt-0.5 ${styles.mutedText}`}>
                  Управление повторениями задачи
                </p>
              </div>
            </div>

            {/* Content text */}
            <div className="mb-6 space-y-3">
              <div className={`${styles.iconBg} p-3 rounded-2xl border border-black/5`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${styles.mutedText}`}>Задача</p>
                <p className={`text-sm font-bold break-words ${styles.headerText}`}>{taskTitle}</p>
              </div>
              <p className={`text-[13px] leading-relaxed ${styles.bodyText}`}>
                Вы выбрали удаление регулярной задачи. Как вы хотите её удалить?
              </p>
            </div>

            {/* User Action Buttons */}
            <div className="space-y-2.5">
              {/* Option 1: Delete only current occurrence */}
              <button
                onClick={() => {
                  onDeleteOccurrence();
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-between active:scale-[0.98] ${styles.buttonCurrentBg}`}
              >
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  <span>Удалить только текущую задачу ({formattedDate})</span>
                </span>
              </button>

              {/* Option 2: Delete master task (all and subsequent) */}
              <button
                onClick={() => {
                  onDeleteAll();
                  onClose();
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between active:scale-[0.98] ${styles.buttonAllBg}`}
              >
                <span className="flex items-center gap-2">
                  <Trash2 size={15} />
                  <span>Удалить все и последующие</span>
                </span>
              </button>

              {/* Option 3: Cancel */}
              <button
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-transparent transition-all text-center active:scale-[0.98] ${styles.closeBtn}`}
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
