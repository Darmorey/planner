import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, CalendarDays, CalendarX } from 'lucide-react';
import { parseLocalDate } from '../utils/taskHelpers';

interface DeleteRecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  dateStr: string;
  theme: 'standard' | 'autumn' | 'gray' | 'bright';
  onDeleteOccurrence: () => void;
  onDeleteAll: () => void;
}

interface MiniThemeStyles {
  headerText: string;
  iconBg: string;
  iconColor: string;
  buttonCurrentBg: string;
  buttonAllBg: string;
}

const themeStylesMap: Record<'standard' | 'autumn' | 'gray' | 'bright', MiniThemeStyles> = {
  standard: {
    headerText: 'text-[#0C3B2E]',
    iconBg: 'bg-[#E3EAE0]',
    iconColor: 'text-[#0C3B2E]',
    buttonCurrentBg: 'bg-[#6D9773]/15 text-[#0C3B2E] border-[#6D9773]/30 hover:bg-[#6D9773]/25',
    buttonAllBg: 'bg-[#0C3B2E] text-white hover:bg-[#154E3F] shadow-sm shadow-[#0C3B2E]/10',
  },
  autumn: {
    headerText: 'text-[#6B2D14]',
    iconBg: 'bg-[#F5E6DB]',
    iconColor: 'text-[#6B2D14]',
    buttonCurrentBg: 'bg-[#BC5225]/15 text-[#6B2D14] border-[#BC5225]/30 hover:bg-[#BC5225]/25',
    buttonAllBg: 'bg-[#6B2D14] text-white hover:bg-[#853C1F] shadow-sm shadow-[#6B2D14]/10',
  },
  gray: {
    headerText: 'text-[#27272A]',
    iconBg: 'bg-[#EAEAEA]',
    iconColor: 'text-[#27272A]',
    buttonCurrentBg: 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200',
    buttonAllBg: 'bg-[#27272A] text-white hover:bg-[#3F3F46] shadow-sm shadow-black/10',
  },
  bright: {
    headerText: 'text-[#2F217A]',
    iconBg: 'bg-[#EADCF5]',
    iconColor: 'text-[#2F217A]',
    buttonCurrentBg: 'bg-[#EC4899]/15 text-[#EC4899] border-[#EC4899]/30 hover:bg-[#EC4899]/25',
    buttonAllBg: 'bg-[#2F217A] text-white hover:bg-[#4232A4] shadow-sm shadow-[#2F217A]/10',
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
            className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl p-6 flex flex-col relative z-10 overflow-hidden"
          >
            {/* Header Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              title="Закрыть"
            >
              <X size={18} />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-5 pb-3 border-b border-slate-100/60">
              <div className={`p-3 rounded-2xl ${styles.iconBg} ${styles.iconColor} shrink-0`}>
                <CalendarX size={24} />
              </div>
              <div className="pr-6">
                <h3 className={`text-base font-bold leading-snug ${styles.headerText}`}>
                  Регулярная задача
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Управление повторениями задачи
                </p>
              </div>
            </div>

            {/* Content text */}
            <div className="mb-6 space-y-3">
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Задача</p>
                <p className="text-sm font-bold text-slate-800 break-words">{taskTitle}</p>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
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
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent transition-all text-center active:scale-[0.98]"
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
