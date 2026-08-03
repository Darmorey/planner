import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Briefcase, User, Plus, ChevronDown } from 'lucide-react';
import { Task, TaskCategory, TaskScope, TaskRecurrence } from '../../types';
import { formatLocalDate } from '../../utils/taskHelpers';
import FormShell from './FormShell';
import NotesAndPhotoFields from './NotesAndPhotoFields';
import {
  FormSubmitPayload,
  WEEKDAYS_RU,
  getSystemTimeStr,
  getSystemEndTimeStr,
  handleImageUpload,
  formatDatePillRu,
} from './formHelpers';
import { ThemeId, getDefaultTaskColor } from '../../utils/themeTypes';

interface DailyTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormSubmitPayload) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  theme?: ThemeId;
  onZoomImage?: (imgUrl: string) => void;
}

function PillDateInput({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={() => {
        const el = inputRef.current;
        if (!el) return;
        try {
          el.showPicker?.();
        } catch {
          // ignore if unsupported
        }
        el.focus();
        el.click();
      }}
      className="relative shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-200/80 active:scale-[0.98]"
    >
      {formatDatePillRu(value)}
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        tabIndex={-1}
        aria-hidden
      />
    </button>
  );
}

function PillTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={() => {
        const el = inputRef.current;
        if (!el) return;
        try {
          el.showPicker?.();
        } catch {
          // ignore if unsupported
        }
        el.focus();
        el.click();
      }}
      className="relative shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-200/80 active:scale-[0.98]"
    >
      {value}
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        tabIndex={-1}
        aria-hidden
      />
    </button>
  );
}

