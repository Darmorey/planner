import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { doesTaskOccurOnDate, parseLocalDate, formatLocalDate } from '../utils/taskHelpers';

interface MonthCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string, keepOpen?: boolean) => void;
  tasks: Task[];
  theme?: any;
  fullWidth?: boolean;
}

const RUSSIAN_MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const RUSSIAN_MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const RUSSIAN_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MAX_VISIBLE_TASKS = 4;

const getPillStyle = (color: string) => {
  switch (color) {
    case 'red': return 'bg-[#FAD4D4] text-[#8A3030]';
    case 'green': return 'bg-[#D4EDDA] text-[#2E5E30]';
    case 'purple': return 'bg-[#E2D4F0] text-[#4A3060]';
    case 'orange': return 'bg-[#FFF3CD] text-[#7A5C0C]';
    case 'dark': return 'bg-[#D4E8E4] text-[#1E4038]';
    case 'blue': return 'bg-[#D4E4F7] text-[#1E4A70]';
    case 'darkGreen': return 'bg-[#C8E6C9] text-[#1B4332]';
    case 'mossGreen': return 'bg-[#D4EDDA] text-[#334C10]';
    case 'beige': return 'bg-[#F5E6D3] text-[#593C1C]';
    case 'rosyBrown': return 'bg-[#FAD4D4] text-[#7A4060]';
    case 'midnightGreen': return 'bg-[#D4E8E4] text-[#0A2D23]';
    case 'spaceCadet': return 'bg-[#E2D4F0] text-[#3D1D8C]';
    case 'slateGray': return 'bg-[#E8ECF0] text-[#3B546A]';
    case 'tan': return 'bg-[#F5E6D3] text-[#593C1C]';
    case 'coffee': return 'bg-[#E8DDD4] text-[#4A3228]';
    case 'caputMortuum': return 'bg-[#F0D4D4] text-[#6B2020]';
    default: return 'bg-[#D4E4F7] text-[#1E4A70]';
  }
};

