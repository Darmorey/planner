export type TaskColorHintKey = 'blue' | 'green' | 'red' | 'purple' | 'orange';

export const TASK_COLOR_HINTS: Record<
  TaskColorHintKey,
  { letter: string; label: string; swatchClass: string }
> = {
  blue: { letter: 'О', label: 'обычные задачи', swatchClass: 'bg-[#ABC3D9]' },
  green: { letter: 'Х', label: 'хобби', swatchClass: 'bg-[#C3D9AB]' },
  red: { letter: 'В', label: 'встречи', swatchClass: 'bg-[#D9ABC3]' },
  purple: { letter: 'П', label: 'поездки', swatchClass: 'bg-[#C3ABD9]' },
  orange: { letter: 'Д', label: 'дела', swatchClass: 'bg-[#EED0AC]' },
};

/** Порядок как в форме выбора цвета */
export const TASK_COLOR_HINT_LEGEND_ORDER: TaskColorHintKey[] = [
  'blue',
  'red',
  'green',
  'purple',
  'orange',
];

export function normalizeColorForHint(color: string): TaskColorHintKey | null {
  switch (color) {
    case 'blue':
    case 'slateGray':
      return 'blue';
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

export function getTaskColorHintLegendItems() {
  return TASK_COLOR_HINT_LEGEND_ORDER.map((key) => ({
    key,
    ...TASK_COLOR_HINTS[key],
  }));
}