export default function DailyTaskForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
  theme = 'standard',
  onZoomImage,
}: DailyTaskFormProps) {
  const themeDefaultColor = getDefaultTaskColor(theme);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('task');
  const [scope, setScope] = useState<TaskScope>('personal');
  const [date, setDate] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [time, setTime] = useState(() => getSystemTimeStr());
  const [duration, setDuration] = useState<number>(30);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState(() => getSystemEndTimeStr(getSystemTimeStr()));
  const [pattern, setPattern] = useState<TaskRecurrence['pattern']>('none');
  const [interval, setInterval] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showMorePatterns, setShowMorePatterns] = useState(false);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(themeDefaultColor);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const todayStr = formatLocalDate(new Date());
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setScope(initialTask.scope);
      const startD = initialTask.date || defaultDate || todayStr;
      setDate(startD);
      const hasTimed = !!initialTask.time;
      setAllDay(!hasTimed);
      const startT = initialTask.time || getSystemTimeStr();
      setTime(startT);
      const durVal = initialTask.duration || 30;
      setDuration(durVal);
      setEndDate(initialTask.endDate || startD);
      if (initialTask.endTime) {
        setEndTime(initialTask.endTime);
      } else if (initialTask.time) {
        const [hrs, mins] = startT.split(':').map(Number);
        const total = hrs * 60 + mins + durVal;
        const endH = Math.floor(total / 60) % 24;
        const endM = total % 60;
        setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
      } else {
        setEndTime(getSystemEndTimeStr(startT));
      }
      const initialPattern = initialTask.recurrence?.pattern || 'none';
      setPattern(initialPattern);
      setInterval(initialTask.recurrence?.interval || 1);
      setDaysOfWeek(initialTask.recurrence?.daysOfWeek || []);
      setShowRecurrence(initialPattern !== 'none');
      setShowMorePatterns(
        initialPattern === 'monthly' || initialPattern === 'yearly' || initialPattern === 'custom'
      );
      setNotes(initialTask.notes || '');
      setColor(initialTask.color || themeDefaultColor);
      setImage(initialTask.image || undefined);
    } else {
      setTitle('');
      setCategory('task');
      setScope('personal');
      const startD = defaultDate || todayStr;
      setDate(startD);
      setAllDay(true);
      const currentStartT = getSystemTimeStr();
      setTime(currentStartT);
      setDuration(30);
      setEndDate(startD);
      setEndTime(getSystemEndTimeStr(currentStartT));
      setPattern('none');
      setInterval(1);
      setDaysOfWeek([]);
      setShowRecurrence(false);
      setShowMorePatterns(false);
      setNotes('');
      setColor(themeDefaultColor);
      setImage(undefined);
    }
  }, [initialTask, defaultDate, isOpen, themeDefaultColor]);

  const syncEndDateTimeFromStart = (startDateStr: string, startTimeStr: string, durationMins: number) => {
    if (!startDateStr || !startTimeStr) return;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const startDateObj = new Date(sY, sM - 1, sD, sh, sm, 0, 0);
    const endDateObj = new Date(startDateObj.getTime() + durationMins * 60 * 1000);

    const ey = endDateObj.getFullYear();
    const em = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const ed = String(endDateObj.getDate()).padStart(2, '0');
    const eh = String(endDateObj.getHours()).padStart(2, '0');
    const emin = String(endDateObj.getMinutes()).padStart(2, '0');

    setEndDate(`${ey}-${em}-${ed}`);
    setEndTime(`${eh}:${emin}`);
  };

  const syncDurationFromEndDateTime = (
    startDateStr: string,
    startTimeStr: string,
    endDateStr: string,
    endTimeStr: string
  ) => {
    if (!startDateStr || !startTimeStr || !endDateStr || !endTimeStr) return;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const startObj = new Date(sY, sM - 1, sD, sh, sm, 0, 0);

    const [eY, eM, eD] = endDateStr.split('-').map(Number);
    const [eh, em] = endTimeStr.split(':').map(Number);
    const endObj = new Date(eY, eM - 1, eD, eh, em, 0, 0);

    const diffMins = Math.round((endObj.getTime() - startObj.getTime()) / (60 * 1000));

    if (diffMins >= 0) {
      setDuration(diffMins || 30);
    } else {
      const fallbackEnd = new Date(startObj.getTime() + 30 * 60 * 1000);
      const ey = fallbackEnd.getFullYear();
      const em2 = String(fallbackEnd.getMonth() + 1).padStart(2, '0');
      const ed = String(fallbackEnd.getDate()).padStart(2, '0');
      const eh2 = String(fallbackEnd.getHours()).padStart(2, '0');
      const emin = String(fallbackEnd.getMinutes()).padStart(2, '0');
      setEndDate(`${ey}-${em2}-${ed}`);
      setEndTime(`${eh2}:${emin}`);
      setDuration(30);
    }
  };

  const handleStartDateChange = (newVal: string) => {
    setDate(newVal);
    if (allDay) {
      if (endDate < newVal) setEndDate(newVal);
    } else {
      syncEndDateTimeFromStart(newVal, time, duration);
    }
  };

  const handleStartTimeChange = (newVal: string) => {
    setTime(newVal);
    syncEndDateTimeFromStart(date, newVal, duration);
  };

  const handleEndDateChange = (newVal: string) => {
    setEndDate(newVal);
    if (!allDay) {
      syncDurationFromEndDateTime(date, time, newVal, endTime);
    }
  };

  const handleEndTimeChange = (newVal: string) => {
    setEndTime(newVal);
    syncDurationFromEndDateTime(date, time, endDate, newVal);
  };

  const handleAllDayToggle = (checked: boolean) => {
    setAllDay(checked);
    if (!checked) {
      // Switching to timed: ensure sensible end from start + duration
      const startT = time || getSystemTimeStr();
      setTime(startT);
      syncEndDateTimeFromStart(date, startT, duration || 30);
    }
  };

  const handleToggleWeekday = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e, setImage);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recurrence: TaskRecurrence = {
      pattern,
      interval: pattern === 'custom' ? interval : undefined,
      daysOfWeek: pattern === 'weekly' ? daysOfWeek : undefined,
    };

    const isTimed = !allDay;

    onSubmit({
      id: initialTask?.id,
      title: title.trim(),
      category,
      scope,
      date,
      time: isTimed ? time : undefined,
      duration: isTimed ? duration || 30 : undefined,
      endDate: isTimed ? endDate || date : endDate !== date ? endDate : undefined,
      endTime: isTimed ? endTime : undefined,
      notes: notes.trim() || undefined,
      recurrence,
      isWishlist: false,
      isGift: false,
      wishlistCategory: undefined,
      giftRecipient: undefined,
      somedayCategory: undefined,
      color,
      image,
    });

    onClose();
  };

  if (!isOpen) return null;

  const headerTitle = initialTask ? 'Редактировать задачу' : 'Новая задача';

  return (
    <FormShell title={headerTitle} onClose={onClose} onSubmit={handleFormSubmit}>
      <div>
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 px-4 py-2 hover:border-slate-300 transition-colors focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/10 focus-within:bg-white flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            название задачи
          </span>
          <input
            type="text"
            required
            placeholder=""
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-slate-900 font-semibold text-base p-0 border-none focus:ring-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Категория</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100/55 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setCategory('task')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                category === 'task'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Задача
            </button>
            <button
              type="button"
              onClick={() => setCategory('event')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                category === 'event'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Событие
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-tight font-medium">
            {category === 'event'
              ? '⭐ Выводится на весь месяц'
              : '📝 Скрыто из полного календаря'}
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Пространство</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100/55 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setScope('personal')}
              className={`py-2 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-all ${
                scope === 'personal'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={12} />
              Личные
            </button>
            <button
              type="button"
              onClick={() => setScope('work')}
              className={`py-2 flex items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-all ${
                scope === 'work'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase size={12} />
              Рабочие
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Цвет задачи / события</label>
        <div className="flex gap-3">
          {[
            { value: 'blue', bg: 'bg-[#ABC3D9]', ring: 'ring-[#ABC3D9]/40' },
            { value: 'red', bg: 'bg-[#D9ABC3]', ring: 'ring-[#D9ABC3]/40' },
            { value: 'green', bg: 'bg-[#C3D9AB]', ring: 'ring-[#C3D9AB]/40' },
            { value: 'purple', bg: 'bg-[#C3ABD9]', ring: 'ring-[#C3ABD9]/40' },
            { value: 'orange', bg: 'bg-[#EED0AC]', ring: 'ring-[#EED0AC]/40' },
            { value: 'dark', bg: 'bg-[#ABD9D1]', ring: 'ring-[#ABD9D1]/40' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setColor(item.value)}
              className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center transition-all cursor-pointer ${
                color === item.value
                  ? `ring-4 ring-offset-2 scale-110 ${item.ring}`
                  : 'hover:opacity-85'
              }`}
              aria-label={item.value}
            >
              {color === item.value && (
                <span className="text-white text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Date / time — iOS Calendar style, light theme */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[15px] font-medium text-slate-800">Весь день</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => handleAllDayToggle(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-7 w-12 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0C3B2E] peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="mx-4 border-t border-slate-200/80" />

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <span className="shrink-0 text-[15px] font-medium text-slate-800">Начало</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <PillDateInput value={date} onChange={handleStartDateChange} />
            {!allDay && <PillTimeInput value={time} onChange={handleStartTimeChange} />}
          </div>
        </div>

        <div className="mx-4 border-t border-slate-200/80" />

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <span className="shrink-0 text-[15px] font-medium text-slate-800">Конец</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <PillDateInput value={endDate || date} onChange={handleEndDateChange} min={date} />
            {!allDay && <PillTimeInput value={endTime} onChange={handleEndTimeChange} />}
          </div>
        </div>
      </div>

      {!showRecurrence ? (
        <button
          type="button"
          onClick={() => setShowRecurrence(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
        >
          <Plus size={16} strokeWidth={2.5} />
          Повтор
        </button>
      ) : (
        <div className="animate-fade-in space-y-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <RotateCw size={14} className="text-[#0C3B2E]" />
              Повтор
            </span>
            <button
              type="button"
              onClick={() => {
                setShowRecurrence(false);
                setPattern('none');
                setDaysOfWeek([]);
                setShowMorePatterns(false);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Скрыть
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { value: 'none', label: 'Нет' },
                { value: 'daily', label: 'Каждый день' },
                { value: 'weekly', label: 'Каждую неделю' },
              ] as const
            ).map((chip) => {
              const isActive = pattern === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => {
                    setPattern(chip.value);
                    if (chip.value !== 'weekly') setDaysOfWeek([]);
                    setShowMorePatterns(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0C3B2E] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowMorePatterns((v) => !v)}
              className={`inline-flex items-center gap-0.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                showMorePatterns || pattern === 'monthly' || pattern === 'yearly' || pattern === 'custom'
                  ? 'bg-[#0C3B2E] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              …
              <ChevronDown
                size={12}
                className={`transition-transform ${showMorePatterns ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {showMorePatterns && (
            <div className="animate-fade-in flex flex-wrap gap-1.5">
              {(
                [
                  { value: 'monthly', label: 'Каждый месяц' },
                  { value: 'yearly', label: 'Каждый год' },
                  { value: 'custom', label: 'Свой интервал' },
                ] as const
              ).map((chip) => {
                const isActive = pattern === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => {
                      setPattern(chip.value);
                      setDaysOfWeek([]);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#0C3B2E] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          )}

          {pattern === 'weekly' && (
            <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-3 font-medium">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Повторять в дни недели:
              </span>
              <div className="flex justify-between gap-1">
                {WEEKDAYS_RU.map((day) => {
                  const isSelected = daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleToggleWeekday(day.value)}
                      className={`h-9 w-9 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#0C3B2E] text-white shadow-sm'
                          : 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pattern === 'custom' && (
            <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-xs font-medium text-slate-600">Повторять каждые</span>
              <input
                type="number"
                min="1"
                max="365"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))}
                className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-800 focus:border-blue-900 focus:outline-none"
              />
              <span className="text-xs font-medium text-slate-600">дней</span>
            </div>
          )}
        </div>
      )}

      <NotesAndPhotoFields
        notes={notes}
        onNotesChange={setNotes}
        image={image}
        onImageChange={setImage}
        photoLabelKind="task"
        onZoomImage={onZoomImage}
        onImageUpload={onImageUpload}
      />
    </FormShell>
  );
}
