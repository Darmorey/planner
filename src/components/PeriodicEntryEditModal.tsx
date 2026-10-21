import React, { useEffect, useRef, useState } from 'react';
import { X, Save } from 'lucide-react';

interface PeriodicEntryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle: string;
  periodLabel: string;
  initialText: string;
  onSave: (text: string) => void;
}

export default function PeriodicEntryEditModal({
  isOpen,
  onClose,
  habitTitle,
  periodLabel,
  initialText,
  onSave,
}: PeriodicEntryEditModalProps) {
  const [text, setText] = useState(initialText);
  const savedRef = useRef(initialText);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      savedRef.current = initialText;
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleClose = () => {
    const trimmed = text.trim();
    const saved = savedRef.current.trim();
    if (trimmed !== saved) {
      onSave(trimmed);
      savedRef.current = trimmed;
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60] animate-fade-in font-sans"
      onClick={handleClose}
    >
      <div
        className="bg-[#D1D9CA] sm:rounded-3xl w-full max-w-5xl h-[92vh] sm:h-[88vh] border border-black/5 shadow-2xl p-5 sm:p-8 flex flex-col relative overflow-hidden"
        onClick={e => e.stopPropagation()}
        data-no-tab-swipe
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 transition-all rounded-full text-[#50685B] hover:bg-[#0C3B2E]/5 hover:text-[#0C3B2E]"
        >
          <X size={18} />
        </button>

        <div className="mb-4 pr-8 shrink-0 select-none">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#50685B]">{periodLabel}</p>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0C3B2E] mt-1">{habitTitle}</h3>
          <p className="text-[13px] text-[#50685B] font-medium mt-0.5">Запишите, что сделали за этот период</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 gap-4">
          <textarea
            autoFocus
            placeholder="Что сделала в этом периоде?"
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 min-h-0 w-full bg-[#E3EAE0]/85 focus:bg-white border border-black/5 rounded-2xl px-5 py-4 text-base text-[#0C3B2E] placeholder:text-[#5C7769] focus:outline-none focus:ring-1 focus:ring-[#0C3B2E]/20 focus:border-[#0C3B2E]/40 resize-none leading-relaxed overflow-y-auto"
          />

          <div className="flex justify-end pt-2 border-t border-black/5 shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#0C3B2E] font-semibold text-sm shadow-sm transition-colors"
            >
              <Save size={16} />
              Готово
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
