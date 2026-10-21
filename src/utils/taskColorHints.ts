export type TaskColorHintKey = 'green' | 'red' | 'purple' | 'orange';

export const TASK_COLOR_HINTS: Record<
  TaskColorHintKey,
  { letter: string; label: string }
> = {
  green: { letter: 'Х', label: 'хобби' },
  red: { letter: 'В', label: 'встречи' },
  purple: { letter: 'П', label: 'поездки' },
  orange: { letter: 'Д', label: 'дела' },
};

export function normalizeColorForHint(color: string): TaskColorHintKey | null {
  switch (color) {
    case 'green':
    case 'mossGreen':
      return 'green';
    case 'red':
    case 'rosyBrown':
    case 'caputMortuum':
      return 'red';
    case 'purple':
    case 'spaceCadet':
      return 'purple';
    case 'orange':
    case 'beige':
    case 'tan':
    case 'coffee':
      return 'orange';
    default:
      return null;
  }
}

export function getTaskColorHint(color: string) {
  const key = normalizeColorForHint(color);
  return key ? TASK_COLOR_HINTS[key] : null;
}
