import React from 'react';
import { X, Palette, Trash2 } from 'lucide-react';
import { ThemeId } from '../utils/themeTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
  isConfirmingClear: boolean;
  theme: ThemeId;
  onThemeChange: (newTheme: ThemeId) => void;
}

const themesList = [
  { id: 'standard', name: 'Лес', preview: 'bg-[#0C3B2E]', accent: 'bg-[#6D9773]' },
  { id: 'autumn', name: 'Песок', preview: 'bg-[#5C4033]', accent: 'bg-[#A67C5D]' },
  { id: 'gray', name: 'Камень', preview: 'bg-[#3F3F46]', accent: 'bg-[#71717A]' },
  { id: 'bright', name: 'Лаванда', preview: 'bg-[#3D3A5C]', accent: 'bg-[#7B74A8]' },
] as const;

export default function SettingsModal({
  isOpen,
  onClose,
  onClearAllData,
  isConfirmingClear,
  theme,
  onThemeChange
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl p-6 flex flex-col relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-100/50 pb-4">
          <Palette className="text-slate-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Настройки ежедневника</h3>
            <p className="text-xs text-slate-400 font-medium">Темы оформления и сброс данных</p>
          </div>
        </div>

        <div className="mb-5 pb-5 border-b border-rose-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="text-slate-500" size={17} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Цветовая тема приложения</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themesList.map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                  theme === t.id
                    ? 'border-slate-800 bg-slate-50/70 ring-1 ring-slate-800'
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`text-[11px] font-semibold ${theme === t.id ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                  {t.name}
                </span>
                <div className="flex gap-1 shrink-0">
                  <span className={`w-3 h-3 rounded-full ${t.preview} shadow-sm border border-white/20`} />
                  <span className={`w-3 h-3 rounded-full ${t.accent} shadow-sm border border-white/20`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-rose-50/15 p-3.5 rounded-2xl border border-rose-100/40">
          <h4 className="text-xs font-bold text-[#7D3F37] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Trash2 size={13} className="text-rose-500" />
            Сброс данных
          </h4>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-normal">
            Вы можете безвозвратно стереть все Ваши локальные задачи, заметки, списки желаний и подарков из локального кэша этого браузера.
          </p>
          <button
            onClick={onClearAllData}
            className={`w-full py-2 px-3 text-xs rounded-xl border transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              isConfirmingClear 
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 font-bold animate-pulse shadow-md shadow-red-900/10' 
                : 'bg-rose-50/50 hover:bg-rose-50 text-[#7D3F37] border-rose-100 hover:border-rose-200 font-semibold'
            }`}
          >
            <Trash2 size={13} className={isConfirmingClear ? 'animate-bounce' : ''} />
            <span>{isConfirmingClear ? 'Нажмите ещё раз в течение 4с!' : 'Очистить историю ежедневника'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
