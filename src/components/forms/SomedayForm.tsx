import React, { useState, useEffect } from 'react';
import { Calendar, RotateCw, Trash2, Plus, ChevronDown, ChevronUp, Check, Edit2 } from 'lucide-react';
import { Task, TaskCategory, TaskScope, TaskRecurrence } from '../../types';
import { formatLocalDate } from '../../utils/taskHelpers';
import FormShell from './FormShell';
import NotesAndPhotoFields from './NotesAndPhotoFields';
import {
  FormSubmitPayload,
  NamedColorItem,
  WEEKDAYS_RU,
  getStyleByColor,
  getSystemTimeStr,
  getSystemEndTimeStr,
  handleImageUpload,
} from './formHelpers';

interface SomedayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: FormSubmitPayload) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  defaultSomedayCategory?: string;
  onZoomImage?: (imgUrl: string) => void;
}

export default function SomedayForm({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
  defaultSomedayCategory,
  onZoomImage,
}: SomedayFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('task');
  const [scope, setScope] = useState<TaskScope>('personal');
  const [hasDate, setHasDate] = useState(false);
  const [date, setDate] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [time, setTime] = useState(() => getSystemTimeStr());
  const [duration, setDuration] = useState<number | ''>(30);
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState(() => getSystemEndTimeStr(getSystemTimeStr()));
  const [durHours, setDurHours] = useState<number>(0);
  const [durMins, setDurMins] = useState<number>(30);
  const [pattern, setPattern] = useState<TaskRecurrence['pattern']>('none');
  const [interval, setInterval] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  const [somedayCategories, setSomedayCategories] = useState<NamedColorItem[]>(() => {
    const saved = localStorage.getItem('someday_categories_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { name: 'Идеи', color: 'blue' },
      { name: 'Планы', color: 'purple' },
      { name: 'Покупки', color: 'orange' },
      { name: 'Разное', color: 'dark' },
    ];
  });
  const [selectedSomedayCategory, setSelectedSomedayCategory] = useState<string>('Разное');
  const [newSomedayCatName, setNewSomedayCatName] = useState('');
  const [newSomedayCatColor, setNewSomedayCatColor] = useState('blue');
  const [isAddingSomedayCat, setIsAddingSomedayCat] = useState(false);
  const [isSomedayDropdownOpen, setIsSomedayDropdownOpen] = useState(false);

  const [editingSomedayCat, setEditingSomedayCat] = useState<string | null>(null);
  const [editSomedayCatValue, setEditSomedayCatValue] = useState<string>('');

  const handleAddNewSomedayCategory = () => {
    const trimmed = newSomedayCatName.trim();
    if (!trimmed) return;
    if (somedayCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      const match = somedayCategories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())!;
      setSelectedSomedayCategory(match.name);
      setNewSomedayCatName('');
      setIsAddingSomedayCat(false);
      return;
    }
    const updated = [...somedayCategories, { name: trimmed, color: newSomedayCatColor }];
    setSomedayCategories(updated);
    localStorage.setItem('someday_categories_custom', JSON.stringify(updated));
    setSelectedSomedayCategory(trimmed);
    setNewSomedayCatName('');
    setIsAddingSomedayCat(false);
  };

  const handleDeleteSomedayCategory = (catNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = somedayCategories.filter(c => c.name !== catNameToDelete);
    setSomedayCategories(updated);
    localStorage.setItem('someday_categories_custom', JSON.stringify(updated));
    if (selectedSomedayCategory === catNameToDelete) {
      if (updated.length > 0) {
        setSelectedSomedayCategory(updated[0].name);
      } else {
        setSelectedSomedayCategory('');
      }
    }
  };

  const handleUpdateSomedayCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingSomedayCat(null);
      return;
    }
    if (somedayCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.name !== oldName)) {
      return;
    }
    const updated = somedayCategories.map(c => c.name === oldName ? { ...c, name: trimmed } : c);
    setSomedayCategories(updated);
    localStorage.setItem('someday_categories_custom', JSON.stringify(updated));
    if (selectedSomedayCategory === oldName) {
      setSelectedSomedayCategory(trimmed);
    }
    setEditingSomedayCat(null);
  };

  useEffect(() => {
    const todayStr = formatLocalDate(new Date());
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setScope(initialTask.scope);
      setHasDate(!!initialTask.date);
      const startD = initialTask.date || defaultDate || todayStr;
      setDate(startD);
      setHasTime(!!initialTask.time);
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
      setDurHours(Math.floor(durVal / 60));
      setDurMins(durVal % 60);
      setPattern(initialTask.recurrence?.pattern || 'none');
      setInterval(initialTask.recurrence?.interval || 1);
      setDaysOfWeek(initialTask.recurrence?.daysOfWeek || []);
      setNotes(initialTask.notes || '');
      setImage(initialTask.image || undefined);
      setSelectedSomedayCategory(initialTask.somedayCategory || 'Разное');
    } else {
      setTitle('');
      setCategory('task');
      setScope('personal');
      setHasDate(false);
      const startD = defaultDate || todayStr;
      setDate(startD);
      setHasTime(false);
      const currentStartT = getSystemTimeStr();
      setTime(currentStartT);
      setDuration(30);
      setEndDate(startD);
      setEndTime(getSystemEndTimeStr(currentStartT));
      setDurHours(0);
      setDurMins(30);
      setPattern('none');
      setInterval(1);
      setDaysOfWeek([]);
      setNotes('');
      setImage(undefined);
      setSelectedSomedayCategory(defaultSomedayCategory || 'Разное');
    }
  }, [initialTask, defaultDate, defaultSomedayCategory, isOpen]);

  const syncEndDateTimeFromDuration = (startDateStr: string, startTimeStr: string, hours: number, mins: number) => {
    if (!startDateStr || !startTimeStr) return;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const startDateObj = new Date(sY, sM - 1, sD, sh, sm, 0, 0);

    const totalMinutesToAdd = hours * 60 + mins;
    const endDateObj = new Date(startDateObj.getTime() + totalMinutesToAdd * 60 * 1000);

    const ey = endDateObj.getFullYear();
    const em = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const ed = String(endDateObj.getDate()).padStart(2, '0');
    const eh = String(endDateObj.getHours()).padStart(2, '0');
    const emin = String(endDateObj.getMinutes()).padStart(2, '0');

    setEndDate(`${ey}-${em}-${ed}`);
    setEndTime(`${eh}:${emin}`);
    setDuration(totalMinutesToAdd);
  };

  const syncDurationFromEndDateTime = (startDateStr: string, startTimeStr: string, endDateStr: string, endTimeStr: string) => {
    if (!startDateStr || !startTimeStr || !endDateStr || !endTimeStr) return;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const startObj = new Date(sY, sM - 1, sD, sh, sm, 0, 0);

    const [eY, eM, eD] = endDateStr.split('-').map(Number);
    const [eh, em] = endTimeStr.split(':').map(Number);
    const endObj = new Date(eY, eM - 1, eD, eh, em, 0, 0);

    const diffMins = Math.round((endObj.getTime() - startObj.getTime()) / (60 * 1000));

    if (diffMins >= 0) {
      if (diffMins < 1440) {
        setDurHours(Math.floor(diffMins / 60));
        setDurMins(diffMins % 60);
      } else {
        // Spans more than 24 hours (multi-day event)
      }
      setDuration(diffMins);
    } else {
      const fallbackEnd = new Date(startObj.getTime() + 30 * 60 * 1000);
      const ey = fallbackEnd.getFullYear();
      const em = String(fallbackEnd.getMonth() + 1).padStart(2, '0');
      const ed = String(fallbackEnd.getDate()).padStart(2, '0');
      const eh2 = String(fallbackEnd.getHours()).padStart(2, '0');
      const emin = String(fallbackEnd.getMinutes()).padStart(2, '0');
      setEndDate(`${ey}-${em}-${ed}`);
      setEndTime(`${eh2}:${emin}`);
      setDurHours(0);
      setDurMins(30);
      setDuration(30);
    }
  };

  const handleStartDateChangeLocal = (newVal: string) => {
    setDate(newVal);
    syncEndDateTimeFromDuration(newVal, time, durHours, durMins);
  };

  const handleStartTimeChangeLocal = (newVal: string) => {
    setTime(newVal);
    syncEndDateTimeFromDuration(date, newVal, durHours, durMins);
  };

  const handleEndDateChangeLocal = (newVal: string) => {
    setEndDate(newVal);
    syncDurationFromEndDateTime(date, time, newVal, endTime);
  };

  const handleEndTimeChangeLocal = (newVal: string) => {
    setEndTime(newVal);
    syncDurationFromEndDateTime(date, time, endDate, newVal);
  };

  const handleDurHoursChangeLocal = (h: number) => {
    setDurHours(h);
    syncEndDateTimeFromDuration(date, time, h, durMins);
  };

  const handleDurMinsChangeLocal = (m: number) => {
    setDurMins(m);
    syncEndDateTimeFromDuration(date, time, durHours, m);
  };

  const handleToggleWeekday = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
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

    const catObj = somedayCategories.find(c => c.name === selectedSomedayCategory);
    const finalColor = catObj ? catObj.color : 'blue';

    const isActuallySomeday = !hasDate;

    onSubmit({
      id: initialTask?.id,
      title: title.trim(),
      category: isActuallySomeday ? 'task' : category,
      scope: isActuallySomeday ? 'personal' : scope,
      date: isActuallySomeday ? undefined : (hasDate ? date : undefined),
      time: isActuallySomeday ? undefined : (hasTime && hasDate ? time : undefined),
      duration: isActuallySomeday ? undefined : (hasTime && hasDate ? (Number(duration) || 30) : undefined),
      endDate: isActuallySomeday ? undefined : (hasTime && hasDate ? (endDate || date) : undefined),
      endTime: isActuallySomeday ? undefined : (hasTime && hasDate ? endTime : undefined),
      notes: notes.trim() || undefined,
      recurrence: isActuallySomeday ? { pattern: 'none' } : recurrence,
      isWishlist: false,
      isGift: false,
      wishlistCategory: undefined,
      giftRecipient: undefined,
      somedayCategory: isActuallySomeday ? selectedSomedayCategory : undefined,
      color: finalColor,
      image,
    });

    onClose();
  };

  if (!isOpen) return null;

  const headerTitle = initialTask ? 'Редактировать задачу' : 'Новая задача';

  return (
    <FormShell title={headerTitle} onClose={onClose} onSubmit={handleFormSubmit}>
      {/* Title */}
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
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-slate-900 font-semibold text-base p-0 border-none focus:ring-0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Категория задачи</label>
          
          {/* Custom select dropdown */}
          <div className="relative">
            {(() => {
              const activeSomedayCat = somedayCategories.find(c => c.name === selectedSomedayCategory) || { name: selectedSomedayCategory || 'Разное', color: 'dark' };
              const currentStyles = getStyleByColor(activeSomedayCat.color);

              return (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSomedayDropdownOpen(!isSomedayDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-900/10 cursor-pointer ${currentStyles.bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${currentStyles.dot} shrink-0`} />
                      <span className="truncate">{activeSomedayCat.name || 'Выберите категорию'}</span>
                    </div>
                    {isSomedayDropdownOpen ? <ChevronUp size={16} className="opacity-70" /> : <ChevronDown size={16} className="opacity-70" />}
                  </button>

                  {isSomedayDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsSomedayDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                        {somedayCategories.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center font-medium">Нет доступных категорий</div>
                        ) : (
                          somedayCategories.map(cat => {
                            const itemStyles = getStyleByColor(cat.color);
                            const isSelected = cat.name === selectedSomedayCategory;
                            const isEditing = editingSomedayCat === cat.name;

                            if (isEditing) {
                              return (
                                <div 
                                  key={cat.name}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-55 bg-slate-50 border-y border-slate-100"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editSomedayCatValue}
                                    onChange={e => setEditSomedayCatValue(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleUpdateSomedayCategory(cat.name, editSomedayCatValue);
                                      } else if (e.key === 'Escape') {
                                        setEditingSomedayCat(null);
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-855 font-semibold focus:outline-none focus:border-blue-955"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSomedayCategory(cat.name, editSomedayCatValue)}
                                    className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                                  >
                                    ОК
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSomedayCat(null)}
                                    className="px-2 py-1 bg-slate-200 text-slate-655 font-bold rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={cat.name}
                                className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer group ${
                                  isSelected ? 'bg-slate-55 bg-slate-100/50 font-bold' : 'hover:bg-slate-50'
                                }`}
                                onClick={() => {
                                  setSelectedSomedayCategory(cat.name);
                                  setIsSomedayDropdownOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`w-2.5 h-2.5 rounded-full ${itemStyles.dot} shrink-0`} />
                                  <span className="text-sm text-slate-800 truncate">{cat.name}</span>
                                  {isSelected && <Check size={14} className="text-slate-500 ml-1.5 shrink-0" />}
                                </div>
                                
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSomedayCat(cat.name);
                                      setEditSomedayCatValue(cat.name);
                                    }}
                                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Редактировать категорию"
                                    aria-label="Редактировать категорию"
                                  >
                                    <Edit2 size={12} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSomedayCategory(cat.name, e)}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title="Удалить категорию"
                                    aria-label="Удалить категорию"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* Sub-toggle and category creator box */}
          <div className="mt-2.5">
            {!isAddingSomedayCat ? (
              <button
                type="button"
                onClick={() => setIsAddingSomedayCat(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100/50 cursor-pointer"
              >
                <Plus size={12} />
                Добавить категорию
              </button>
            ) : (
              <div className="bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 animate-fade-in space-y-3 mt-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Добавить категорию</span>
                
                <input
                  type="text"
                  autoFocus
                  placeholder="Название категории (например: Книги)"
                  value={newSomedayCatName}
                  onChange={e => setNewSomedayCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewSomedayCategory();
                    }
                  }}
                />

                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Цвет новой категории</span>
                  <div className="flex gap-2">
                    {[
                      { value: 'blue', bg: 'bg-[#ABC3D9]', label: 'Синий' },
                      { value: 'purple', bg: 'bg-[#C3ABD9]', label: 'Фиолетовый' },
                      { value: 'orange', bg: 'bg-[#EED0AC]', label: 'Оранжевый' },
                      { value: 'dark', bg: 'bg-[#ABD9D1]', label: 'Индиго' },
                      { value: 'red', bg: 'bg-[#D9ABC3]', label: 'Яркий розовый' },
                      { value: 'green', bg: 'bg-[#C3D9AB]', label: 'Сельдерей' },
                    ].map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewSomedayCatColor(c.value)}
                        className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-all relative ${
                          newSomedayCatColor === c.value 
                            ? 'ring-4 ring-offset-2 ring-sky-200 scale-110' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.label}
                        aria-label={c.label}
                      >
                        {newSomedayCatColor === c.value && (
                          <span className="text-white text-[9px] font-bold absolute inset-0 flex items-center justify-center">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSomedayCatName('');
                      setIsAddingSomedayCat(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewSomedayCategory}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/10 transition-all cursor-pointer"
                  >
                    добавить
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduled toggler inside Someday */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Запланировать на конкретный день?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDate}
                  onChange={e => setHasDate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>

            {/* Scheduled fields */}
            {hasDate ? (
              <div className="space-y-4 bg-blue-50/20 p-4 rounded-xl border border-blue-100/40 animate-fade-in font-medium text-sm">
                {/* Date Selection */}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-blue-95 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Дата начала</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => handleStartDateChangeLocal(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-250 bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                {/* Specific time / duration settings */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Добавить время и длительность</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTime}
                      onChange={e => setHasTime(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-900"></div>
                  </label>
                </div>

                {hasTime && (
                  <div className="space-y-4 pt-1 pb-1 animate-fade-in text-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date & Time */}
                      <div className="p-3 bg-white/60 border border-slate-150 rounded-xl space-y-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Сессия Начинается</span>
                        <div className="space-y-1.5">
                          <div>
                            <label className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Дата начала</label>
                            <input
                              type="date"
                              value={date}
                              onChange={e => handleStartDateChangeLocal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Время начала</label>
                            <input
                              type="time"
                              value={time}
                              onChange={e => handleStartTimeChangeLocal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* End Date & Time */}
                      <div className="p-3 bg-white/60 border border-slate-150 rounded-xl space-y-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Сессия Заканчивается</span>
                        <div className="space-y-1.5">
                          <div>
                            <label className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Дата окончания</label>
                            <input
                              type="date"
                              value={endDate}
                              min={date}
                              onChange={e => handleEndDateChangeLocal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Время окончания</label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={e => handleEndTimeChangeLocal(e.target.value)}
                              className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duration Selectors */}
                    <div className="p-3 bg-blue-50/10 border border-blue-100/40 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Выбор длительности</span>
                        <span className="text-[10px] font-semibold text-blue-900/80">Максимально 23 ч 59 мин</span>
                      </div>
                      
                      {Number(duration) >= 1440 ? (
                        <p className="text-[11px] text-slate-500 font-medium italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          ⏳ Событие длится более 24 часов ({Math.floor(Number(duration) / 1440)} д. {Math.floor((Number(duration) % 1440) / 60)} ч.). Изменение длительности через часы/минуты отключено для сохранения многодневного интервала. Измените дату окончания выше.
                        </p>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Часы</label>
                            <select
                              value={durHours}
                              onChange={e => handleDurHoursChangeLocal(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900 cursor-pointer"
                            >
                              {Array.from({ length: 24 }).map((_, h) => (
                                <option key={h} value={h}>{h} ч</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Минуты</label>
                            <select
                              value={durMins}
                              onChange={e => handleDurMinsChangeLocal(Number(e.target.value))}
                              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-900 cursor-pointer"
                            >
                              {Array.from({ length: 60 }).map((_, m) => (
                                <option key={m} value={m}>{m} мин</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Recurrence settings */}
          {hasDate && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <RotateCw size={14} className="text-blue-900" />
                Повторяемость
              </label>

              <select
                value={pattern}
                onChange={e => setPattern(e.target.value as TaskRecurrence['pattern'])}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/55 text-slate-800 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/10"
              >
                <option value="none">Однократно (Без повторений)</option>
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
                <option value="yearly">Ежегодно</option>
                <option value="custom">Свой интервал...</option>
              </select>

              {/* Weekly option details */}
              {pattern === 'weekly' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 animate-fade-in font-medium">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Повторять в дни недели:</span>
                  <div className="flex justify-between gap-1">
                    {WEEKDAYS_RU.map(day => {
                      const isSelected = daysOfWeek.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleToggleWeekday(day.value)}
                          className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                            isSelected 
                              ? 'bg-blue-900 text-white shadow-sm' 
                              : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom manual interval */}
              {pattern === 'custom' && (
                <div className="flex items-center gap-3 bg-slate-55 p-3 rounded-xl border border-slate-200 animate-fade-in">
                  <span className="text-xs font-medium text-slate-600">Повторять каждые</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={interval}
                    onChange={e => setInterval(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 rounded border border-slate-300 bg-white text-center text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-900"
                  />
                  <span className="text-xs font-medium text-slate-600">дней</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
