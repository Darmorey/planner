import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Habit } from '../types';
import { getDotBgClass } from '../utils/themeHelpers';
import {
  STATS_RANGE_OPTIONS,
  StatsRange,
  shiftStatsAnchor,
  formatStatsRangeLabel,
  getDailyHabitStats,
  getDailyWeekVisualization,
  getDailyMonthCalendar,
  getDailyYearBars,
  getPeriodicHabitStats,
  getPeriodicVisualization,
  getDailyStreaks,
} from '../utils/habitStatsHelpers';

interface HabitStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  initialDate: string;
}

export default function HabitStatsModal({
  isOpen,
  onClose,
  habit,
  initialDate,
}: HabitStatsModalProps) {
  const [range, setRange] = useState<StatsRange>('month');
  const [anchorDate, setAnchorDate] = useState(initialDate);

  useEffect(() => {
    if (isOpen) {
      setAnchorDate(initialDate);
      setRange('month');
    }
  }, [isOpen, initialDate, habit?.id]);

  if (!isOpen || !habit) return null;

  const color = habit.color || 'green';
  const dotClass = getDotBgClass(color);
  const isDaily = habit.kind === 'daily';

  const summary = isDaily
    ? getDailyHabitStats(habit, range, anchorDate)
    : getPeriodicHabitStats(habit, range, anchorDate);

  const streaks = isDaily ? getDailyStreaks(habit) : null;
  const rangeLabel = formatStatsRangeLabel(range, anchorDate);

  const shiftAnchor = (delta: -1 | 1) => {
    setAnchorDate(prev => shiftStatsAnchor(prev, range, delta));
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 pr-8 truncate">{habit.title}</h3>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            {isDaily ? 'Ежедневная привычка' : 'Цель периода'}
          </p>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Header: percent + range dropdown */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-5xl font-extrabold text-slate-900 leading-none tabular-nums">
                {summary.percent}%
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {summary.total > 0
                  ? `${summary.completed} из ${summary.total} ${summary.unitLabel}`
                  : 'Пока нет данных'}
              </p>
            </div>
            <select
              value={range}
              onChange={e => setRange(e.target.value as StatsRange)}
              className="shrink-0 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {STATS_RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period navigator */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftAnchor(-1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Предыдущий период"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-slate-700 text-center flex-1">{rangeLabel}</span>
            <button
              type="button"
              onClick={() => shiftAnchor(1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Следующий период"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Visualization */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            {isDaily ? (
              <DailyVisualization
                habit={habit}
                range={range}
                anchorDate={anchorDate}
                dotClass={dotClass}
              />
            ) : (
              <PeriodicVisualization
                habit={habit}
                range={range}
                anchorDate={anchorDate}
              />
            )}
          </div>

          {streaks && (streaks.current > 0 || streaks.best > 0) && (
            <p className="text-xs text-slate-500 text-center">
              {streaks.current > 0 && (
                <span className="font-semibold text-emerald-600">{streaks.current} дн. подряд</span>
              )}
              {streaks.current > 0 && streaks.best > 0 && ' · '}
              {streaks.best > 0 && (
                <span>рекорд: {streaks.best} дн.</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyVisualization({
  habit,
  range,
  anchorDate,
  dotClass,
}: {
  habit: Habit;
  range: StatsRange;
  anchorDate: string;
  dotClass: string;
}) {
  if (range === 'week') {
    const days = getDailyWeekVisualization(habit, anchorDate);
    return (
      <div className="flex justify-between gap-1 px-2">
        {days.map(day => (
          <div key={day.dateStr} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{day.dayLabel}</span>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                !day.inRange
                  ? 'bg-transparent'
                  : day.isFuture
                    ? 'bg-slate-100 border border-dashed border-slate-200'
                    : day.done
                      ? dotClass
                      : 'bg-slate-200/80'
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (range === 'month') {
    const cells = getDailyMonthCalendar(habit, anchorDate);
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(w => (
            <span key={w} className="text-[9px] font-bold text-slate-400 text-center uppercase">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (cell.status === 'padding' || cell.dayNum === null) {
              return <div key={`pad-${i}`} className="aspect-square" />;
            }
            return (
              <div key={cell.dateStr!} className="flex flex-col items-center gap-0.5 aspect-square">
                <span className="text-[9px] text-slate-400 font-medium">{cell.dayNum}</span>
                <span
                  className={`w-full max-w-[28px] aspect-square rounded-full ${
                    cell.status === 'before'
                      ? 'opacity-0'
                      : cell.status === 'future'
                        ? 'bg-slate-100 border border-dashed border-slate-200'
                        : cell.status === 'done'
                          ? dotClass
                          : 'bg-slate-200/80'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const bars = getDailyYearBars(habit, anchorDate);
  const maxPercent = Math.max(...bars.map(b => b.percent), 1);

  return (
    <div className="flex items-end justify-between gap-1 h-32 px-1">
      {bars.map(bar => (
        <div key={bar.monthIndex} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div className="w-full flex items-end justify-center h-24">
            <div
              className={`w-full max-w-[18px] rounded-t-md transition-all ${bar.total > 0 ? dotClass : 'bg-slate-100'}`}
              style={{
                height: bar.total > 0 ? `${Math.max(8, (bar.percent / maxPercent) * 100)}%` : '4px',
                opacity: bar.total > 0 ? 0.55 + (bar.percent / 100) * 0.45 : 1,
              }}
              title={`${bar.label}: ${bar.percent}%`}
            />
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase truncate w-full text-center">
            {bar.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function PeriodicVisualization({
  habit,
  range,
  anchorDate,
}: {
  habit: Habit;
  range: StatsRange;
  anchorDate: string;
}) {
  const rows = getPeriodicVisualization(habit, range, anchorDate);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">Пока нет данных</p>;
  }

  if (range === 'year' && rows.length > 6) {
    const done = rows.filter(r => r.done).length;
    return (
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
          {rows.map(row => (
            <div
              key={row.periodKey}
              className={`aspect-square rounded-lg flex items-center justify-center ${
                row.done ? 'bg-emerald-500/80' : 'bg-slate-200/80'
              }`}
              title={row.label}
            />
          ))}
        </div>
        <p className="text-[11px] text-slate-500 text-center">
          {done} из {rows.length} периодов выполнено
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-48 overflow-y-auto">
      {rows.map(row => (
        <li
          key={row.periodKey}
          className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${
            row.done ? 'bg-emerald-50/80' : 'bg-white/80'
          }`}
        >
          {row.done ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-700">{row.label}</p>
            {row.preview && (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{row.preview}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
