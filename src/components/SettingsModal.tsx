import React, { useRef } from 'react';
import { X, Palette, Trash2, Download, Upload } from 'lucide-react';
import { ThemeId } from '../utils/themeTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
  isConfirmingClear: boolean;
  theme: ThemeId;
  onThemeChange: (newTheme: ThemeId) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
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
  onThemeChange,
  onExportBackup,
  onImportBackup,
}: SettingsModalProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportBackup(file);
    e.target.value = '';
  };

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
            <p className="text-xs text-slate-400 font-medium">Тема, резервная копия и сброс данных</p>
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

        <div className="mb-5 pb-5 border-b border-slate-100/80">
          <div className="flex items-center gap-2 mb-3">
            <Download className="text-slate-500" size={17} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Резервная копия
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-normal">
            Сохраните все задачи, заметки и привычки в файл — чтобы перенести их на другой телефон или сделать бэкап.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onExportBackup}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 px-3 text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
            >
              <Download size={14} />
              Скачать файл
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportChange}
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              <Upload size={14} />
              Восстановить из файла
            </button>
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
