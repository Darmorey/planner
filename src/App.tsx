import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Calendar as CalendarIcon, Check, ListTodo, Gift, 
  ExternalLink, LogIn, RefreshCw, Eye, EyeOff, LayoutGrid, Clock,
  MapPin, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, Circle, Trash2, Edit2, Bookmark, Heart, FileText, Sparkles, Settings, X
} from 'lucide-react';
import { Task, DayNote } from './types';
import { doesTaskOccurOnDate, calculateFreeTime, getDaysDifference, parseLocalDate, formatLocalDate, compareTasksByTime, calculateEndTime, isTaskCompletedOnDate } from './utils/taskHelpers';
import { INITIAL_TASKS, INITIAL_NOTES } from './utils/initialData';
import MonthCalendar from './components/MonthCalendar';
import TaskForm from './components/TaskForm';
import SettingsModal from './components/SettingsModal';
import NotesSection from './components/NotesSection';
import NotesStorageModal from './components/NotesStorageModal';
import NoteEditModal from './components/NoteEditModal';
import DeleteRecurringTaskModal from './components/DeleteRecurringTaskModal';
import { 
  getTaskBgClass, 
  getTaskBorderLeftClass, 
  getDotBgClass, 
  getBorderThemeClass, 
  getTextThemeClass 
} from './utils/themeHelpers';
import SomedayTab from './components/SomedayTab';
import WishlistTab from './components/WishlistTab';
import GiftsTab from './components/GiftsTab';

import { ThemeId, isThemeId } from './utils/themeTypes';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  isDark: boolean;
  bodyBg: string;
  appBg: string;
  contentBg: string;
  cardBg: string;
  chipBg: string;
  chipBorder: string;
  mutedText: string;
  mutedHover: string;
  headerBg: string;
  headerGradientFrom: string;
  headerGradientTo: string;
  accentText: string;
  accentTextHover: string;
  accentBorder: string;
  accentBorderSolid: string;
  accentBg: string;
  accentBgHover: string;
  subAccentBgLight: string;
  subAccentBgLight5: string;
  subAccentBorderLight: string;
  subAccentBorderLight10: string;
  subAccentBg: string;
  subAccentHover: string;
  subAccentText: string;
  selectionClasses: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  standard: {
    id: 'standard',
    name: 'Лес',
    isDark: false,
    bodyBg: 'bg-[#D1D9CA]',
    appBg: 'bg-white',
    contentBg: 'bg-slate-50/40',
    cardBg: 'bg-white',
    chipBg: 'bg-white',
    chipBorder: 'border-slate-100',
    mutedText: 'text-slate-500',
    mutedHover: 'hover:text-slate-800 hover:bg-slate-50/40',
    headerBg: 'bg-[#0C3B2E]',
    headerGradientFrom: '#CBD6C4',
    headerGradientTo: '#A7BFA0',
    accentText: 'text-[#0C3B2E]',
    accentTextHover: 'hover:text-[#0C3B2E]',
    accentBorder: 'border-[#0C3B2E]/15',
    accentBorderSolid: 'border-[#0C3B2E]',
    accentBg: 'bg-[#0C3B2E]',
    accentBgHover: 'hover:bg-[#07251D]',
    subAccentBgLight: 'bg-[#6D9773]/10',
    subAccentBgLight5: 'bg-[#6D9773]/5',
    subAccentBorderLight: 'border-[#6D9773]/15',
    subAccentBorderLight10: 'border-[#6D9773]/10',
    subAccentBg: 'bg-[#6D9773]',
    subAccentHover: 'hover:bg-[#58825e]',
    subAccentText: 'text-[#6D9773]',
    selectionClasses: 'selection:bg-[#6D9773]/30 selection:text-[#0C3B2E]'
  },
  forestDark: {
    id: 'forestDark',
    name: 'Ночной лес',
    isDark: true,
    bodyBg: 'bg-[#042018]',
    appBg: 'bg-[#0A2820]',
    contentBg: 'bg-[#051F19]',
    cardBg: 'bg-[#0C3B2E]',
    chipBg: 'bg-[#134A3A]',
    chipBorder: 'border-white/10',
    mutedText: 'text-emerald-100/55',
    mutedHover: 'hover:text-[#E8F0EA] hover:bg-white/5',
    headerBg: 'bg-[#0C3B2E]',
    headerGradientFrom: '#1A4D3E',
    headerGradientTo: '#0C3B2E',
    accentText: 'text-[#E8F0EA]',
    accentTextHover: 'hover:text-white',
    accentBorder: 'border-white/10',
    accentBorderSolid: 'border-[#6D9773]',
    accentBg: 'bg-[#6D9773]',
    accentBgHover: 'hover:bg-[#58825e]',
    subAccentBgLight: 'bg-[#6D9773]/15',
    subAccentBgLight5: 'bg-[#6D9773]/10',
    subAccentBorderLight: 'border-[#6D9773]/25',
    subAccentBorderLight10: 'border-[#6D9773]/15',
    subAccentBg: 'bg-[#6D9773]',
    subAccentHover: 'hover:bg-[#7DAB83]',
    subAccentText: 'text-[#A7C4AA]',
    selectionClasses: 'selection:bg-[#6D9773]/40 selection:text-white'
  },
  autumn: {
    id: 'autumn',
    name: 'Песок',
    isDark: false,
    bodyBg: 'bg-[#F3EEE8]',
    appBg: 'bg-[#FFFbf7]',
    contentBg: 'bg-[#F7F2EC]',
    cardBg: 'bg-white',
    chipBg: 'bg-white',
    chipBorder: 'border-[#5C4033]/10',
    mutedText: 'text-slate-500',
    mutedHover: 'hover:text-slate-800 hover:bg-slate-50/40',
    headerBg: 'bg-[#5C4033]',
    headerGradientFrom: '#C4A484',
    headerGradientTo: '#E8D5C4',
    accentText: 'text-[#5C4033]',
    accentTextHover: 'hover:text-[#5C4033]',
    accentBorder: 'border-[#5C4033]/12',
    accentBorderSolid: 'border-[#5C4033]',
    accentBg: 'bg-[#A67C5D]',
    accentBgHover: 'hover:bg-[#8F684C]',
    subAccentBgLight: 'bg-[#A67C5D]/12',
    subAccentBgLight5: 'bg-[#A67C5D]/8',
    subAccentBorderLight: 'border-[#A67C5D]/18',
    subAccentBorderLight10: 'border-[#A67C5D]/12',
    subAccentBg: 'bg-[#A67C5D]',
    subAccentHover: 'hover:bg-[#8F684C]',
    subAccentText: 'text-[#8F684C]',
    selectionClasses: 'selection:bg-[#A67C5D]/25 selection:text-[#5C4033]'
  },
  gray: {
    id: 'gray',
    name: 'Камень',
    isDark: false,
    bodyBg: 'bg-[#ECECED]',
    appBg: 'bg-white',
    contentBg: 'bg-slate-50/50',
    cardBg: 'bg-white',
    chipBg: 'bg-white',
    chipBorder: 'border-slate-100',
    mutedText: 'text-slate-500',
    mutedHover: 'hover:text-slate-800 hover:bg-slate-50/40',
    headerBg: 'bg-[#3F3F46]',
    headerGradientFrom: '#A1A1AA',
    headerGradientTo: '#E4E4E7',
    accentText: 'text-[#27272A]',
    accentTextHover: 'hover:text-[#18181B]',
    accentBorder: 'border-[#27272A]/12',
    accentBorderSolid: 'border-[#3F3F46]',
    accentBg: 'bg-[#3F3F46]',
    accentBgHover: 'hover:bg-[#27272A]',
    subAccentBgLight: 'bg-[#71717A]/10',
    subAccentBgLight5: 'bg-[#71717A]/5',
    subAccentBorderLight: 'border-[#71717A]/15',
    subAccentBorderLight10: 'border-[#71717A]/10',
    subAccentBg: 'bg-[#71717A]',
    subAccentHover: 'hover:bg-[#52525B]',
    subAccentText: 'text-[#52525B]',
    selectionClasses: 'selection:bg-slate-200 selection:text-slate-900'
  },
  bright: {
    id: 'bright',
    name: 'Лаванда',
    isDark: false,
    bodyBg: 'bg-[#F0EEF5]',
    appBg: 'bg-[#FBFBFE]',
    contentBg: 'bg-[#F5F3FA]',
    cardBg: 'bg-white',
    chipBg: 'bg-white',
    chipBorder: 'border-[#3D3A5C]/10',
    mutedText: 'text-slate-500',
    mutedHover: 'hover:text-slate-800 hover:bg-slate-50/40',
    headerBg: 'bg-[#3D3A5C]',
    headerGradientFrom: '#9B95B8',
    headerGradientTo: '#D4D0E6',
    accentText: 'text-[#3D3A5C]',
    accentTextHover: 'hover:text-[#3D3A5C]',
    accentBorder: 'border-[#3D3A5C]/12',
    accentBorderSolid: 'border-[#3D3A5C]',
    accentBg: 'bg-[#7B74A8]',
    accentBgHover: 'hover:bg-[#6A6396]',
    subAccentBgLight: 'bg-[#7B74A8]/12',
    subAccentBgLight5: 'bg-[#7B74A8]/8',
    subAccentBorderLight: 'border-[#7B74A8]/18',
    subAccentBorderLight10: 'border-[#7B74A8]/12',
    subAccentBg: 'bg-[#7B74A8]',
    subAccentHover: 'hover:bg-[#6A6396]',
    subAccentText: 'text-[#6A6396]',
    selectionClasses: 'selection:bg-[#7B74A8]/20 selection:text-[#3D3A5C]'
  }
};

