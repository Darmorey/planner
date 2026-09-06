import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { Habit, HabitKind, HabitPeriod } from '../types';
import { getDefaultTaskColor, ThemeId } from '../utils/themeTypes';
import { getPeriodKindLabel } from '../utils/habitHelpers';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    kind: HabitKind;
    period?: HabitPeriod;
    color?: string;
  }) => void;
  initialHabit?: Habit | null;
  defaultKind: HabitKind;
  theme: ThemeId;
}

const COLOR_OPTIONS = [
  { value: 'green', bg: 'bg-[#C3D9AB]' },
  { value: 'blue', bg: 'bg-[#ABC3D9]' },
  { value: 'purple', bg: 'bg-[#C3ABD9]' },
  { value: 'orange', bg: 'bg-[#EED0AC]' },
  { value: 'red', bg: 'bg-[#D9ABC3]' },
  { value: 'dark', bg: 'bg-[#ABD9D1]' },
];

export default function HabitFormModal({
  isOpen,
  onClose,
  onSave,
  initialHabit,
  defaultKind,
  theme,
}: HabitFormModalProps) {
  const themeDefaultColor = getDefaultTaskColor(theme);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<HabitKind>(defaultKind);
  const [period, setPeriod] = useState<HabitPeriod>('month');
  const [color, setColor] = useState(themeDefaultColor);

  useEffect(() => {
    if (!isOpen) return;
    if (initialHabit) {
      setTitle(initialHabit.title);
      setKind(initialHabit.kind);
      setPeriod(initialHabit.period || 'month');
      setColor(initialHabit.color || themeDefaultColor);
    } else {
      setTitle('');
      setKind(defaultKind);
      setPeriod('month');
      setColor(themeDefaultColor);
    }
  }, [isOpen, initialHabit, defaultKind, themeDefaultColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialHabit?.id,
      title: title.trim(),
      kind,
      period: kind === 'periodic' ? period : undefined,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="relative bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 pr-8">
            {initialHabit ? 'Редактировать привычку' : kind === 'daily' ? 'Новая ежедневная привычка' : 'Новая цель периода'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Название
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={kind === 'daily' ? '10 минут английского' : 'Посещать новое место'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300/30 text-slate-900 font-semibold"
            />
          </div>

          {!initialHabit && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Тип
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind('daily')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    kind === 'daily'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Каждый день
                </button>
                <button
                  type="button"
                  onClick={() => setKind('periodic')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    kind === 'periodic'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Цель периода
                </button>
              </div>
            </div>
          )}

          {kind === 'periodic' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Период
              </label>
              <div className="flex flex-wrap gap-2">
                {(['week', 'month', 'year'] as HabitPeriod[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      period === p
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {getPeriodKindLabel(p)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Цвет
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                    color === c.value ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'hover:opacity-85'
                  }`}
                  aria-label={c.value}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Save size={15} />
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
