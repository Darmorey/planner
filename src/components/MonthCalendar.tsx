import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { doesTaskOccurOnDate, parseLocalDate, formatLocalDate } from '../utils/taskHelpers';

interface MonthCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string, keepOpen?: boolean) => void;
  tasks: Task[];
  theme?: any; // App theme t
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
const RUSSIAN_WEEKDAYS_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const getBadgeStyle = (color: string) => {
  switch (color) {
    case 'red': return 'bg-[#FF6B8B]/20 border border-[#FF6B8B]/30 text-[#8A102A]';
    case 'green': return 'bg-[#A6C261]/25 border border-[#A6C261]/35 text-[#334C10]';
    case 'purple': return 'bg-[#2E5AA7]/15 border border-[#2E5AA7]/30 text-[#163870]';
    case 'orange': return 'bg-[#F8E6A0]/45 border border-[#F8E6A0]/60 text-[#7A5C0C]';
    case 'dark': return 'bg-[#A88AED]/20 border border-[#A88AED]/30 text-[#3D1D8C]';
    case 'blue': return 'bg-[#86C5FF]/20 border border-[#86C5FF]/30 text-[#1E5D8C]';
    case 'darkGreen': return 'bg-[#0E3A2F]/15 border border-[#0E3A2F]/25 text-[#0E3A2F]';
    case 'mossGreen': return 'bg-[#A6C261]/20 border border-[#A6C261]/30 text-[#334C10]';
    case 'beige': return 'bg-[#D5B993]/20 border border-[#D5B993]/35 text-[#593C1C]';
    case 'rosyBrown': return 'bg-[#FF6B8B]/20 border border-[#FF6B8B]/35 text-[#8A102A]';
    case 'midnightGreen': return 'bg-[#0A2D23]/15 border border-[#0A2D23]/25 text-[#0A2D23]';
    case 'spaceCadet': return 'bg-[#A88AED]/20 border border-[#A88AED]/35 text-[#3D1D8C]';
    case 'slateGray': return 'bg-[#86C5FF]/20 border border-[#86C5FF]/35 text-[#1E5D8C]';
    case 'tan': return 'bg-[#D5B993]/20 border border-[#D5B993]/35 text-[#593C1C]';
    case 'coffee': return 'bg-[#D5B993]/20 border border-[#D5B993]/35 text-[#593C1C]';
    case 'caputMortuum': return 'bg-[#FF6B8B]/20 border border-[#FF6B8B]/35 text-[#8A102A]';
    default: return 'bg-[#86C5FF]/20 border border-[#86C5FF]/30 text-[#1E5D8C]';
  }
};

