import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface FormShellProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export default function FormShell({ title, onClose, onSubmit, children }: FormShellProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-blue-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
            <CheckCircle className="text-blue-900" size={18} />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-900 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {children}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-sky-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-sky-100 rounded-xl text-slate-500 text-sm font-semibold hover:bg-sky-50/50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
            type="submit"
            className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-lg shadow-sky-600/15 transition-all"
          >
            Сохранить
          </button>
        </div>

      </div>
    </div>
  );
}
