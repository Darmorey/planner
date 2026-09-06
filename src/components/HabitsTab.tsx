import React, { useEffect, useState } from 'react';
import {
  Plus, CheckCircle2, Circle, Edit2, Trash2, ChevronDown,
  Repeat, Target,
} from 'lucide-react';
import { Habit } from '../types';
import { getTaskBgClass, getTaskBorderLeftClass } from '../utils/themeHelpers';
import {
  formatPeriodLabel,
  getPeriodKey,
  getWeekDatesContaining,
  getWeekdayShortLabels,
} from '../utils/habitHelpers';

interface HabitsTabProps {
  habits: Habit[];
  selectedDate: string;
  cardBg: string;
  subAccentBorderLight: string;
  subAccentBorderLight10: string;
  subAccentBgLight: string;
  subAccentText: string;
  accentText: string;
  accentBg: string;
  accentBgHover: string;
  onAddDaily: () => void;
  onAddPeriodic: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onToggleDaily: (habitId: string, dateStr: string) => void;
  onSavePeriodicEntry: (habitId: string, periodKey: string, text: string) => void;
}

function DailyHabitCard({
  habit,
  selectedDate,
  weekDates,
  weekdayLabels,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  selectedDate: string;
  weekDates: string[];
  weekdayLabels: string[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const completed = habit.completedDates || [];
  const isDoneToday = completed.includes(selectedDate);
  const color = habit.color || 'green';

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border border-l-4 transition-all ${getTaskBgClass(color)} ${getTaskBorderLeftClass(color)}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 text-slate-400 hover:opacity-80 transition-colors"
        aria-label={isDoneToday ? 'Снять отметку' : 'Отметить выполненным'}
      >
        {isDoneToday ? (
          <CheckCircle2 size={22} className="text-emerald-600" />
        ) : (
          <Circle size={22} className="opacity-50" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isDoneToday ? 'opacity-70' : ''}`}>
          {habit.title}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {weekDates.map((d, i) => {
            const done = completed.includes(d);
            const isSelected = d === selectedDate;
            return (
              <div key={d} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase">{weekdayLabels[i]}</span>
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    done
                      ? 'bg-emerald-500'
                      : isSelected
                        ? 'bg-slate-300 ring-2 ring-slate-400/40'
                        : 'bg-slate-200/80'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 hover:bg-black/5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
        >
          <Edit2 size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function PeriodicHabitCard({
  habit,
  selectedDate,
  onSaveEntry,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  selectedDate: string;
  onSaveEntry: (text: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const period = habit.period || 'month';
  const periodKey = getPeriodKey(period, selectedDate);
  const periodLabel = formatPeriodLabel(period, periodKey);
  const entries = habit.entries || [];
  const currentEntry = entries.find(e => e.periodKey === periodKey);
  const pastEntries = entries
    .filter(e => e.periodKey !== periodKey && e.text.trim())
    .sort((a, b) => b.createdAt - a.createdAt);

  const [draft, setDraft] = useState(currentEntry?.text || '');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setDraft(currentEntry?.text || '');
  }, [currentEntry?.text, periodKey]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed && !currentEntry) return;
    onSaveEntry(trimmed);
  };

  const color = habit.color || 'green';

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${getTaskBgClass(color)} border-black/5`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold leading-snug">{habit.title}</h4>
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mt-0.5">
            {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {currentEntry?.text.trim() && (
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
          )}
          <button type="button" onClick={onEdit} className="p-1.5 hover:bg-black/5 text-slate-400 hover:text-slate-700 rounded-lg">
            <Edit2 size={13} />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white/70 border border-black/5 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          {periodLabel}
        </p>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Что сделала в этом периоде?"
          rows={2}
          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!draft.trim()}
          className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-colors"
        >
          Сохранить
        </button>
      </div>

      {pastEntries.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setHistoryOpen(v => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
          >
            <ChevronDown size={14} className={`transition-transform ${historyOpen ? '' : '-rotate-90'}`} />
            Прошлые периоды ({pastEntries.length})
          </button>
          {historyOpen && (
            <ul className="mt-2 space-y-1.5 pl-1">
              {pastEntries.map(entry => (
                <li key={entry.periodKey} className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-500">
                    {formatPeriodLabel(period, entry.periodKey)}:
                  </span>{' '}
                  {entry.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function HabitsTab({
  habits,
  selectedDate,
  cardBg,
  subAccentBorderLight,
  subAccentBorderLight10,
  subAccentBgLight,
  subAccentText,
  accentText,
  accentBg,
  accentBgHover,
  onAddDaily,
  onAddPeriodic,
  onEditHabit,
  onDeleteHabit,
  onToggleDaily,
  onSavePeriodicEntry,
}: HabitsTabProps) {
  const dailyHabits = habits.filter(h => h.kind === 'daily');
  const periodicHabits = habits.filter(h => h.kind === 'periodic');
  const weekDates = getWeekDatesContaining(selectedDate);
  const weekdayLabels = getWeekdayShortLabels();

  const confirmDelete = (id: string) => {
    if (window.confirm('Удалить эту привычку?')) {
      onDeleteHabit(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Daily */}
      <section>
        <div className={`flex items-center justify-between pb-2 border-b ${subAccentBorderLight10} mb-3`}>
          <div className="flex items-center gap-2">
            <Repeat size={16} className={subAccentText} />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${accentText}`}>
              Каждый день
            </h3>
            {dailyHabits.length > 0 && (
              <span className={`text-[10px] ${subAccentText} ${subAccentBgLight} font-bold px-2 py-0.5 rounded-full border ${subAccentBorderLight}`}>
                {dailyHabits.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onAddDaily}
            title="Добавить ежедневную привычку"
            className={`flex items-center justify-center w-8 h-8 ${accentBg} ${accentBgHover} text-white rounded-xl shadow-md transition-all active:scale-95`}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {dailyHabits.length === 0 ? (
          <div className={`text-center py-8 ${cardBg} rounded-2xl border ${subAccentBorderLight}`}>
            <Repeat size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm font-medium px-4">
              Мелкие привычки — отметка галочкой за день
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dailyHabits.map(habit => (
              <div key={habit.id}>
                <DailyHabitCard
                  habit={habit}
                  selectedDate={selectedDate}
                  weekDates={weekDates}
                  weekdayLabels={weekdayLabels}
                  onToggle={() => onToggleDaily(habit.id, selectedDate)}
                  onEdit={() => onEditHabit(habit)}
                  onDelete={() => confirmDelete(habit.id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Periodic */}
      <section>
        <div className={`flex items-center justify-between pb-2 border-b ${subAccentBorderLight10} mb-3`}>
          <div className="flex items-center gap-2">
            <Target size={16} className={subAccentText} />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${accentText}`}>
              Цели периода
            </h3>
            {periodicHabits.length > 0 && (
              <span className={`text-[10px] ${subAccentText} ${subAccentBgLight} font-bold px-2 py-0.5 rounded-full border ${subAccentBorderLight}`}>
                {periodicHabits.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onAddPeriodic}
            title="Добавить цель периода"
            className={`flex items-center justify-center w-8 h-8 ${accentBg} ${accentBgHover} text-white rounded-xl shadow-md transition-all active:scale-95`}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {periodicHabits.length === 0 ? (
          <div className={`text-center py-8 ${cardBg} rounded-2xl border ${subAccentBorderLight}`}>
            <Target size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm font-medium px-4">
              Большие цели — запишите, что сделали за месяц или неделю
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {periodicHabits.map(habit => (
              <div key={habit.id}>
                <PeriodicHabitCard
                  habit={habit}
                  selectedDate={selectedDate}
                  onSaveEntry={(text) => {
                    const key = getPeriodKey(habit.period || 'month', selectedDate);
                    onSavePeriodicEntry(habit.id, key, text);
                  }}
                  onEdit={() => onEditHabit(habit)}
                  onDelete={() => confirmDelete(habit.id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