export default function MonthCalendar({ selectedDate, onSelectDate, tasks, theme: t }: MonthCalendarProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');

  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || 2026;
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return (m !== undefined ? m - 1 : 5); // 0-indexed, default is June (5)
  });

  // Week view anchor date state
  const [weekAnchorDate, setWeekAnchorDate] = useState<Date>(() => parseLocalDate(selectedDate));

  // Sync state if selectedDate changes externally
  useEffect(() => {
    const parsed = parseLocalDate(selectedDate);
    setWeekAnchorDate(parsed);
    setCurrentYear(parsed.getFullYear());
    setCurrentMonth(parsed.getMonth());
  }, [selectedDate]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'week') {
      const prevWeek = new Date(weekAnchorDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setWeekAnchorDate(prevWeek);
      // Automatically select the same day of the previous week
      const dateStr = formatLocalDate(prevWeek);
      onSelectDate(dateStr, true);
    } else if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      setCurrentYear(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      const nextWeek = new Date(weekAnchorDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setWeekAnchorDate(nextWeek);
      // Automatically select the same day of the next week
      const dateStr = formatLocalDate(nextWeek);
      onSelectDate(dateStr, true);
    } else if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  // Helper to find Monday for a given week reference date
  const getMonday = (d: Date): Date => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  // Generate days grid for month view
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let startDayRaw = new Date(currentYear, currentMonth, 1).getDay();
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
      isInMonth: false
    });
  }

  const currentMonthStr = String(currentMonth + 1).padStart(2, '0');
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push({
      dateStr: `${currentYear}-${currentMonthStr}-${String(i).padStart(2, '0')}`,
      dayNum: i,
      isInMonth: true
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
      isInMonth: false
    });
  }

  // Generate 7 days for the Week View
  const mondayOfAnchor = getMonday(weekAnchorDate);
  const weekDaysGrid: Array<{ dateStr: string; dateObj: Date }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayOfAnchor);
    d.setDate(mondayOfAnchor.getDate() + i);
    weekDaysGrid.push({
      dateStr: formatLocalDate(d),
      dateObj: d
    });
  }

  // Text formatting
  const getWeekRangeLabel = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.getDate()} – ${sunday.getDate()} ${RUSSIAN_MONTHS[monday.getMonth()]} ${monday.getFullYear()}`;
    } else if (monday.getFullYear() === sunday.getFullYear()) {
      return `${monday.getDate()} ${mShort[monday.getMonth()]} – ${sunday.getDate()} ${mShort[sunday.getMonth()]} ${monday.getFullYear()}`;
    } else {
      return `${monday.getDate()} ${mShort[monday.getMonth()]} ${monday.getFullYear()} – ${sunday.getDate()} ${mShort[sunday.getMonth()]} ${sunday.getFullYear()}`;
    }
  };

  const getEventsForDate = (dateStr: string): Task[] => {
    return tasks.filter(task => task.category === 'event' && doesTaskOccurOnDate(task, dateStr));
  };

  const getAnyTasksForDate = (dateStr: string): Task[] => {
    return tasks.filter(task => doesTaskOccurOnDate(task, dateStr));
  };

  const todayStr = formatLocalDate(new Date());

  // Dynamic theme styling aliases or fallbacks
  const cAccentText = t ? t.accentText : 'text-[#2C4A52]';
  const cAccentBg = t ? t.accentBg : 'bg-[#2C4A52]';
  const cAccentBorderSolid = t ? t.accentBorderSolid : 'border-[#2C4A52]';
  const cSubAccentBgLight = t ? t.subAccentBgLight : 'bg-[#6398A9]/10';
  const cSubAccentBorderLight = t ? t.subAccentBorderLight : 'border-[#6398A9]/15';
  const cSubAccentBg = t ? t.subAccentBg : 'bg-[#6398A9]';
  const cSubAccentHover = t ? t.subAccentHover : 'hover:bg-[#528292]';
  const cSubAccentText = t ? t.subAccentText : 'text-[#6398A9]';

  return (
    <div className={`bg-white rounded-2xl p-5 border ${t ? t.accentBorder : 'border-[#6398A9]/20'} shadow-sm transition-all duration-300`}>
      {/* Header controls with integrated View Selector for premium aesthetic */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b ${cSubAccentBorderLight} pb-4`}>
        {/* View mode buttons */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-xl self-start">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'week' ? `bg-white shadow-sm ${cAccentText}` : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => {
              const parsed = parseLocalDate(selectedDate);
              setCurrentYear(parsed.getFullYear());
              setCurrentMonth(parsed.getMonth());
              setViewMode('month');
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'month' ? `bg-white shadow-sm ${cAccentText}` : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'year' ? `bg-white shadow-sm ${cAccentText}` : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`}
          >
            Год
          </button>
        </div>

        {/* Navigation & Label */}
        <div className="flex items-center justify-between sm:justify-end gap-4 flex-1">
          <h3 className={`text-[14px] xs:text-base font-extrabold ${cAccentText} tracking-wide`}>
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

      {/* RENDER VIEW ACCORDINGLY */}
      
      {/* 1. WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[220px]">
          {weekDaysGrid.map(({ dateStr, dateObj }, idx) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDate(dateStr);
            const allDayTasks = getAnyTasksForDate(dateStr);
            const dayOfWeekLabel = RUSSIAN_WEEKDAYS_FULL[idx];

            return (
              <div
                key={dateStr}
                onClick={() => onSelectDate(dateStr, false)}
                className={`
                  flex flex-col rounded-2xl p-3 border min-h-[140px] cursor-pointer transition-all
                  ${isSelected ? `${cSubAccentBgLight} ${cAccentBorderSolid} ring-1 ring-offset-0 ring-[#2C4A52] font-semibold` : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/30'}
                  ${isToday && !isSelected ? `border ${cSubAccentBorderLight} ${cSubAccentBgLight} ${cAccentText} font-semibold` : ''}
                `}
              >
                {/* Header of weekday card */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-1.5 mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{RUSSIAN_WEEKDAYS[idx]}</span>
                    <span className="text-xs text-slate-500 md:hidden font-medium">{dayOfWeekLabel}</span>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    isSelected ? `${cAccentBg} text-white` : 'bg-slate-100 text-slate-600'
                  }`}>
                    {dateObj.getDate()}
                  </span>
                </div>

                {/* Day Agenda / Event count */}
                <div className="flex-1 space-y-1.5 overflow-hidden flex flex-col justify-start">
                  {dayEvents.length > 0 ? (
                    dayEvents.slice(0, 3).map((event) => {
                      const badgeStyle = getBadgeStyle(event.color || 'blue');

                      return (
                        <div 
                          key={event.id}
                          className={`text-[8.5px] px-1.5 py-0.5 rounded leading-tight truncate font-bold ${badgeStyle}`}
                          title={`${event.time ? `${event.time} ` : ''}${event.title}`}
                        >
                          {event.time ? `${event.time} ` : ''}{event.title}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[9px] text-slate-300 italic text-center py-2">
                      Нет событий
                    </div>
                  )}
                  {dayEvents.length > 3 && (
                    <div className={`text-[8px] ${cSubAccentText} font-bold text-center mt-1`}>
                      Еще +{dayEvents.length - 3} событ.
                    </div>
                  )}
                </div>

                {/* Counter indicator */}
                {allDayTasks.length > 0 && (
                  <div className="mt-2 pt-1 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-400">
                    <span>Задач всего:</span>
                    <span className={`font-bold ${cSubAccentBgLight} ${cAccentText} rounded-md px-1 py-0.2 border ${cSubAccentBorderLight}`}>{allDayTasks.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. MONTH VIEW */}
      {viewMode === 'month' && (
        <>
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-y-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            {RUSSIAN_WEEKDAYS.map((wd, idx) => (
              <div key={wd} className={idx >= 5 ? `${cSubAccentText}` : ''}>
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map(({ dateStr, dayNum, isInMonth }, index) => {
              const isSelected = dateStr === selectedDate;
              const events = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={`${dateStr}-${index}`}
                  onClick={() => onSelectDate(dateStr, false)}
                  className={`
                    relative min-h-[72px] flex flex-col justify-between rounded-lg p-1 transition-all text-left cursor-pointer border select-none
                    ${!isInMonth ? 'bg-slate-50/20 text-slate-300 border-slate-50' : 'bg-white text-slate-800 border-slate-100 hover:bg-slate-50/50 hover:border-slate-300'}
                    ${isSelected 
                      ? `${cSubAccentBgLight} ${cAccentBorderSolid} ring-1 ring-offset-0 ring-[#2C4A52] font-semibold` 
                      : ''
                    }
                    ${isToday && !isSelected ? `border ${cAccentBorderSolid} ${cSubAccentBgLight} ${cAccentText} font-bold` : ''}
                  `}
                >
                  <span className={`text-[11px] font-bold self-end px-1.5 py-0.5 rounded ${
                    isSelected ? `${cAccentBg} text-white` : 'text-slate-500'
                  }`}>{dayNum}</span>
                  
                  {/* Event titles with Time and Name */}
                  <div className="space-y-0.5 mt-1 overflow-hidden flex-1 flex flex-col justify-end">
                    {events.slice(0, 2).map((event) => {
                      const badgeStyle = getBadgeStyle(event.color || 'blue');

                      return (
                        <div 
                          key={event.id}
                          className={`text-[8px] px-1.5 py-0.5 rounded leading-tight truncate font-bold ${badgeStyle}`}
                          title={`${event.time ? `${event.time} ` : ''}${event.title}`}
                        >
                          {event.time ? `${event.time} ` : ''}{event.title}
                        </div>
                      );
                    })}
                    {events.length > 2 && (
                      <div className="text-[7px] text-slate-400 font-bold pl-0.5 leading-none">
                        +{events.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 3. YEAR VIEW */}
      {viewMode === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {RUSSIAN_MONTHS.map((monthName, mIdx) => {
            const miniDaysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();
            let miniStartDayRaw = new Date(currentYear, mIdx, 1).getDay();
            const miniStartDay = miniStartDayRaw === 0 ? 6 : miniStartDayRaw - 1;

            return (
              <div 
                key={monthName}
                onClick={() => {
                  setCurrentMonth(mIdx);
                  setViewMode('month');
                }}
                className={`bg-slate-50/50 hover:bg-white rounded-2xl p-3 border border-slate-100 hover:shadow-sm cursor-pointer transition-all`}
              >
                {/* Mini Month Label */}
                <h4 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 uppercase tracking-wide">
                  {monthName}
                </h4>

                {/* Mini Weekday initials */}
                <div className="grid grid-cols-7 gap-y-1 mb-1 text-center text-[7px] font-bold text-slate-400">
                  {RUSSIAN_WEEKDAYS.map(wd => (
                    <div key={wd}>{wd[0]}</div>
                  ))}
                </div>

                {/* Mini Month grid of numbers */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
                  {/* Empty offsets */}
                  {Array.from({ length: miniStartDay }).map((_, index) => (
                    <div key={`offset-${index}`} className="w-4 h-4"></div>
                  ))}
                  
                  {/* Days of month */}
                  {Array.from({ length: miniDaysInMonth }).map((_, dIdx) => {
                    const dayNumber = dIdx + 1;
                    const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const dayEvents = getEventsForDate(dateStr);

                    return (
                      <div
                        key={`day-${dayNumber}`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering parent month navigation trigger
                          onSelectDate(dateStr, true);
                          setCurrentMonth(mIdx);
                          setViewMode('month');
                        }}
                        className={`
                          w-4 h-4 flex items-center justify-center text-[8px] font-semibold rounded-full relative transition-all
                          ${isSelected ? `${cAccentBg} text-white font-heavy scale-110 shadow-xs` : 'text-slate-600 hover:bg-slate-200'}
                          ${isToday && !isSelected ? `border border-transparent ${cSubAccentBgLight} ${cAccentText} font-bold` : ''}
                        `}
                        title={`${dayNumber} ${RUSSIAN_MONTHS_GENITIVE[mIdx]} - ${dayEvents.length} событий`}
                      >
                        {dayNumber}
                        {dayEvents.length > 0 && !isSelected && (
                          <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] ${cSubAccentBg} rounded-full`}></span>
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

      {/* Small informative legend */}
      <div className={`mt-4 pt-3 border-t ${cSubAccentBorderLight} flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 ${cSubAccentBg} rounded-full`}></div>
          <span>Выводятся {viewMode === 'week' ? 'события и индикаторы' : 'только события (календарные)'}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <div className={`w-3 h-3 border ${cAccentBorderSolid} ${cSubAccentBgLight} rounded`}></div>
          <span>Сегодня ({(() => {
            const todayStr = formatLocalDate(new Date());
            const dateObj = parseLocalDate(todayStr);
            const monthsShort = [
              'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
              'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
            ];
            return `${dateObj.getDate()} ${monthsShort[dateObj.getMonth()]}`;
          })()})</span>
        </div>
      </div>
    </div>
  );
}