interface DayColumnProps {
  dateStr: string;
  dayNum: number;
  isInMonth?: boolean;
  isSelected: boolean;
  isToday: boolean;
  dayTasks: Task[];
  onSelectDate: (date: string, keepOpen?: boolean) => void;
  cAccentBg: string;
  cAccentText: string;
  cSubAccentBgLight: string;
  compact?: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({
  dateStr,
  dayNum,
  isInMonth = true,
  isSelected,
  isToday,
  dayTasks,
  onSelectDate,
  cAccentBg,
  cAccentText,
  cSubAccentBgLight,
  compact = false,
}) => {
  const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
  const overflowCount = dayTasks.length - MAX_VISIBLE_TASKS;

  return (
    <div
      onClick={() => onSelectDate(dateStr, false)}
      className={`flex min-w-0 flex-1 flex-col cursor-pointer select-none py-1 ${!isInMonth ? 'opacity-40' : ''}`}
    >
      <div className={`mb-1 flex justify-center ${compact ? 'mb-0.5' : ''}`}>
        <span
          className={`flex items-center justify-center font-bold leading-none ${
            compact ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-lg'
          } rounded-full transition-colors ${
            isSelected
              ? `${cAccentBg} text-white shadow-sm`
              : isToday
                ? `${cSubAccentBgLight} ${cAccentText}`
                : isInMonth
                  ? 'text-slate-700'
                  : 'text-slate-400'
          }`}
        >
          {dayNum}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={`truncate rounded-md px-1 py-0.5 font-medium leading-tight ${
              compact ? 'text-[9px]' : 'text-[10px]'
            } ${getPillStyle(task.color || 'blue')}`}
            title={task.time ? `${task.time} — ${task.title}` : task.title}
          >
            {task.title}
          </div>
        ))}
        {overflowCount > 0 && (
          <div className={`font-semibold text-slate-400 ${compact ? 'text-[8px]' : 'text-[9px]'} px-0.5`}>
            +{overflowCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonthCalendar({
  selectedDate,
  onSelectDate,
  tasks,
  theme: t,
  fullWidth = true,
}: MonthCalendarProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');

  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || 2026;
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return m !== undefined ? m - 1 : 5;
  });

  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(() => parseLocalDate(selectedDate));

  useEffect(() => {
    const parsed = parseLocalDate(selectedDate);
    setWeekAnchorDate(parsed);
    setCurrentYear(parsed.getFullYear());
    setCurrentMonth(parsed.getMonth());
  }, [selectedDate]);

  const handlePrev = () => {
    if (viewMode === 'week') {
      const prevWeek = new Date(weekAnchorDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setWeekAnchorDate(prevWeek);
      onSelectDate(formatLocalDate(prevWeek), true);
    } else if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      setCurrentYear((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      const nextWeek = new Date(weekAnchorDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setWeekAnchorDate(nextWeek);
      onSelectDate(formatLocalDate(nextWeek), true);
    } else if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else {
      setCurrentYear((prev) => prev + 1);
    }
  };

  const getMonday = (d: Date): Date => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayRaw = new Date(currentYear, currentMonth, 1).getDay();
  const startDay = startDayRaw === 0 ? 6 : startDayRaw - 1;

  const daysGrid: Array<{ dateStr: string; dayNum: number; isInMonth: boolean }> = [];

  const prevMonthObj = new Date(currentYear, currentMonth, 0);
  const daysInPrevMonth = prevMonthObj.getDate();
  const prevMonth = prevMonthObj.getMonth();
  const prevYear = prevMonthObj.getFullYear();

  for (let i = startDay - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const mStr = String(prevMonth + 1).padStart(2, '0');
    daysGrid.push({
      dateStr: `${prevYear}-${mStr}-${String(dNum).padStart(2, '0')}`,
      dayNum: dNum,
      isInMonth: false,
    });
  }

  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push({
      dateStr: `${currentYear}-${currentMonthStr}-${String(i).padStart(2, '0')}`,
      dayNum: i,
      isInMonth: true,
    });
  }

  const remainingCells = 42 - daysGrid.length;
  const nextMonthObj = new Date(currentYear, currentMonth + 1, 1);
  const nextMonth = nextMonthObj.getMonth();
  const nextYear = nextMonthObj.getFullYear();
  const nextMonthStr = String(nextMonth + 1).padStart(2, '0');

  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({
      dateStr: `${nextYear}-${nextMonthStr}-${String(i).padStart(2, '0')}`,
      dayNum: i,
      isInMonth: false,
    });
  }

  const monthWeeks: typeof daysGrid[] = [];
  for (let i = 0; i < daysGrid.length; i += 7) {
    monthWeeks.push(daysGrid.slice(i, i + 7));
  }

  const mondayOfAnchor = getMonday(weekAnchorDate);
  const weekDaysGrid: Array<{ dateStr: string; dayNum: number }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfAnchor);
    d.setDate(mondayOfAnchor.getDate() + i);
    weekDaysGrid.push({
      dateStr: formatLocalDate(d),
      dayNum: d.getDate(),
    });
  }

  const getWeekRangeLabel = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.getDate()} – ${sunday.getDate()} ${RUSSIAN_MONTHS[monday.getMonth()]} ${monday.getFullYear()}`;
    }
    if (monday.getFullYear() === sunday.getFullYear()) {
      return `${monday.getDate()} ${mShort[monday.getMonth()]} – ${sunday.getDate()} ${mShort[sunday.getMonth()]} ${monday.getFullYear()}`;
    }
    return `${monday.getDate()} ${mShort[monday.getMonth()]} ${monday.getFullYear()} – ${sunday.getDate()} ${mShort[sunday.getMonth()]} ${sunday.getFullYear()}`;
  };

  const getEventsForDate = (dateStr: string): Task[] => {
    return tasks.filter(
      (task) => task.category === 'event' && doesTaskOccurOnDate(task, dateStr)
    );
  };

  const todayStr = formatLocalDate(new Date());

  const cAccentText = t ? t.accentText : 'text-[#2C4A52]';
  const cAccentBg = t ? t.accentBg : 'bg-[#2C4A52]';
  const cAccentBorderSolid = t ? t.accentBorderSolid : 'border-[#2C4A52]';
  const cSubAccentBgLight = t ? t.subAccentBgLight : 'bg-[#6398A9]/10';
  const cSubAccentBorderLight = t ? t.subAccentBorderLight : 'border-[#6398A9]/15';
  const cSubAccentBg = t ? t.subAccentBg : 'bg-[#6398A9]';

  return (
    <div
      className={`bg-white transition-all duration-300 ${
        fullWidth
          ? `border-y ${t ? t.accentBorder : 'border-[#6398A9]/20'} px-2 py-4`
          : `rounded-2xl border p-5 ${t ? t.accentBorder : 'border-[#6398A9]/20'} shadow-sm`
      }`}
    >
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b ${cSubAccentBorderLight} pb-3 ${fullWidth ? 'px-2' : ''}`}>
        <div className="flex bg-slate-100/80 p-0.5 rounded-xl self-start">
          {(['week', 'month', 'year'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                if (mode === 'month') {
                  const parsed = parseLocalDate(selectedDate);
                  setCurrentYear(parsed.getFullYear());
                  setCurrentMonth(parsed.getMonth());
                }
                setViewMode(mode);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === mode ? `bg-white shadow-sm ${cAccentText}` : 'text-slate-500 hover:text-slate-900 font-semibold'
              }`}
            >
              {mode === 'week' ? 'Неделя' : mode === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 flex-1">
          <h3 className={`text-sm font-extrabold ${cAccentText} tracking-wide`}>
            {viewMode === 'week' && getWeekRangeLabel(mondayOfAnchor)}
            {viewMode === 'month' && `${RUSSIAN_MONTHS[currentMonth]} ${currentYear}`}
            {viewMode === 'year' && `${currentYear} год`}
          </h3>

          <div className="flex gap-1">
            <button
              onClick={handlePrev}
              className={`p-1.5 hover:bg-slate-50 ${cAccentText} rounded-lg transition-colors border ${t ? t.accentBorder : 'border-[#6398A9]/25'}`}
              aria-label="Назад"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className={`p-1.5 hover:bg-slate-50 ${cAccentText} rounded-lg transition-colors border ${t ? t.accentBorder : 'border-[#6398A9]/25'}`}
              aria-label="Вперед"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'week' && (
        <div className={fullWidth ? '' : 'px-1'}>
          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {RUSSIAN_WEEKDAYS.map((wd, idx) => (
              <div key={wd} className={idx >= 5 ? cAccentText : ''}>
                {wd}
              </div>
            ))}
          </div>
          <div className="flex min-h-[200px]">
            {weekDaysGrid.map(({ dateStr, dayNum }) => (
              <DayColumn
                key={dateStr}
                dateStr={dateStr}
                dayNum={dayNum}
                isSelected={dateStr === selectedDate}
                isToday={dateStr === todayStr}
                dayTasks={getEventsForDate(dateStr)}
                onSelectDate={onSelectDate}
                cAccentBg={cAccentBg}
                cAccentText={cAccentText}
                cSubAccentBgLight={cSubAccentBgLight}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className={fullWidth ? '' : 'px-1'}>
          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {RUSSIAN_WEEKDAYS.map((wd, idx) => (
              <div key={wd} className={idx >= 5 ? cAccentText : ''}>
                {wd}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {monthWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex min-h-[110px] py-1">
                {week.map(({ dateStr, dayNum, isInMonth }) => (
                  <DayColumn
                    key={dateStr}
                    dateStr={dateStr}
                    dayNum={dayNum}
                    isInMonth={isInMonth}
                    isSelected={dateStr === selectedDate}
                    isToday={dateStr === todayStr}
                    dayTasks={getEventsForDate(dateStr)}
                    compact
                    onSelectDate={onSelectDate}
                    cAccentBg={cAccentBg}
                    cAccentText={cAccentText}
                    cSubAccentBgLight={cSubAccentBgLight}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'year' && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${fullWidth ? 'px-2' : ''}`}>
          {RUSSIAN_MONTHS.map((monthName, mIdx) => {
            const miniDaysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();
            const miniStartDayRaw = new Date(currentYear, mIdx, 1).getDay();
            const miniStartDay = miniStartDayRaw === 0 ? 6 : miniStartDayRaw - 1;

            return (
              <div
                key={monthName}
                onClick={() => {
                  setCurrentMonth(mIdx);
                  setViewMode('month');
                }}
                className="cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-white hover:shadow-sm"
              >
                <h4 className="mb-2 border-b border-slate-100 pb-1 text-xs font-bold uppercase tracking-wide text-slate-800">
                  {monthName}
                </h4>

                <div className="mb-1 grid grid-cols-7 text-center text-[7px] font-bold text-slate-400">
                  {RUSSIAN_WEEKDAYS.map((wd) => (
                    <div key={wd}>{wd[0]}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: miniStartDay }).map((_, index) => (
                    <div key={`offset-${index}`} className="h-4" />
                  ))}

                  {Array.from({ length: miniDaysInMonth }).map((_, dIdx) => {
                    const dayNumber = dIdx + 1;
                    const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const hasTasks = getEventsForDate(dateStr).length > 0;

                    return (
                      <div
                        key={`day-${dayNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDate(dateStr, true);
                          setCurrentMonth(mIdx);
                          setViewMode('month');
                        }}
                        className={`relative flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold transition-all ${
                          isSelected ? `${cAccentBg} text-white scale-110` : 'text-slate-600 hover:bg-slate-200'
                        } ${isToday && !isSelected ? `${cSubAccentBgLight} ${cAccentText} font-bold` : ''}`}
                        title={`${dayNumber} ${RUSSIAN_MONTHS_GENITIVE[mIdx]}`}
                      >
                        {dayNumber}
                        {hasTasks && !isSelected && (
                          <span className={`absolute -bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full ${cSubAccentBg}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`mt-3 flex flex-wrap items-center justify-between gap-2 border-t ${cSubAccentBorderLight} pt-3 text-[11px] text-slate-500 ${fullWidth ? 'px-2' : ''}`}>
        <span>В календаре отображаются только события</span>
        <div className="flex items-center gap-1.5 font-bold">
          <div className={`h-3 w-3 rounded-full ${cAccentBg}`} />
          <span>Выбранный день</span>
        </div>
      </div>
    </div>
  );
}
