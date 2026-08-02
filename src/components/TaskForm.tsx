import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, RotateCw, CheckCircle, Tag, Briefcase, User, Trash2, Plus, ChevronDown, ChevronUp, Check, Edit2, Camera, Eye } from 'lucide-react';
import { Task, TaskCategory, TaskScope, TaskRecurrence } from '../types';
import { formatLocalDate } from '../utils/taskHelpers';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  defaultIsWishlist?: boolean;
  defaultIsGift?: boolean;
  defaultIsSomeday?: boolean;
  defaultGiftRecipient?: string;
  defaultWishlistCategory?: string;
  defaultSomedayCategory?: string;
  onZoomImage?: (imgUrl: string) => void;
}

const WEEKDAYS_RU = [
  { label: 'Пн', value: 1 },
  { label: 'Вт', value: 2 },
  { label: 'Ср', value: 3 },
  { label: 'Чт', value: 4 },
  { label: 'Пт', value: 5 },
  { label: 'Сб', value: 6 },
  { label: 'Вс', value: 0 }
];

const getStyleByColor = (colName: string) => {
  switch (colName) {
    case 'blue': return { bg: 'bg-[#ABC3D9]/25 text-[#3B546A] border-[#ABC3D9]/40 hover:bg-[#ABC3D9]/35', dot: 'bg-[#ABC3D9]' };
    case 'purple': return { bg: 'bg-[#C3ABD9]/25 text-[#533966] border-[#C3ABD9]/40 hover:bg-[#C3ABD9]/35', dot: 'bg-[#C3ABD9]' };
    case 'orange': return { bg: 'bg-[#EED0AC]/30 text-[#735930] border-[#EED0AC]/50 hover:bg-[#EED0AC]/40', dot: 'bg-[#EED0AC]' };
    case 'dark': return { bg: 'bg-[#ABD9D1]/25 text-[#2B5E54] border-[#ABD9D1]/40 hover:bg-[#ABD9D1]/35', dot: 'bg-[#ABD9D1]' };
    case 'red': return { bg: 'bg-[#D9ABC3]/25 text-[#7A4060] border-[#D9ABC3]/40 hover:bg-[#D9ABC3]/35', dot: 'bg-[#D9ABC3]' };
    case 'green': return { bg: 'bg-[#C3D9AB]/25 text-[#4F5E3E] border-[#C3D9AB]/40 hover:bg-[#C3D9AB]/35', dot: 'bg-[#C3D9AB]' };
    default: return { bg: 'bg-slate-50 text-slate-700 border-slate-250 hover:bg-slate-100', dot: 'bg-[#ABC3D9]' };
  }
};