export default function App() {
  // --- STATE ---
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('task_calendar_theme');
    return isThemeId(saved) ? saved : 'standard';
  });
  const t = THEMES[theme] || THEMES.standard;

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('planner_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<DayNote[]>(() => {
    const saved = localStorage.getItem('planner_notes');
    if (!saved) return INITIAL_NOTES;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Automatically migrate legacy notes (format: { date, content }) to { id, date, title, content, createdAt }
        return parsed.map((item: any, idx) => {
          if (item && typeof item === 'object' && !item.id && typeof item.content === 'string') {
            return {
              id: `note-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
              date: item.date || formatLocalDate(new Date()),
              title: item.title || 'Заметка',
              content: item.content,
              createdAt: Date.now() - (parsed.length - idx) * 1000 // preserve relative ordering
            };
          }
          return item;
        });
      }
      return INITIAL_NOTES;
    } catch (e) {
      return INITIAL_NOTES;
    }
  });

  const [isNotesStorageOpen, setIsNotesStorageOpen] = useState(false);
  const [isNoteEditOpen, setIsNoteEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<DayNote | null>(null);

  const todayStr = formatLocalDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [currentTab, setCurrentTab] = useState<'daily' | 'someday' | 'wishlist' | 'gifts'>('daily');
  const [activeScope, setActiveScope] = useState<'all' | 'personal' | 'work'>('all');

  // Modal control
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);

  // Collapsed sections for Wishlist & Gifts & Someday
  const [collapsedWishes, setCollapsedWishes] = useState<Record<string, boolean>>({});
  const [collapsedGifts, setCollapsedGifts] = useState<Record<string, boolean>>({});
  const [collapsedSomeday, setCollapsedSomeday] = useState<Record<string, boolean>>({});
  const [isDayTasksCollapsed, setIsDayTasksCollapsed] = useState(false);
  const [isScheduleCollapsed, setIsScheduleCollapsed] = useState(false);

  const [defaultGiftRecipient, setDefaultGiftRecipient] = useState<string | undefined>(undefined);
  const [defaultWishlistCategory, setDefaultWishlistCategory] = useState<string | undefined>(undefined);
  const [defaultSomedayCategory, setDefaultSomedayCategory] = useState<string | undefined>(undefined);

  // Zoomed Image for full-screen preview lightbox
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Confirmation state for clearing all data safely
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const clearCooldownRef = useRef<NodeJS.Timeout | null>(null);

  // State for deleting recurring tasks
  const [deletingRecurringTask, setDeletingRecurringTask] = useState<{ taskId: string; dateStr: string; taskTitle: string } | null>(null);

  const handleClearAllData = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      if (clearCooldownRef.current) clearTimeout(clearCooldownRef.current);
      clearCooldownRef.current = setTimeout(() => {
        setIsConfirmingClear(false);
      }, 4000); // 4 seconds confirmation window
    } else {
      if (clearCooldownRef.current) clearTimeout(clearCooldownRef.current);
      setIsConfirmingClear(false);
      setTasks([]);
      setNotes([]);
      localStorage.removeItem('planner_tasks');
      localStorage.removeItem('planner_notes');
    }
  };

  useEffect(() => {
    return () => {
      if (clearCooldownRef.current) clearTimeout(clearCooldownRef.current);
    };
  }, []);

  // Swipe: header = weeks, content = days
  const weekTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const dayTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleWeekTouchStart = (e: React.TouchEvent) => {
    weekTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleWeekTouchEnd = (e: React.TouchEvent) => {
    if (!weekTouchStartRef.current) return;
    const dx = weekTouchStartRef.current.x - e.changedTouches[0].clientX;
    const dy = weekTouchStartRef.current.y - e.changedTouches[0].clientY;
    weekTouchStartRef.current = null;

    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) {
      navigateWeeks(1);
    } else {
      navigateWeeks(-1);
    }
  };

  const handleDayTouchStart = (e: React.TouchEvent) => {
    dayTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleDayTouchEnd = (e: React.TouchEvent) => {
    if (!dayTouchStartRef.current) return;
    const dx = dayTouchStartRef.current.x - e.changedTouches[0].clientX;
    const dy = dayTouchStartRef.current.y - e.changedTouches[0].clientY;
    dayTouchStartRef.current = null;

    // Ignore mostly-vertical scrolls
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx > 0) {
      navigateDays(1);
    } else {
      navigateDays(-1);
    }
  };

  // --- LOCAL PERSISTENCE SYNC ---
  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planner_notes', JSON.stringify(notes));
  }, [notes]);

  // --- OVERDUE UNTIMED TASKS ROLLOVER ---
  useEffect(() => {
    setTasks(prev => {
      let changed = false;
      const updated = prev.map(t => {
        if (!t.isWishlist && !t.isGift && t.date && !t.time && !t.completed && t.date < todayStr && (!t.recurrence || t.recurrence.pattern === 'none')) {
          changed = true;
          return { ...t, date: todayStr };
        }
        return t;
      });
      return changed ? updated : prev;
    });
  }, [todayStr]);

  // --- DATE CALCULATIONS & NAVIGATION ---
  // Get days of the week surrounding the active selectedDate
  const getWeekDates = (currentDateStr: string) => {
    const date = parseLocalDate(currentDateStr);
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Calculate difference to Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const tempDate = new Date(date.getTime());
      tempDate.setDate(date.getDate() + diffToMonday + i);
      week.push(formatLocalDate(tempDate));
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const handleSelectDate = (dateStr: string, keepOpen = false) => {
    const currentWeekStart = weekDates[0];
    const newWeekDates = getWeekDates(dateStr);
    const newWeekStart = newWeekDates[0];

    if (newWeekStart !== currentWeekStart) {
      if (dateStr < selectedDate) {
        setSlideDirection('right');
      } else {
        setSlideDirection('left');
      }
    }

    setSelectedDate(dateStr);
    if (!keepOpen) {
      setShowFullCalendar(false); // Close calendar once date is chosen
      setCurrentTab('daily'); // Switch to daily view to show detailed tasks of that day
    }
  };

  const getDayNameShort = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return names[date.getDay()];
  };

  const getMonthNamePretty = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[date.getMonth()];
  };

  const getShortMonthName = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    const monthsShort = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    return monthsShort[date.getMonth()];
  };

  const getGenitiveMonthName = (dateStr: string): string => {
    const date = parseLocalDate(dateStr);
    const monthsGenitive = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return monthsGenitive[date.getMonth()];
  };

  const navigateDays = (days: number) => {
    if (days > 0) {
      setSlideDirection('left');
    } else if (days < 0) {
      setSlideDirection('right');
    }
    const date = parseLocalDate(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatLocalDate(date));
  };

  /** Jump to Monday of previous/next week */
  const navigateWeeks = (weeks: number) => {
    if (weeks > 0) {
      setSlideDirection('left');
    } else if (weeks < 0) {
      setSlideDirection('right');
    }
    const date = parseLocalDate(selectedDate);
    const dayOfWeek = date.getDay(); // 0 = Sun … 6 = Sat
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setDate(date.getDate() + diffToMonday + weeks * 7);
    setSelectedDate(formatLocalDate(date));
  };

  // --- TASK ACTIONS ---
  const handleAddTaskClick = () => {
    setEditingTask(null);
    setDefaultGiftRecipient(undefined);
    setDefaultWishlistCategory(undefined);
    setDefaultSomedayCategory(undefined);
    setIsTaskFormOpen(true);
  };

  const handleAddGiftClick = (recipient: string) => {
    setEditingTask(null);
    setDefaultGiftRecipient(recipient);
    setDefaultWishlistCategory(undefined);
    setDefaultSomedayCategory(undefined);
    setIsTaskFormOpen(true);
  };

  const handleAddWishClick = (categoryName: string) => {
    setEditingTask(null);
    setDefaultGiftRecipient(undefined);
    setDefaultWishlistCategory(categoryName);
    setDefaultSomedayCategory(undefined);
    setIsTaskFormOpen(true);
  };

  const handleAddSomedayClick = (categoryName: string) => {
    setEditingTask(null);
    setDefaultGiftRecipient(undefined);
    setDefaultWishlistCategory(undefined);
    setDefaultSomedayCategory(categoryName);
    setIsTaskFormOpen(true);
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setDefaultGiftRecipient(undefined);
    setDefaultWishlistCategory(undefined);
    setDefaultSomedayCategory(undefined);
    setIsTaskFormOpen(true);
  };

  const handleToggleComplete = (taskId: string, dateStr: string = selectedDate) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.recurrence && t.recurrence.pattern !== 'none') {
          const currentCompletes = t.completedDates || [];
          if (currentCompletes.includes(dateStr)) {
            return {
              ...t,
              completedDates: currentCompletes.filter(d => d !== dateStr)
            };
          } else {
            return {
              ...t,
              completedDates: [...currentCompletes, dateStr]
            };
          }
        } else {
          return { ...t, completed: !t.completed };
        }
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (taskToDelete.recurrence && taskToDelete.recurrence.pattern !== 'none') {
      setDeletingRecurringTask({
        taskId: taskToDelete.id,
        dateStr: selectedDate,
        taskTitle: taskToDelete.title
      });
    } else {
      if (window.confirm('Вы действительно хотите удалить эту задачу?')) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    }
  };

  const handleDeleteOccurrence = (taskId: string, dateStr: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const currentExclusions = t.excludedDates || [];
        if (!currentExclusions.includes(dateStr)) {
          return {
            ...t,
            excludedDates: [...currentExclusions, dateStr]
          };
        }
      }
      return t;
    }));
  };

  const handleDeleteAllOccurrences = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleTaskFormSubmit = (taskData: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      // Editing
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
    } else {
      // New
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        completed: false
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const handleQuickAddSomeday = (categoryName: string, title: string) => {
    const catObj = somedayCategories.find((c: any) => c.name === categoryName);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      category: 'task',
      scope: 'personal',
      completed: false,
      recurrence: { pattern: 'none' },
      somedayCategory: categoryName,
      color: catObj?.color || 'blue',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleQuickAddWishlist = (categoryName: string, title: string) => {
    const catObj = wishlistCategories.find((c: any) => c.name === categoryName);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      category: 'task',
      scope: 'personal',
      completed: false,
      recurrence: { pattern: 'none' },
      isWishlist: true,
      wishlistCategory: categoryName,
      color: catObj?.color || 'red',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleQuickAddGift = (recipientName: string, title: string) => {
    const recObj = giftRecipients.find((r: any) => r.name === recipientName);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      category: 'task',
      scope: 'personal',
      completed: false,
      recurrence: { pattern: 'none' },
      isGift: true,
      giftRecipient: recipientName,
      color: recObj?.color || 'blue',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // --- REAL-TIME NOTES ACTIONS ---
  const handleSaveNote = (noteData: { id?: string; title: string; content: string; date: string }) => {
    setNotes(prev => {
      if (noteData.id) {
        // Edit existing
        return prev.map(n => n.id === noteData.id ? { 
          ...n, 
          title: noteData.title, 
          content: noteData.content, 
          date: noteData.date 
        } : n);
      } else {
        // Create new
        const newNote: DayNote = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: noteData.title,
          content: noteData.content,
          date: noteData.date,
          createdAt: Date.now()
        };
        return [...prev, newNote];
      }
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingNote?.id === id) {
      setEditingNote(null);
    }
  };

  // --- FILTERING TASKS FOR THE DAY ---
  // Get active scheduled tasks for selectedDate
  const allScheduledTasksOpenAndClosed = tasks.filter(task => 
    !task.isWishlist && !task.isGift && task.date && doesTaskOccurOnDate(task, selectedDate)
  );

  // Divide into un-timed tasks list and timed timeline tasks list
  // Prompt: "У задачи можно выбрать, отображать ее в основном календаре или нет. по умолчанию она не заноситься, для этого нудно поставить ее в категорию 'Событие'"
  // Let's filter by workspace scope tabs first ("личные задачи", "рабочие задачи")
  const filteredScheduledTasks = allScheduledTasksOpenAndClosed.filter(task => {
    if (activeScope === 'personal' && task.scope !== 'personal') return false;
    if (activeScope === 'work' && task.scope !== 'work') return false;
    if (hideCompleted && isTaskCompletedOnDate(task, selectedDate)) return false;
    return true;
  });

  // Checklist items: all tasks for the day (both timed and untimed)
  const unTimedTasks = filteredScheduledTasks
    .sort((a, b) => a.title.localeCompare(b.title));

  // Timed tasks for schedule vertical timeline
  const timedTasks = filteredScheduledTasks
    .filter(task => !!task.time)
    .sort((a, b) => compareTasksByTime(a, b, selectedDate));

  // Someday (No Date) tasks list
  const somedayTasks = tasks.filter(task => !task.isWishlist && !task.isGift && !task.date);

  // Predefined/custom someday categories and their colors
  const somedayCategories = (() => {
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
  })();

  // Group someday tasks by category
  const groupedSomeday: { [key: string]: Task[] } = {};
  somedayTasks.forEach(task => {
    const cat = task.somedayCategory || 'Разное';
    if (!groupedSomeday[cat]) {
      groupedSomeday[cat] = [];
    }
    groupedSomeday[cat].push(task);
  });

  // Unique someday category names list containing tasks or preselected
  const orderedSomedayCategoryNames = [
    ...somedayCategories.map((c: any) => c.name),
    ...Object.keys(groupedSomeday).filter(name => !somedayCategories.some((c: any) => c.name === name))
  ].filter(name => groupedSomeday[name] && groupedSomeday[name].length > 0);

  // Wishlist list
  const wishlistTasks = tasks.filter(task => !!task.isWishlist);

  // Predefined/custom wishlist categories and their colors
  const wishlistCategories = (() => {
    const saved = localStorage.getItem('wishlist_categories_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { name: 'Одежда', color: 'red' },
      { name: 'Дом', color: 'green' },
      { name: 'Хобби', color: 'purple' },
    ];
  })();

  // Group wishlist tasks by category
  const groupedWishes: { [key: string]: Task[] } = {};
  wishlistTasks.forEach(task => {
    const cat = task.wishlistCategory || 'Одежда';
    if (!groupedWishes[cat]) {
      groupedWishes[cat] = [];
    }
    groupedWishes[cat].push(task);
  });

  // Unique categories list containing tasks or preselected
  const orderedWishlistCategoryNames = [
    ...wishlistCategories.map((c: any) => c.name),
    ...Object.keys(groupedWishes).filter(name => !wishlistCategories.some((c: any) => c.name === name))
  ].filter(name => groupedWishes[name] && groupedWishes[name].length > 0);

  // Gifts list
  const giftsTasks = tasks.filter(task => !!task.isGift);

  // Predefined/custom gift recipients and their colors
  const giftRecipients = (() => {
    const saved = localStorage.getItem('gift_recipients_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { name: 'Папа', color: 'blue' },
      { name: 'Мама', color: 'red' },
      { name: 'Лёша', color: 'purple' },
      { name: 'Бабушка', color: 'green' },
    ];
  })();

  // Group gift tasks by recipient
  const groupedGifts: { [key: string]: Task[] } = {};
  giftsTasks.forEach(task => {
    const recipient = task.giftRecipient || 'Папа';
    if (!groupedGifts[recipient]) {
      groupedGifts[recipient] = [];
    }
    groupedGifts[recipient].push(task);
  });

  // Unique recipient names list containing gifts or preselected
  const orderedGiftRecipientNames = [
    ...giftRecipients.map((r: any) => r.name),
    ...Object.keys(groupedGifts).filter(name => !giftRecipients.some((r: any) => r.name === name))
  ].filter(name => groupedGifts[name] && groupedGifts[name].length > 0);

  // Free hours calculation based on all scheduled, active tasks for the day
  const freeTime = calculateFreeTime(allScheduledTasksOpenAndClosed, selectedDate);

  return (
    <div className={`min-h-screen ${t.bodyBg} pb-16 flex justify-center ${t.selectionClasses}`}>
      <div className={`w-full max-w-2xl ${t.appBg} min-h-screen shadow-2xl border-x ${t.accentBorder} flex flex-col relative overflow-hidden`}>
        
        {/* TOP STATUS BAR ACCENTS */}
        <div 
          onTouchStart={handleWeekTouchStart}
          onTouchEnd={handleWeekTouchEnd}
          className={`${t.headerBg} px-6 py-4 pb-6 text-white text-center relative overflow-hidden select-none`}
        >
          <div 
            style={{ backgroundColor: t.headerGradientFrom }}
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-25 -mr-10 -mt-10"
          ></div>
          <div 
            style={{ backgroundColor: t.headerGradientTo }}
            className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"
          ></div>
          
          <div className="relative flex items-center justify-end mb-4 mt-1">
            {/* Quick action triggers */}
            <div className="flex items-center gap-2">
              {/* Reset to current date */}
              <button 
                onClick={() => setSelectedDate(todayStr)}
                className="px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold bg-white/10 hover:bg-white/25 active:scale-95 border border-white/25 hover:border-white/40 tracking-wider rounded-full transition-all flex items-center gap-1"
                title={`Вернуться к сегодняшнему дню (${parseLocalDate(todayStr).getDate()} ${getGenitiveMonthName(todayStr)} ${parseLocalDate(todayStr).getFullYear()})`}
              >
                Сегодня ({parseLocalDate(todayStr).getDate()} {getShortMonthName(todayStr)})
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 sm:p-2 active:scale-95 rounded-full border border-white/20 hover:bg-white/20 bg-white/10 text-white transition-all flex items-center justify-center"
                title="Настройки ежедневника"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>

          {/* Month Display & Navigation */}
          <div className="relative flex items-center justify-between px-1 mb-1">
            <button 
              onClick={() => navigateWeeks(-1)}
              className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/45 rounded-xl shadow-md transition-all text-white active:scale-95"
              title="Предыдущая неделя"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            
            <span className="text-3xl font-extrabold tracking-wider font-sans text-[#F4F0EB]">
              {getMonthNamePretty(selectedDate)}
            </span>

            <button 
              onClick={() => navigateWeeks(1)}
              className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/45 rounded-xl shadow-md transition-all text-white active:scale-95"
              title="Следующая неделя"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>

          {/* 7-DAY STRIP SELECTOR */}
          <div className="relative mt-6 h-[88px] w-full overflow-hidden">
            <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
              <motion.div
                key={weekDates[0]} // Use Monday's date string as key to trigger animation on week change
                custom={slideDirection}
                variants={{
                  enter: (dir: 'left' | 'right') => ({
                    x: dir === 'left' ? '120%' : '-120%',
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (dir: 'left' | 'right') => ({
                    x: dir === 'left' ? '-120%' : '120%',
                    opacity: 0,
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                className="grid grid-cols-7 gap-1 text-center w-full absolute top-0 left-0"
              >
                {weekDates.map(dateStr => {
                  const isSelected = dateStr === selectedDate;
                  const dateObj = parseLocalDate(dateStr);
                  const dayNum = dateObj.getDate();
                  const isToday = dateStr === todayStr;

                  // Calculate task completion status for this date
                  const dayTasksForDot = tasks.filter(t => !t.isWishlist && !t.isGift && t.date && doesTaskOccurOnDate(t, dateStr));
                  const hasUncompleted = dayTasksForDot.some(t => !isTaskCompletedOnDate(t, dateStr));

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleSelectDate(dateStr)}
                      className="flex flex-col items-center group cursor-pointer focus:outline-none"
                    >
                      <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider mb-2">
                        {getDayNameShort(dateStr)}
                      </span>
                      
                      <div className={`
                        w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-all relative
                        ${isSelected 
                          ? 'bg-white text-[#0C3B2E] shadow-lg shadow-black/10 scale-110 font-bold' 
                          : 'hover:bg-white/10 text-white'
                        }
                        ${isToday && !isSelected ? 'border border-white/40 bg-white/5 text-slate-100' : ''}
                      `}>
                        <span>{dayNum}</span>
                      </div>

                      {/* Dot under the date circle button representing daily task completion status */}
                      <div className="mt-1.5 flex justify-center h-1.5">
                        {dayTasksForDot.length > 0 ? (
                          <span 
                            className={`w-1.5 h-1.5 rounded-full transition-colors border border-white/10 shadow-sm ${
                              hasUncompleted ? 'bg-[#FF6B8B]' : 'bg-[#A6C261]'
                            }`}
                            title={hasUncompleted ? 'Есть невыполненные задачи' : 'Все задачи выполнены'}
                          />
                        ) : (
                          <div className="w-1.5 h-1.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FULL CALENDAR TRIGGER */}
        <div className={`flex ${t.subAccentBgLight} px-6 py-2.5 border-b ${t.subAccentBorderLight} items-center justify-between text-xs font-semibold ${t.accentText}`}>
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors text-[10px] sm:text-[11px] ${
              showFullCalendar 
                ? `${t.subAccentBg} text-white border-transparent ${t.subAccentHover}` 
                : `${t.chipBg} ${t.accentText} ${t.chipBorder} hover:${t.subAccentBgLight}`
            }`}
          >
            <CalendarIcon size={12} className={showFullCalendar ? 'text-white' : `${t.subAccentText}`} />
            <span>Календарь</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm transition-colors text-[10px] sm:text-[11px] ${
                hideCompleted 
                  ? `${t.subAccentBg} text-white border-transparent ${t.subAccentHover}` 
                  : `${t.chipBg} ${t.accentText} ${t.chipBorder} hover:${t.subAccentBgLight}`
              }`}
            >
              {hideCompleted ? <EyeOff size={12} className="text-white" /> : <Eye size={12} className={`${t.subAccentText}`} />}
              <span>Скрыть сделанные</span>
            </button>
          </div>
        </div>

        {/* PERSISTENT MAIN NAVIGATION TABS */}
        <div className={`grid grid-cols-4 border-b ${t.subAccentBorderLight} text-center text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-medium ${t.mutedText} ${t.cardBg} shadow-sm z-10`}>
          <button
            onClick={() => setCurrentTab('daily')}
            className={`py-3.5 border-b-2 transition-all flex items-center justify-center gap-1.2 sm:gap-1.5 ${
              currentTab === 'daily' 
                ? `${t.accentBorderSolid} ${t.accentText} font-semibold ${t.subAccentBgLight5}` 
                : `border-transparent ${t.mutedHover}`
            }`}
          >
            <Clock size={15} />
            <span className="truncate">Расписание</span>
          </button>
          
          <button
            onClick={() => setCurrentTab('someday')}
            className={`py-3.5 border-b-2 transition-all flex items-center justify-center gap-1.2 sm:gap-1.5 ${
              currentTab === 'someday' 
                ? `${t.accentBorderSolid} ${t.accentText} font-semibold ${t.subAccentBgLight5}` 
                : `border-transparent ${t.mutedHover}`
            }`}
          >
            <Bookmark size={15} />
            <span className="truncate">Без срока</span>
          </button>

          <button
            onClick={() => setCurrentTab('wishlist')}
            className={`py-3.5 border-b-2 transition-all flex items-center justify-center gap-1.2 sm:gap-1.5 ${
              currentTab === 'wishlist' 
                ? `${t.accentBorderSolid} ${t.accentText} font-semibold ${t.subAccentBgLight5}` 
                : `border-transparent ${t.mutedHover}`
            }`}
          >
            <Heart size={15} className="text-[#FF6B8B]" />
            <span className="truncate">Желания</span>
          </button>

          <button
            onClick={() => setCurrentTab('gifts')}
            className={`py-3.5 border-b-2 transition-all flex items-center justify-center gap-1.2 sm:gap-1.5 ${
              currentTab === 'gifts' 
                ? `${t.accentBorderSolid} ${t.accentText} font-semibold ${t.subAccentBgLight5}` 
                : `border-transparent ${t.mutedHover}`
            }`}
          >
            <Gift size={15} className="text-yellow-600" />
            <span className="truncate">Подарки</span>
          </button>
        </div>

        {/* MAIN DISPLAY VIEWPORT */}
        <div className={`flex-1 overflow-y-auto px-6 py-6 ${t.contentBg}`}>
          
          {showFullCalendar && (
            <div className="mb-6 -mx-6 animate-fade-in">
              <MonthCalendar
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                tasks={tasks}
                theme={t}
                fullWidth
              />
            </div>
          )}

          {/* DAILY SCHEDULE TAB */}
          {currentTab === 'daily' && (
            <div
              className="space-y-6"
              onTouchStart={handleDayTouchStart}
              onTouchEnd={handleDayTouchEnd}
            > 
              {/* WORKSPACE SUB-TABS (личные задачи и рабочие задачи) */}
              <div className={`flex items-center justify-between gap-2 border-b ${t.subAccentBorderLight10} pb-3`}>
                <div className={`flex gap-1 sm:gap-1.5 ${t.subAccentBgLight5} p-0.5 sm:p-1 rounded-xl border ${t.subAccentBorderLight10} shrink-0`}>
                  <button
                    onClick={() => setActiveScope('all')}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                      activeScope === 'all' 
                        ? `${t.chipBg} ${t.accentText} shadow-sm` 
                        : `${t.mutedText} ${t.accentTextHover}`
                    }`}
                  >
                    Все задачи
                  </button>
                  <button
                    onClick={() => setActiveScope('personal')}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                      activeScope === 'personal' 
                        ? `${t.subAccentBg} text-white shadow-sm` 
                        : `${t.mutedText} ${t.accentTextHover}`
                    }`}
                  >
                    Личные
                  </button>
                  <button
                    onClick={() => setActiveScope('work')}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                      activeScope === 'work' 
                        ? `${t.subAccentBg} text-white shadow-sm` 
                        : `${t.mutedText} ${t.accentTextHover}`
                    }`}
                  >
                    Рабочие
                  </button>
                </div>
 
                {/* ADD FLUID SHORTCUT */}
                <button
                  onClick={handleAddTaskClick}
                  title="Добавить"
                  className={`flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-1.5 ${t.accentBg} ${t.accentBgHover} text-white font-semibold rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 shrink-0`}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* UNTIMED CHECKLIST (Tasks without assigned times) */}
              {unTimedTasks.length > 0 && (
                <div className={`${t.cardBg} rounded-2xl p-4 border ${t.subAccentBorderLight} shadow-sm`}>
                  <div 
                    onClick={() => setIsDayTasksCollapsed(prev => !prev)}
                    className={`flex items-center justify-between cursor-pointer select-none pb-1.5 border-b ${t.subAccentBorderLight10} group/day`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`block text-[11px] font-bold ${t.accentText} uppercase tracking-wider group-hover/day:underline decoration-2`}>Задачи на день:</span>
                      <span className={`text-[10px] ${t.subAccentText} ${t.subAccentBgLight} font-bold px-2 py-0.5 rounded-full border ${t.subAccentBorderLight}`}>
                        {unTimedTasks.length}
                      </span>
                    </div>

                    <button 
                      type="button"
                      className="p-1 hover:bg-[#6D9773]/10 rounded-lg text-slate-400 hover:text-[#6D9773] transition-colors"
                      aria-label={isDayTasksCollapsed ? "Развернуть" : "Свернуть"}
                    >
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${isDayTasksCollapsed ? '-rotate-90 text-slate-400' : 'text-slate-600'}`} 
                      />
                    </button>
                  </div>

                  {!isDayTasksCollapsed && (
                    <div className="space-y-2.5 mt-2.5">
                      {unTimedTasks.map(task => {
                        const isCompleted = isTaskCompletedOnDate(task, selectedDate);
                        return (
                          <div 
                            key={task.id} 
                            onClick={(e) => {
                              const isButton = (e.target as HTMLElement).closest('button');
                              if (!isButton) {
                                handleEditTaskClick(task);
                              }
                            }}
                            className={`flex items-center justify-between px-3.5 py-2 rounded-2xl transition-all border group cursor-pointer ${
                              isCompleted 
                                ? 'bg-slate-50/30 border-slate-100 border-l-4 border-l-slate-300 text-slate-400 line-through opacity-80' 
                                : `border-slate-100 border-l-4 hover:shadow-md ${getTaskBgClass(task.color || 'blue')} ${getTaskBorderLeftClass(task.color || 'blue')}`
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                              <button
                                onClick={() => handleToggleComplete(task.id)}
                                className="p-0.5 text-slate-400 hover:text-[#6D9773] transition-colors bg-transparent border-0"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={19} className="text-[#6D9773]" />
                                ) : (
                                  <Circle size={19} className="text-slate-300 hover:text-[#6D9773]/80" />
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0 leading-tight">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                {task.time && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                    <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 text-[10px] tracking-wide">
                                      <Clock size={11} className="shrink-0 text-amber-600" />
                                      <span>{task.time}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditTaskClick(task)}
                              className="p-1.5 hover:bg-[#6D9773]/10 text-slate-400 hover:text-[#6D9773] rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-150 text-red-500 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              )}

              {/* TIMELINE CONTAINER */}
              <div className={`${t.cardBg} rounded-2xl p-4 border ${t.subAccentBorderLight} shadow-sm transition-all pb-5`}>
                <div 
                  onClick={() => setIsScheduleCollapsed(prev => !prev)}
                  className={`flex items-center justify-between cursor-pointer select-none pb-1.5 border-b ${t.subAccentBorderLight10} group/sched mb-4`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`block text-[11px] font-bold ${t.accentText} uppercase tracking-wider group-hover/sched:underline decoration-2`}>Расписание:</span>
                    <span className={`text-[10px] ${t.subAccentText} ${t.subAccentBgLight} font-bold px-2 py-0.5 rounded-full border ${t.subAccentBorderLight}`}>
                      {timedTasks.length}
                    </span>
                  </div>

                  <button 
                    type="button"
                    className="p-1 hover:bg-[#6D9773]/10 rounded-lg text-slate-400 hover:text-[#6D9773] transition-colors"
                    aria-label={isScheduleCollapsed ? "Развернуть" : "Свернуть"}
                  >
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${isScheduleCollapsed ? '-rotate-90 text-slate-400' : 'text-slate-600'}`} 
                    />
                  </button>
                </div>

                {!isScheduleCollapsed && (
                  <>
                    {timedTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <p className={`${t.mutedText} text-sm font-medium`}>Нет запланированных по времени задач на этот день.</p>
                        <button
                          onClick={handleAddTaskClick}
                          className={`mt-3 text-xs ${t.subAccentText} font-bold hover:underline`}
                        >
                          + Создать первую задачу
                        </button>
                      </div>
                    ) : (
                      <div className="relative pl-6 border-l-2 border-[#6D9773]/20 ml-14 py-1 space-y-6">
                        {/* Current local time indicator dot */}
                        <div className="absolute left-[-5px] top-6 w-2.5 h-2.5 bg-[#6D9773] rounded-full ring-4 ring-[#6D9773]/10 animate-pulse"></div>

                        {timedTasks.map((task, idx) => {
                          const isCompleted = isTaskCompletedOnDate(task, selectedDate);
                          const isWork = task.scope === 'work';

                          let boxColorClasses = '';
                          if (isCompleted) {
                            boxColorClasses = 'bg-slate-50/30 border-slate-200 text-slate-400 scale-[0.99] opacity-80';
                          } else {
                            const col = task.color || (isWork ? 'dark' : 'blue');
                            boxColorClasses = `${getTaskBgClass(col)} border-black/5 hover:shadow-md`;
                          }

                          const isMultiDay = task.endDate && task.endDate !== task.date;
                          let timelineTimeLabel = task.time;
                          let timelineInnerTimeSpan = '';

                          if (isMultiDay) {
                            if (selectedDate === task.date) {
                              timelineTimeLabel = task.time;
                              timelineInnerTimeSpan = `${task.time} (начало)`;
                            } else if (selectedDate === task.endDate) {
                              timelineTimeLabel = '00:00';
                              timelineInnerTimeSpan = `До ${task.endTime || '23:59'} (окончание)`;
                            } else {
                              timelineTimeLabel = '00:00';
                              timelineInnerTimeSpan = `Весь день (продолжение)`;
                            }
                          } else {
                            const endTimeVal = task.duration ? calculateEndTime(task.time!, task.duration) : '';
                            timelineInnerTimeSpan = `${task.time}${endTimeVal ? ` — ${endTimeVal}` : ''} ${task.duration ? `(${task.duration} мин)` : ''}`;
                          }

                          return (
                            <div key={task.id} className="relative group">
                              
                              {/* Anchor marker node */}
                              <div className={`absolute left-[-31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                                isCompleted ? 'border-[#6D9773] bg-[#6D9773]/10' : 'border-[#6D9773]/40'
                              }`}>
                                {isCompleted && <div className="w-1.5 h-1.5 bg-[#6D9773] rounded-full"></div>}
                              </div>

                              {/* Time label */}
                              <span className="absolute left-[-64px] top-1 text-[11px] font-semibold text-[#0C3B2E]/90 classic-mono">
                                {timelineTimeLabel}
                              </span>

                              {/* Event Timeline Box Card */}
                              <div 
                                onClick={(e) => {
                                  const isButton = (e.target as HTMLElement).closest('button');
                                  if (!isButton) {
                                    handleEditTaskClick(task);
                                  }
                                }}
                                className={`relative rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${boxColorClasses}`}
                              >
                                {/* Inner Header metadata */}
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-[10px] font-mono tracking-widest flex items-center gap-1.5 ${isCompleted ? 'text-slate-400' : 'text-slate-650'}`}>
                                    <Clock size={11} className="shrink-0" />
                                    <span>{timelineInnerTimeSpan}</span>
                                  </span>
                                </div>

                                {/* Core description */}
                                <div className="mt-2 text-left">
                                  <h4 className={`text-sm font-semibold tracking-wide truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                  </h4>
                                  {task.notes && (
                                    <p className={`text-[11px] mt-1 leading-normal line-clamp-2 ${isCompleted ? 'text-slate-400' : 'text-slate-650'}`}>
                                      {task.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Quick overlay buttons */}
                                <div className="flex gap-2 justify-end mt-3 border-t border-white/10 pt-2.5">
                                  <button
                                    onClick={() => handleToggleComplete(task.id)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-all flex items-center gap-0.5 ${
                                      isCompleted 
                                        ? 'bg-slate-100 text-slate-600' 
                                        : 'bg-white text-[#0C3B2E] hover:bg-[#6D9773]/10'
                                    }`}
                                  >
                                    {isCompleted ? 'Продолжить' : 'Выполнено'}
                                  </button>

                                  <button
                                    onClick={() => handleEditTaskClick(task)}
                                    className="p-1 hover:bg-white/15 text-white/70 hover:text-white rounded transition-colors"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1 hover:bg-white/15 text-white/70 hover:text-red-300 rounded transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* SLIDING NOTES COMPONENT */}
              <NotesSection
                selectedDate={selectedDate}
                notes={notes}
                theme={theme}
                onAddNote={() => {
                  setEditingNote(null);
                  setIsNoteEditOpen(true);
                }}
                onEditNote={(note) => {
                  setEditingNote(note);
                  setIsNoteEditOpen(true);
                }}
                onOpenStorage={() => {
                  setIsNotesStorageOpen(true);
                }}
              />

            </div>
          )}

      {/* UNSCHEDULED (SOMEDAY) TAB */}
          {currentTab === 'someday' && (
            <SomedayTab
              somedayTasks={somedayTasks}
              somedayCategories={somedayCategories}
              groupedSomeday={groupedSomeday}
              orderedSomedayCategoryNames={orderedSomedayCategoryNames}
              collapsedSomeday={collapsedSomeday}
              onToggleCollapse={(catName) => setCollapsedSomeday(prev => ({ ...prev, [catName]: !prev[catName] }))}
              onAddTask={() => {
                setDefaultWishlistCategory(undefined);
                setDefaultSomedayCategory(undefined);
                setEditingTask(null);
                setIsTaskFormOpen(true);
              }}
              onQuickAdd={handleQuickAddSomeday}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskFormOpen(true);
              }}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              accentBg={t.accentBg}
              accentBgHover={t.accentBgHover}
            />
          )}

          {/* WISHLIST TAB */}
          {currentTab === 'wishlist' && (
            <WishlistTab
              wishlistTasks={wishlistTasks}
              wishlistCategories={wishlistCategories}
              groupedWishes={groupedWishes}
              orderedWishlistCategoryNames={orderedWishlistCategoryNames}
              collapsedWishes={collapsedWishes}
              onToggleCollapse={(catName) => setCollapsedWishes(prev => ({ ...prev, [catName]: !prev[catName] }))}
              onAddTask={() => {
                setDefaultWishlistCategory(undefined);
                setDefaultSomedayCategory(undefined);
                setEditingTask(null);
                setIsTaskFormOpen(true);
              }}
              onQuickAdd={handleQuickAddWishlist}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskFormOpen(true);
              }}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              accentBg={t.accentBg}
              accentBgHover={t.accentBgHover}
            />
          )}

          {/* GIFTS TAB */}
          {currentTab === 'gifts' && (
            <GiftsTab
              giftsTasks={giftsTasks}
              giftRecipients={giftRecipients}
              groupedGifts={groupedGifts}
              orderedGiftRecipientNames={orderedGiftRecipientNames}
              collapsedGifts={collapsedGifts}
              onToggleCollapse={(recName) => setCollapsedGifts(prev => ({ ...prev, [recName]: !prev[recName] }))}
              onAddTask={() => {
                setDefaultWishlistCategory(undefined);
                setDefaultSomedayCategory(undefined);
                setEditingTask(null);
                setIsTaskFormOpen(true);
              }}
              onQuickAdd={handleQuickAddGift}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskFormOpen(true);
              }}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              accentBg={t.accentBg}
              accentBgHover={t.accentBgHover}
            />
          )}
        </div>
      </div>  

      {/* DETAILED DIALOG MODALS */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setDefaultGiftRecipient(undefined);
          setDefaultWishlistCategory(undefined);
          setDefaultSomedayCategory(undefined);
        }}
        onSubmit={handleTaskFormSubmit}
        initialTask={editingTask}
        defaultDate={selectedDate}
        defaultIsWishlist={currentTab === 'wishlist'}
        defaultIsGift={currentTab === 'gifts'}
        defaultIsSomeday={currentTab === 'someday'}
        defaultGiftRecipient={defaultGiftRecipient}
        defaultWishlistCategory={defaultWishlistCategory}
        defaultSomedayCategory={defaultSomedayCategory}
        onZoomImage={setZoomedImage}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearAllData={handleClearAllData}
        isConfirmingClear={isConfirmingClear}
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          localStorage.setItem('task_calendar_theme', newTheme);
        }}
      />

      {/* NOTES SYSTEM MODALS */}
      <NotesStorageModal
        isOpen={isNotesStorageOpen}
        onClose={() => setIsNotesStorageOpen(false)}
        notes={notes}
        theme={theme}
        onAddNote={() => {
          setEditingNote(null);
          setIsNoteEditOpen(true);
        }}
        onEditNote={(note) => {
          setEditingNote(note);
          setIsNoteEditOpen(true);
        }}
        onDeleteNote={handleDeleteNote}
      />

      <NoteEditModal
        isOpen={isNoteEditOpen}
        onClose={() => {
          setIsNoteEditOpen(false);
          setEditingNote(null);
        }}
        note={editingNote}
        selectedDate={selectedDate}
        theme={theme}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      <DeleteRecurringTaskModal
        isOpen={deletingRecurringTask !== null}
        onClose={() => setDeletingRecurringTask(null)}
        taskTitle={deletingRecurringTask?.taskTitle || ''}
        dateStr={deletingRecurringTask?.dateStr || ''}
        theme={theme}
        onDeleteOccurrence={() => {
          if (deletingRecurringTask) {
            handleDeleteOccurrence(deletingRecurringTask.taskId, deletingRecurringTask.dateStr);
          }
        }}
        onDeleteAll={() => {
          if (deletingRecurringTask) {
            handleDeleteAllOccurrences(deletingRecurringTask.taskId);
          }
        }}
      />

      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center m-auto">
            <img 
              src={zoomedImage} 
              alt="Увеличенное изображение" 
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 sm:top-4 sm:-right-16 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Закрыть"
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
