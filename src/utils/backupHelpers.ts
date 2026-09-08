import { formatLocalDate } from './taskHelpers';

export const BACKUP_VERSION = 1;

export const PLANNER_STORAGE_KEYS = [
  'planner_tasks',
  'planner_notes',
  'planner_habits',
  'planner_day_task_order',
  'task_calendar_theme',
  'someday_categories_custom',
  'wishlist_categories_custom',
  'gift_recipients_custom',
] as const;

export type PlannerStorageKey = (typeof PLANNER_STORAGE_KEYS)[number];

export interface PlannerBackup {
  backupVersion: number;
  exportedAt: string;
  app: 'planner';
  data: Partial<Record<PlannerStorageKey, unknown>>;
}

export interface PlannerBackupStats {
  tasks: number;
  notes: number;
  habits: number;
}

function safeParseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function countArray(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export function collectPlannerBackup(): PlannerBackup {
  const data: Partial<Record<PlannerStorageKey, unknown>> = {};

  for (const key of PLANNER_STORAGE_KEYS) {
    const parsed = safeParseJson(localStorage.getItem(key));
    if (parsed !== null) {
      data[key] = parsed;
    }
  }

  return {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'planner',
    data,
  };
}

export function getBackupStats(backup: PlannerBackup): PlannerBackupStats {
  return {
    tasks: countArray(backup.data.planner_tasks),
    notes: countArray(backup.data.planner_notes),
    habits: countArray(backup.data.planner_habits),
  };
}

export function downloadPlannerBackup(): void {
  const backup = collectPlannerBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = formatLocalDate(new Date());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `planner-backup-${date}.json`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function parsePlannerBackup(raw: string): PlannerBackup | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;

  if (obj.app !== 'planner') return null;
  if (typeof obj.backupVersion !== 'number' || obj.backupVersion > BACKUP_VERSION) return null;
  if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) return null;

  return {
    backupVersion: obj.backupVersion,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    app: 'planner',
    data: obj.data as PlannerBackup['data'],
  };
}

export function applyPlannerBackup(backup: PlannerBackup): void {
  for (const key of PLANNER_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  for (const key of PLANNER_STORAGE_KEYS) {
    const value = backup.data[key];
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