export default function TaskForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialTask, 
  defaultDate, 
  defaultIsWishlist, 
  defaultIsGift, 
  defaultIsSomeday,
  defaultGiftRecipient,
  defaultWishlistCategory,
  defaultSomedayCategory,
  onZoomImage
}: TaskFormProps) {
  const getSystemTimeStr = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const getSystemEndTimeStr = (startTimeStr: string) => {
    try {
      const [h, m] = startTimeStr.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m + 30);
      const eh = String(d.getHours()).padStart(2, '0');
      const em = String(d.getMinutes()).padStart(2, '0');
      return `${eh}:${em}`;
    } catch (e) {
      return '12:30';
    }
  };

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('task');
  const [scope, setScope] = useState<TaskScope>('personal');
  const [hasDate, setHasDate] = useState(true);
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
  const [isWishlist, setIsWishlist] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [isSomeday, setIsSomeday] = useState(false);
  const [color, setColor] = useState('blue');
  const [image, setImage] = useState<string | undefined>(undefined);

  // Someday Custom Categories
  const [somedayCategories, setSomedayCategories] = useState<{name: string, color: string}[]>(() => {
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

  // Wishlist Custom Categories
  const [wishlistCategories, setWishlistCategories] = useState<{name: string, color: string}[]>(() => {
    const saved = localStorage.getItem('wishlist_categories_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: 'Одежда', color: 'red' },
      { name: 'Дом', color: 'green' },
      { name: 'Хобби', color: 'purple' },
    ];
  });
  const [selectedWishlistCategory, setSelectedWishlistCategory] = useState<string>('Одежда');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [isAddingWishlistCat, setIsAddingWishlistCat] = useState(false);
  const [isWishlistDropdownOpen, setIsWishlistDropdownOpen] = useState(false);

  const [editingWishlistCat, setEditingWishlistCat] = useState<string | null>(null);
  const [editWishlistCatValue, setEditWishlistCatValue] = useState<string>('');

  const handleAddNewCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (wishlistCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      const match = wishlistCategories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())!;
      setSelectedWishlistCategory(match.name);
      setNewCatName('');
      setIsAddingWishlistCat(false);
      return;
    }
    const updated = [...wishlistCategories, { name: trimmed, color: newCatColor }];
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    setSelectedWishlistCategory(trimmed);
    setNewCatName('');
    setIsAddingWishlistCat(false);
  };

  const handleDeleteWishlistCategory = (catNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = wishlistCategories.filter(c => c.name !== catNameToDelete);
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    if (selectedWishlistCategory === catNameToDelete) {
      if (updated.length > 0) {
        setSelectedWishlistCategory(updated[0].name);
      } else {
        setSelectedWishlistCategory('');
      }
    }
  };

  const handleUpdateWishlistCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingWishlistCat(null);
      return;
    }
    if (wishlistCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.name !== oldName)) {
      return;
    }
    const updated = wishlistCategories.map(c => c.name === oldName ? { ...c, name: trimmed } : c);
    setWishlistCategories(updated);
    localStorage.setItem('wishlist_categories_custom', JSON.stringify(updated));
    if (selectedWishlistCategory === oldName) {
      setSelectedWishlistCategory(trimmed);
    }
    setEditingWishlistCat(null);
  };

  // Gift Recipients (Люди)
  const [giftRecipients, setGiftRecipients] = useState<{name: string, color: string}[]>(() => {
    const saved = localStorage.getItem('gift_recipients_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: 'Папа', color: 'blue' },
      { name: 'Мама', color: 'red' },
      { name: 'Лёша', color: 'purple' },
      { name: 'Бабушка', color: 'green' },
    ];
  });
  const [selectedGiftRecipient, setSelectedGiftRecipient] = useState<string>('Папа');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientColor, setNewRecipientColor] = useState('blue');
  const [isAddingGiftRecipient, setIsAddingGiftRecipient] = useState(false);
  const [isGiftDropdownOpen, setIsGiftDropdownOpen] = useState(false);

  const [editingGiftRecipient, setEditingGiftRecipient] = useState<string | null>(null);
  const [editGiftRecipientValue, setEditGiftRecipientValue] = useState<string>('');

  const handleAddNewRecipient = () => {
    const trimmed = newRecipientName.trim();
    if (!trimmed) return;
    if (giftRecipients.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      const match = giftRecipients.find(r => r.name.toLowerCase() === trimmed.toLowerCase())!;
      setSelectedGiftRecipient(match.name);
      setNewRecipientName('');
      setIsAddingGiftRecipient(false);
      return;
    }
    const updated = [...giftRecipients, { name: trimmed, color: newRecipientColor }];
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    setSelectedGiftRecipient(trimmed);
    setNewRecipientName('');
    setIsAddingGiftRecipient(false);
  };

  const handleDeleteGiftRecipient = (recNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = giftRecipients.filter(r => r.name !== recNameToDelete);
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    if (selectedGiftRecipient === recNameToDelete) {
      if (updated.length > 0) {
        setSelectedGiftRecipient(updated[0].name);
      } else {
        setSelectedGiftRecipient('');
      }
    }
  };

  const handleUpdateGiftRecipient = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingGiftRecipient(null);
      return;
    }
    if (giftRecipients.some(r => r.name.toLowerCase() === trimmed.toLowerCase() && r.name !== oldName)) {
      return;
    }
    const updated = giftRecipients.map(r => r.name === oldName ? { ...r, name: trimmed } : r);
    setGiftRecipients(updated);
    localStorage.setItem('gift_recipients_custom', JSON.stringify(updated));
    if (selectedGiftRecipient === oldName) {
      setSelectedGiftRecipient(trimmed);
    }
    setEditingGiftRecipient(null);
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
      setIsWishlist(!!initialTask.isWishlist);
      setIsGift(!!initialTask.isGift);
      const isTaskSomeday = !initialTask.isWishlist && !initialTask.isGift && !initialTask.date;
      setIsSomeday(isTaskSomeday || !!defaultIsSomeday);
      setColor(initialTask.color || 'blue');
      setImage(initialTask.image || undefined);
      setSelectedWishlistCategory(initialTask.wishlistCategory || 'Одежда');
      setSelectedGiftRecipient(initialTask.giftRecipient || 'Папа');
      setSelectedSomedayCategory(initialTask.somedayCategory || 'Разное');
    } else {
      setTitle('');
      setCategory('task');
      setScope('personal');
      const isTaskSomeday = !!defaultIsSomeday;
      setIsSomeday(isTaskSomeday);
      // If default is wishlist, gift or someday, there shouldn't be a calendar date by default
      const shouldHaveDate = defaultIsWishlist || defaultIsGift || isTaskSomeday ? false : !!defaultDate;
      setHasDate(shouldHaveDate);
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
      setIsWishlist(!!defaultIsWishlist);
      setIsGift(!!defaultIsGift);
      setColor('blue');
      setImage(undefined);
      setSelectedWishlistCategory(defaultWishlistCategory || 'Одежда');
      setSelectedGiftRecipient(defaultGiftRecipient || 'Папа');
      setSelectedSomedayCategory(defaultSomedayCategory || 'Разное');
    }
  }, [initialTask, defaultDate, defaultIsWishlist, defaultIsGift, defaultIsSomeday, defaultWishlistCategory, defaultGiftRecipient, defaultSomedayCategory, isOpen]);

  // Adjust category vs display on calendar automatically
  const handleCategoryChange = (cat: TaskCategory) => {
    setCategory(cat);
  };

  const syncEndDateTimeFromDuration = (startDateStr: string, startTimeStr: string, hours: number, mins: number) => {
    if (!startDateStr || !startTimeStr) return;
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [sh, sm] = startTimeStr.split(':').map(Number);
    const startDateObj = new Date(sY, sM - 1, sD, sh, sm, 0, 0);
    
    // Add duration in minutes
    const totalMinutesToAdd = hours * 60 + mins;
    const endDateObj = new Date(startDateObj.getTime() + totalMinutesToAdd * 60 * 1000);
    
    // Set state
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
      // End before start - reset end to start + 30 mins
      const fallbackEnd = new Date(startObj.getTime() + 30 * 60 * 1000);
      const ey = fallbackEnd.getFullYear();
      const em = String(fallbackEnd.getMonth() + 1).padStart(2, '0');
      const ed = String(fallbackEnd.getDate()).padStart(2, '0');
      const eh = String(fallbackEnd.getHours()).padStart(2, '0');
      const emin = String(fallbackEnd.getMinutes()).padStart(2, '0');
      setEndDate(`${ey}-${em}-${ed}`);
      setEndTime(`${eh}:${emin}`);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recurrence: TaskRecurrence = {
      pattern,
      interval: pattern === 'custom' ? interval : undefined,
      daysOfWeek: pattern === 'weekly' ? daysOfWeek : undefined,
    };

    let finalColor = color;
    if (isWishlist) {
      const catObj = wishlistCategories.find(c => c.name === selectedWishlistCategory);
      finalColor = catObj ? catObj.color : 'blue';
    } else if (isGift) {
      const recObj = giftRecipients.find(r => r.name === selectedGiftRecipient);
      finalColor = recObj ? recObj.color : 'blue';
    } else if (isSomeday) {
      const catObj = somedayCategories.find(c => c.name === selectedSomedayCategory);
      finalColor = catObj ? catObj.color : 'blue';
    }

    const isActuallySomeday = isSomeday && !hasDate;

    onSubmit({
      id: initialTask?.id,
      title: title.trim(),
      category: (isWishlist || isGift || isActuallySomeday) ? 'task' : category,
      scope: (isWishlist || isGift || isActuallySomeday) ? 'personal' : scope,
      date: (isWishlist || isGift || isActuallySomeday) ? undefined : (hasDate ? date : undefined),
      time: (isWishlist || isGift || isActuallySomeday) ? undefined : (hasTime && hasDate ? time : undefined),
      duration: (isWishlist || isGift || isActuallySomeday) ? undefined : (hasTime && hasDate ? (Number(duration) || 30) : undefined),
      endDate: (isWishlist || isGift || isActuallySomeday) ? undefined : (hasTime && hasDate ? (endDate || date) : undefined),
      endTime: (isWishlist || isGift || isActuallySomeday) ? undefined : (hasTime && hasDate ? endTime : undefined),
      notes: notes.trim() || undefined,
      recurrence: (isWishlist || isGift || isActuallySomeday) ? { pattern: 'none' } : recurrence,
      isWishlist,
      isGift,
      wishlistCategory: isWishlist ? selectedWishlistCategory : undefined,
      giftRecipient: isGift ? selectedGiftRecipient : undefined,
      somedayCategory: isActuallySomeday ? selectedSomedayCategory : undefined,
      color: finalColor,
      image,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-blue-100 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
            <CheckCircle className="text-blue-900" size={18} />
            {initialTask 
              ? (isWishlist ? 'Редактировать желание' : isGift ? 'Редактировать подарок' : 'Редактировать задачу')
              : (isWishlist ? 'Желание' : isGift ? 'Подарок' : 'Новая задача')
            }
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-900 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <div className="bg-slate-50/50 rounded-xl border border-slate-200 px-4 py-2 hover:border-slate-300 transition-colors focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/10 focus-within:bg-white flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                {isWishlist ? 'название желания' : isGift ? 'название подарка' : 'название задачи'}
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

          {isWishlist ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Категория желания</label>
                
                {/* Custom select dropdown */}
                <div className="relative">
                  {(() => {
                    const activeWishlistCat = wishlistCategories.find(c => c.name === selectedWishlistCategory) || { name: selectedWishlistCategory || 'Разное', color: 'dark' };
                    const currentStyles = getStyleByColor(activeWishlistCat.color);

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsWishlistDropdownOpen(!isWishlistDropdownOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-900/10 cursor-pointer ${currentStyles.bg}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full ${currentStyles.dot} shrink-0`} />
                            <span className="truncate">{activeWishlistCat.name || 'Выберите категорию'}</span>
                          </div>
                          {isWishlistDropdownOpen ? <ChevronUp size={16} className="opacity-70" /> : <ChevronDown size={16} className="opacity-70" />}
                        </button>

                        {isWishlistDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsWishlistDropdownOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                              {wishlistCategories.length === 0 ? (
                                <div className="p-3 text-xs text-slate-400 text-center font-medium">Нет доступных категорий</div>
                              ) : (
                                wishlistCategories.map(cat => {
                                  const itemStyles = getStyleByColor(cat.color);
                                  const isSelected = cat.name === selectedWishlistCategory;
                                  const isEditing = editingWishlistCat === cat.name;

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
                                          value={editWishlistCatValue}
                                          onChange={e => setEditWishlistCatValue(e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleUpdateWishlistCategory(cat.name, editWishlistCatValue);
                                            } else if (e.key === 'Escape') {
                                              setEditingWishlistCat(null);
                                            }
                                          }}
                                          className="flex-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-850 font-semibold focus:outline-none focus:border-blue-955"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateWishlistCategory(cat.name, editWishlistCatValue)}
                                          className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                                        >
                                          ОК
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingWishlistCat(null)}
                                          className="px-2 py-1 bg-slate-200 text-slate-650 font-bold rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
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
                                        isSelected ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50'
                                      }`}
                                      onClick={() => {
                                        setSelectedWishlistCategory(cat.name);
                                        setIsWishlistDropdownOpen(false);
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
                                            setEditingWishlistCat(cat.name);
                                            setEditWishlistCatValue(cat.name);
                                          }}
                                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                          title="Редактировать категорию"
                                          aria-label="Редактировать категорию"
                                        >
                                          <Edit2 size={12} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteWishlistCategory(cat.name, e)}
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
                  {!isAddingWishlistCat ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingWishlistCat(true)}
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
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewCategory();
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
                              onClick={() => setNewCatColor(c.value)}
                              className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-all relative ${
                                newCatColor === c.value 
                                  ? 'ring-4 ring-offset-2 ring-sky-200 scale-110' 
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              title={c.label}
                              aria-label={c.label}
                            >
                              {newCatColor === c.value && (
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
                            setNewCatName('');
                            setIsAddingWishlistCat(false);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/10 transition-all cursor-pointer"
                        >
                          добавить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isGift ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Получатель подарка (Кому)</label>
                
                {/* Custom select dropdown */}
                <div className="relative">
                  {(() => {
                    const activeGiftRecipient = giftRecipients.find(r => r.name === selectedGiftRecipient) || { name: selectedGiftRecipient || 'Разное', color: 'dark' };
                    const currentStyles = getStyleByColor(activeGiftRecipient.color);

                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsGiftDropdownOpen(!isGiftDropdownOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-900/10 cursor-pointer ${currentStyles.bg}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full ${currentStyles.dot} shrink-0`} />
                            <span className="truncate">{activeGiftRecipient.name || 'Выберите получателя'}</span>
                          </div>
                          {isGiftDropdownOpen ? <ChevronUp size={16} className="opacity-70" /> : <ChevronDown size={16} className="opacity-70" />}
                        </button>

                        {isGiftDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsGiftDropdownOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                              {giftRecipients.length === 0 ? (
                                <div className="p-3 text-xs text-slate-400 text-center font-medium">Нет доступных получателей</div>
                              ) : (
                                giftRecipients.map(rec => {
                                  const itemStyles = getStyleByColor(rec.color);
                                  const isSelected = rec.name === selectedGiftRecipient;
                                  const isEditing = editingGiftRecipient === rec.name;

                                  if (isEditing) {
                                    return (
                                      <div 
                                        key={rec.name}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-55 bg-slate-50 border-y border-slate-100"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <input
                                          type="text"
                                          autoFocus
                                          value={editGiftRecipientValue}
                                          onChange={e => setEditGiftRecipientValue(e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleUpdateGiftRecipient(rec.name, editGiftRecipientValue);
                                            } else if (e.key === 'Escape') {
                                              setEditingGiftRecipient(null);
                                            }
                                          }}
                                          className="flex-1 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-850 font-semibold focus:outline-none focus:border-blue-955"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateGiftRecipient(rec.name, editGiftRecipientValue)}
                                          className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px] hover:bg-sky-700 transition cursor-pointer"
                                        >
                                          ОК
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingGiftRecipient(null)}
                                          className="px-2 py-1 bg-slate-200 text-slate-650 font-bold rounded-lg text-[10px] hover:bg-slate-300 transition cursor-pointer"
                                        >
                                          Отмена
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={rec.name}
                                      className={`flex items-center justify-between px-3 py-2 transition-colors cursor-pointer group ${
                                        isSelected ? 'bg-slate-50 font-bold' : 'hover:bg-slate-50'
                                      }`}
                                      onClick={() => {
                                        setSelectedGiftRecipient(rec.name);
                                        setIsGiftDropdownOpen(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className={`w-2.5 h-2.5 rounded-full ${itemStyles.dot} shrink-0`} />
                                        <span className="text-sm text-slate-800 truncate">{rec.name}</span>
                                        {isSelected && <Check size={14} className="text-slate-500 ml-1.5 shrink-0" />}
                                      </div>
                                      
                                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingGiftRecipient(rec.name);
                                            setEditGiftRecipientValue(rec.name);
                                          }}
                                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                                          title="Редактировать получателя"
                                          aria-label="Редактировать получателя"
                                        >
                                          <Edit2 size={12} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteGiftRecipient(rec.name, e)}
                                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                          title="Удалить получателя"
                                          aria-label="Удалить получателя"
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

                {/* Sub-toggle and recipient creator box */}
                <div className="mt-2.5">
                  {!isAddingGiftRecipient ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingGiftRecipient(true)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-wider bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100/50 cursor-pointer"
                    >
                      <Plus size={12} />
                      Добавить получателя
                    </button>
                  ) : (
                    <div className="bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 animate-fade-in space-y-3 mt-1.5">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Добавить получателя</span>
                      
                      <input
                        type="text"
                        autoFocus
                        placeholder="Имя получателя (например: Сестра)"
                        value={newRecipientName}
                        onChange={e => setNewRecipientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-medium"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewRecipient();
                          }
                        }}
                      />

                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Цвет нового получателя</span>
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
                              onClick={() => setNewRecipientColor(c.value)}
                              className={`w-5.5 h-5.5 rounded-full ${c.bg} transition-all relative ${
                                newRecipientColor === c.value 
                                  ? 'ring-4 ring-offset-2 ring-sky-200 scale-110' 
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              title={c.label}
                              aria-label={c.label}
                            >
                              {newRecipientColor === c.value && (
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
                            setNewRecipientName('');
                            setIsAddingGiftRecipient(false);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Отмена
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewRecipient}
                          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/10 transition-all cursor-pointer"
                        >
                          добавить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isSomeday ? (
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
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Category: Событие vs Задача */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Категория</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100/55 p-1 rounded-xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('task')}
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
                      onClick={() => handleCategoryChange('event')}
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

                {/* Scope: Личные vs Рабочие */}
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

              {/* Color Selection */}
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
                  ].map(item => (
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

              <div className="border-t border-slate-100 pt-4 space-y-4">
                {/* Scheduled toggler */}
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
                       <Calendar size={18} className="text-blue-950 shrink-0" />
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
                             <span className="text-[10px] font-semibold text-blue-905">Максимально 23 ч 59 мин</span>
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
                 ) : (
                  <p className="text-xs text-blue-905 bg-blue-50/50 p-3 rounded-xl border border-blue-100/40 leading-relaxed font-semibold">
                    ℹ️ Вы отключаете конкретную дату. Задача будет автоматически сохранена в отдельную вкладку <strong>«Когда-нибудь (Без срока)»</strong>.
                  </p>
                )}
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

            </>
          )}

          {/* Notes description */}
          <div className="border-t border-sky-50 pt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Заметки / Подробности</label>
            <textarea
              placeholder="Ввод текста"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-sky-100 bg-sky-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 text-sm transition-all resize-none"
            />
          </div>

          {/* Photo attachment section */}
          <div className="border-t border-sky-50 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Фотография {isWishlist ? 'желания' : isGift ? 'подарка' : 'задачи'}
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(undefined)}
                  className="text-[10px] text-rose-500 font-bold hover:underline"
                >
                  Удалить фото
                </button>
              )}
            </div>

            {image ? (
              <div 
                className="relative rounded-2xl overflow-hidden border border-slate-100 group aspect-[4/3] bg-slate-50 flex items-center justify-center cursor-zoom-in"
                onClick={() => onZoomImage?.(image)}
                title="Нажмите, чтобы открыть фото целиком"
              >
                <img
                  src={image}
                  alt="Загруженное фото"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoomImage?.(image);
                    }}
                    className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95"
                  >
                    <Eye size={14} />
                    <span>Открыть</span>
                  </button>
                  <label 
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer bg-white/90 hover:bg-white text-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold shadow transition-all active:scale-95 text-center flex items-center"
                  >
                    Заменить фото
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-100 rounded-xl p-4 cursor-pointer hover:border-sky-300 hover:bg-sky-50/20 transition-all text-center">
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-2">
                  <Camera size={18} />
                </div>
                <span className="text-xs font-semibold text-slate-700">Загрузить фото желания</span>
                <span className="text-[10px] text-slate-400 mt-1">Доступно только в картоке желания</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
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
            onClick={handleFormSubmit}
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
