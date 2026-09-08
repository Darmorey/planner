import { Habit, HabitPeriod } from '../types';
import {
  formatLocalDate,
  parseLocalDate,
} from './taskHelpers';
import {
  formatPeriodLabel,
  getPeriodKey,
  getWeekDatesContaining,
  getWeekdayShortLabels,
} from './habitHelpers';

export type StatsRange = 'week' | 'month' | 'year';

export interface HabitStatsSummary {
  percent: number;
  completed: number;
  total: number;
  unitLabel: string;
}

export interface DailyCalendarDay {
  dateStr: string | null;
  dayNum: number | null;
  status: 'done' | 'missed' | 'future' | 'before' | 'padding';
}

export interface DailyWeekDay {
  dateStr: string;
  dayLabel: string;
  done: boolean;
  isFuture: boolean;
  inRange: boolean;
}

export interface MonthlyBar {
  monthIndex: number;
  label: string;
  percent: number;
  completed: number;
  total: number;
}

export interface PeriodicPeriodRow {
  periodKey: string;
  label: string;
  done: boolean;
  preview?: string;
}

export interface HabitStreaks {
  current: number;
  best: number;
}

const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function habitCreatedDateStr(habit: Habit): string {
  return formatLocalDate(new Date(habit.createdAt));
}

function todayStr(): string {
  return formatLocalDate(new Date());
}

function isPeriodicDone(habit: Habit, periodKey: string): boolean {
  const entry = habit.entries?.find(e => e.periodKey === periodKey);
  return !!entry?.text.trim();
}

