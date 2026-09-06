import { HabitPeriod } from '../types';
import { formatLocalDate, parseLocalDate } from './taskHelpers';

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_RU_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Monday–Sunday week containing the given date. */
export function getWeekDatesContaining(dateStr: string): string[] {
  const date = parseLocalDate(dateStr);
  const dayOfWeek = date.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(date.getTime());
    tempDate.setDate(date.getDate() + diffToMonday + i);
    week.push(formatLocalDate(tempDate));
  }
  return week;
}

export function getPeriodKey(period: HabitPeriod, dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const y = d.getFullYear();
  if (period === 'year') return String(y);
  if (period === 'month') {
    return `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const weekDates = getWeekDatesContaining(dateStr);
  return `week-${weekDates[0]}`;
}

export function formatPeriodLabel(period: HabitPeriod, periodKey: string): string {
  if (period === 'year') return periodKey;
  if (period === 'month') {
    const [y, m] = periodKey.split('-');
    const monthIdx = parseInt(m, 10) - 1;
    return `${MONTHS_RU[monthIdx] || m} ${y}`;
  }
  if (periodKey.startsWith('week-')) {
    const mondayStr = periodKey.slice(5);
    const monday = parseLocalDate(mondayStr);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const sameMonth = monday.getMonth() === sunday.getMonth();
    if (sameMonth) {
      return `${monday.getDate()}–${sunday.getDate()} ${MONTHS_RU_GENITIVE[monday.getMonth()]}`;
    }
    return `${monday.getDate()} ${MONTHS_RU_GENITIVE[monday.getMonth()].slice(0, 3)} – ${sunday.getDate()} ${MONTHS_RU_GENITIVE[sunday.getMonth()].slice(0, 3)}`;
  }
  return periodKey;
}

export function getPeriodKindLabel(period: HabitPeriod): string {
  switch (period) {
    case 'week': return 'каждую неделю';
    case 'month': return 'каждый месяц';
    case 'year': return 'каждый год';
  }
}

export function getWeekdayShortLabels(): string[] {
  return WEEKDAY_SHORT;
}
