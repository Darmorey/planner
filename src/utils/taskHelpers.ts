import { Task } from '../types';

/**
 * Parses a date string "YYYY-MM-DD" into a local Date object (time set to midnight)
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formats a Date object as local date string "YYYY-MM-DD"
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates number of days between two date strings "YYYY-MM-DD"
 */
export function getDaysDifference(startStr: string, endStr: string): number {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a task should appear on a specific local date (YYYY-MM-DD)
 */
export function doesTaskOccurOnDate(task: Task, dateStr: string): boolean {
  if (task.isWishlist) return false;
  if (!task.date) return false; // Unscheduled tasks don't appear in calendar/timeline

  // If target date is before the start date, it doesn't occur
  if (dateStr < task.date) return false;

  // Let's check excluded dates list (if any)
  if (task.excludedDates && task.excludedDates.includes(dateStr)) {
    return false;
  }

  const pattern = task.recurrence.pattern;
  if (pattern === 'none') {
    if (task.endDate) {
      return dateStr >= task.date && dateStr <= task.endDate;
    }
    return task.date === dateStr;
  }

  const start = parseLocalDate(task.date);
  const target = parseLocalDate(dateStr);

  switch (pattern) {
    case 'daily':
      return true;

    case 'weekly': {
      // If daysOfWeek is provided, check if target day matches
      if (task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0) {
        return task.recurrence.daysOfWeek.includes(target.getDay());
      }
      // Otherwise, match the day of the week of the start date
      return start.getDay() === target.getDay();
    }

    case 'monthly': {
      // Standard monthly recurrence: match day of month
      const startDay = start.getDate();
      const targetDay = target.getDate();

      // If they match exactly, we're good
      if (startDay === targetDay) return true;

      // Special case: if start day is 29, 30, or 31, and candidate month is shorter
      const lastDayOfCandidateMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      if (startDay > lastDayOfCandidateMonth && targetDay === lastDayOfCandidateMonth) {
        return true;
      }
      return false;
    }

    case 'yearly': {
      return start.getMonth() === target.getMonth() && start.getDate() === target.getDate();
    }

    case 'custom': {
      const interval = task.recurrence.interval || 1;
      const daysDiff = getDaysDifference(task.date, dateStr);
      return daysDiff >= 0 && daysDiff % interval === 0;
    }

    default:
      return false;
  }
}

/**
 * Formats a 24-hour time "HH:MM" or similar into a pretty Russian format
 */
export function formatTimePretty(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr;
}

/**
 * Calculates end time based on start time "HH:MM" and duration (minutes)
 */
export function calculateEndTime(startTime: string, durationMin: number): string {
  const [hrs, mins] = startTime.split(':').map(Number);
  if (isNaN(hrs) || isNaN(mins)) return startTime;

  let totalMins = hrs * 60 + mins + durationMin;
  const endHrs = Math.floor(totalMins / 60) % 24;
  const endMins = totalMins % 60;

  return `${String(endHrs).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

/**
 * Compares two tasks by time for rendering on a daily timeline
 */
export function compareTasksByTime(a: Task, b: Task, dateStr?: string): number {
  if (!a.time && !b.time) return 0;
  if (!a.time) return 1; // Unscheduled time goes elements with times first
  if (!b.time) return -1;
  const timeA = (dateStr && a.endDate && a.date && a.endDate !== a.date && dateStr > a.date) ? '00:00' : a.time;
  const timeB = (dateStr && b.endDate && b.date && b.endDate !== b.date && dateStr > b.date) ? '00:00' : b.time;
  return timeA.localeCompare(timeB);
}

export function isTaskCompletedOnDate(task: Task, dateStr: string): boolean {
  if (task.recurrence && task.recurrence.pattern !== 'none') {
    return task.completedDates?.includes(dateStr) || false;
  }
  return task.completed;
}

/**
 * Analyzes scheduled tasks for a day and calculates total free time in minutes/hours.
 * Supposing active day is from 08:00 to 22:00 (14 hours) or full 24 hours.
 * Let's calculate from active schedule 08:00 to 22:00 (840 minutes) or can do 24 hours (1440 minutes).
 * Let's calculate free time between non-overlapping events during 08:00 to 22:00.
 */
export function calculateFreeTime(tasksForDay: Task[], dateStr: string): { hours: number; minutes: number } {
  // Filter and sort tasks with valid times
  const timedTasks = tasksForDay
    .filter(t => !isTaskCompletedOnDate(t, dateStr) && t.time && t.duration && t.duration > 0)
    .map(t => {
      const [sh, sm] = t.time!.split(':').map(Number);
      const startMin = sh * 60 + sm;
      return {
        start: startMin,
        end: startMin + (t.duration || 0)
      };
    })
    .sort((a, b) => a.start - b.start);

  // Supposing standard active waking hours: 07:00 to 23:00 (16 hours = 960 minutes)
  const awakeStart = 7 * 60; // 420 mins
  const awakeEnd = 23 * 60;   // 1380 mins
  let occupiedMins = 0;

  // Let's merge intervals to handle overlaps
  const mergedIntervals: Array<{ start: number; end: number }> = [];
  for (const interval of timedTasks) {
    if (mergedIntervals.length === 0) {
      mergedIntervals.push({ ...interval });
    } else {
      const last = mergedIntervals[mergedIntervals.length - 1];
      if (interval.start < last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedIntervals.push({ ...interval });
      }
    }
  }

  // Calculate free minutes in awake hours
  let currentPos = awakeStart;
  let freeMins = 0;

  for (const interval of mergedIntervals) {
    if (interval.start > currentPos) {
      const startClamp = Math.max(awakeStart, currentPos);
      const endClamp = Math.min(awakeEnd, interval.start);
      if (endClamp > startClamp) {
        freeMins += (endClamp - startClamp);
      }
    }
    currentPos = Math.max(currentPos, interval.end);
  }

  if (awakeEnd > currentPos) {
    freeMins += (awakeEnd - Math.max(awakeStart, currentPos));
  }

  // If there are more events and free time falls to 0, clamp to 0
  freeMins = Math.max(0, freeMins);

  const hours = Math.floor(freeMins / 60);
  const minutes = freeMins % 60;

  return { hours, minutes };
}