function getPeriodicPreview(habit: Habit, periodKey: string): string | undefined {
  const text = habit.entries?.find(e => e.periodKey === periodKey)?.text.trim();
  if (!text) return undefined;
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

function countEligibleDailyDays(
  habit: Habit,
  startStr: string,
  endStr: string,
  nowStr: string,
): { completed: number; total: number } {
  const created = habitCreatedDateStr(habit);
  const effectiveStart = startStr > created ? startStr : created;
  const effectiveEnd = endStr < nowStr ? endStr : nowStr;
  if (effectiveStart > effectiveEnd) return { completed: 0, total: 0 };

  const completedSet = new Set(habit.completedDates || []);
  let total = 0;
  let completed = 0;
  const cursor = parseLocalDate(effectiveStart);
  const end = parseLocalDate(effectiveEnd);

  while (cursor <= end) {
    const d = formatLocalDate(cursor);
    total += 1;
    if (completedSet.has(d)) completed += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return { completed, total };
}

function buildSummary(completed: number, total: number, unitLabel: string): HabitStatsSummary {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { percent, completed, total, unitLabel };
}

export function shiftStatsAnchor(dateStr: string, range: StatsRange, delta: -1 | 1): string {
  const d = parseLocalDate(dateStr);
  if (range === 'week') {
    d.setDate(d.getDate() + delta * 7);
  } else if (range === 'month') {
    d.setMonth(d.getMonth() + delta);
  } else {
    d.setFullYear(d.getFullYear() + delta);
  }
  return formatLocalDate(d);
}

export function formatStatsRangeLabel(range: StatsRange, anchorDate: string): string {
  const d = parseLocalDate(anchorDate);
  if (range === 'year') return String(d.getFullYear());
  if (range === 'month') {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  const week = getWeekDatesContaining(anchorDate);
  const monday = parseLocalDate(week[0]);
  const sunday = parseLocalDate(week[6]);
  const monthsGen = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${monthsGen[monday.getMonth()]} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${monthsGen[monday.getMonth()]} – ${sunday.getDate()} ${monthsGen[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

export function getDailyHabitStats(
  habit: Habit,
  range: StatsRange,
  anchorDate: string,
): HabitStatsSummary {
  const now = todayStr();
  if (range === 'week') {
    const week = getWeekDatesContaining(anchorDate);
    const { completed, total } = countEligibleDailyDays(habit, week[0], week[6], now);
    return buildSummary(completed, total, total === 1 ? 'день' : total < 5 ? 'дня' : 'дней');
  }
  if (range === 'month') {
    const d = parseLocalDate(anchorDate);
    const start = formatLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
    const end = formatLocalDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const { completed, total } = countEligibleDailyDays(habit, start, end, now);
    return buildSummary(completed, total, total === 1 ? 'день' : total < 5 ? 'дня' : 'дней');
  }
  const year = parseLocalDate(anchorDate).getFullYear();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const { completed, total } = countEligibleDailyDays(habit, start, end, now);
  return buildSummary(completed, total, total === 1 ? 'день' : total < 5 ? 'дня' : 'дней');
}

export function getDailyWeekVisualization(habit: Habit, anchorDate: string): DailyWeekDay[] {
  const now = todayStr();
  const created = habitCreatedDateStr(habit);
  const completed = new Set(habit.completedDates || []);
  const labels = getWeekdayShortLabels();
  return getWeekDatesContaining(anchorDate).map((dateStr, i) => ({
    dateStr,
    dayLabel: labels[i],
    done: completed.has(dateStr),
    isFuture: dateStr > now,
    inRange: dateStr >= created,
  }));
}

export function getDailyMonthCalendar(habit: Habit, anchorDate: string): DailyCalendarDay[] {
  const now = todayStr();
  const created = habitCreatedDateStr(habit);
  const completed = new Set(habit.completedDates || []);
  const d = parseLocalDate(anchorDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const dayOfWeek = first.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() + diffToMonday);

  const cells: DailyCalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(gridStart);
    cell.setDate(gridStart.getDate() + i);
    if (cell.getMonth() !== month && i >= 7 && cell > last) break;
    if (cell.getMonth() !== month) {
      cells.push({ dateStr: null, dayNum: null, status: 'padding' });
      continue;
    }
    const dateStr = formatLocalDate(cell);
    let status: DailyCalendarDay['status'];
    if (dateStr < created) status = 'before';
    else if (dateStr > now) status = 'future';
    else if (completed.has(dateStr)) status = 'done';
    else status = 'missed';
    cells.push({ dateStr, dayNum: cell.getDate(), status });
  }
  return cells;
}

export function getDailyYearBars(habit: Habit, anchorDate: string): MonthlyBar[] {
  const year = parseLocalDate(anchorDate).getFullYear();
  const now = todayStr();
  return MONTHS_SHORT.map((label, monthIndex) => {
    const start = formatLocalDate(new Date(year, monthIndex, 1));
    const end = formatLocalDate(new Date(year, monthIndex + 1, 0));
    const { completed, total } = countEligibleDailyDays(habit, start, end, now);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { monthIndex, label, percent, completed, total };
  });
}

function getWeekPeriodKeysInMonth(year: number, monthIndex: number): string[] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const keys = new Set<string>();
  const cursor = new Date(first);
  while (cursor <= last) {
    keys.add(getPeriodKey('week', formatLocalDate(cursor)));
    cursor.setDate(cursor.getDate() + 1);
  }
  return Array.from(keys).sort();
}

function getMonthPeriodKeysInYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    getPeriodKey('month', formatLocalDate(new Date(year, i, 15)))
  );
}

function getWeekPeriodKeysInYear(year: number): string[] {
  const keys = new Set<string>();
  const cursor = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  while (cursor <= end) {
    keys.add(getPeriodKey('week', formatLocalDate(cursor)));
    cursor.setDate(cursor.getDate() + 7);
  }
  return Array.from(keys).sort();
}

function buildPeriodicRows(habit: Habit, periodKeys: string[], period: HabitPeriod): PeriodicPeriodRow[] {
  return periodKeys.map(periodKey => ({
    periodKey,
    label: formatPeriodLabel(period, periodKey),
    done: isPeriodicDone(habit, periodKey),
    preview: getPeriodicPreview(habit, periodKey),
  }));
}

export function getPeriodicHabitStats(
  habit: Habit,
  range: StatsRange,
  anchorDate: string,
): HabitStatsSummary {
  const rows = getPeriodicVisualization(habit, range, anchorDate);
  const completed = rows.filter(r => r.done).length;
  const total = rows.length;
  const unit = total === 1 ? 'период' : total < 5 ? 'периода' : 'периодов';
  return buildSummary(completed, total, unit);
}

export function getPeriodicVisualization(
  habit: Habit,
  range: StatsRange,
  anchorDate: string,
): PeriodicPeriodRow[] {
  const period = habit.period || 'month';
  const d = parseLocalDate(anchorDate);

  if (range === 'week') {
    if (period === 'week') {
      const key = getPeriodKey('week', anchorDate);
      return buildPeriodicRows(habit, [key], period);
    }
    if (period === 'month') {
      const key = getPeriodKey('month', anchorDate);
      return buildPeriodicRows(habit, [key], period);
    }
    const key = getPeriodKey('year', anchorDate);
    return buildPeriodicRows(habit, [key], period);
  }

  if (range === 'month') {
    if (period === 'week') {
      const keys = getWeekPeriodKeysInMonth(d.getFullYear(), d.getMonth());
      return buildPeriodicRows(habit, keys, period);
    }
    if (period === 'month') {
      const key = getPeriodKey('month', anchorDate);
      return buildPeriodicRows(habit, [key], period);
    }
    const key = getPeriodKey('year', anchorDate);
    return buildPeriodicRows(habit, [key], period);
  }

  if (period === 'week') {
    return buildPeriodicRows(habit, getWeekPeriodKeysInYear(d.getFullYear()), period);
  }
  if (period === 'month') {
    return buildPeriodicRows(habit, getMonthPeriodKeysInYear(d.getFullYear()), period);
  }
  const key = getPeriodKey('year', anchorDate);
  return buildPeriodicRows(habit, [key], period);
}

export function getDailyStreaks(habit: Habit): HabitStreaks {
  const completed = new Set(habit.completedDates || []);
  const created = habitCreatedDateStr(habit);
  const now = todayStr();
  if (completed.size === 0) return { current: 0, best: 0 };

  let best = 0;
  let streak = 0;
  const cursor = parseLocalDate(created);
  const end = parseLocalDate(now);

  while (cursor <= end) {
    const d = formatLocalDate(cursor);
    if (completed.has(d)) {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  let current = 0;
  const back = parseLocalDate(now);
  while (back >= parseLocalDate(created)) {
    const d = formatLocalDate(back);
    if (completed.has(d)) {
      current += 1;
      back.setDate(back.getDate() - 1);
    } else if (d === now) {
      back.setDate(back.getDate() - 1);
    } else {
      break;
    }
  }

  return { current, best };
}

export const STATS_RANGE_OPTIONS: { value: StatsRange; label: string }[] = [
  { value: 'week', label: 'За неделю' },
  { value: 'month', label: 'За месяц' },
  { value: 'year', label: 'За год' },
];
