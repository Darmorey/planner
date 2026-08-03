import type { ChangeEvent } from 'react';
import { Task } from '../../types';

export type FormSubmitPayload = Omit<Task, 'id' | 'completed'> & { id?: string };

export interface NamedColorItem {
  name: string;
  color: string;
}

export const WEEKDAYS_RU = [
  { label: 'Пн', value: 1 },
  { label: 'Вт', value: 2 },
  { label: 'Ср', value: 3 },
  { label: 'Чт', value: 4 },
  { label: 'Пт', value: 5 },
  { label: 'Сб', value: 6 },
  { label: 'Вс', value: 0 }
];

export const getStyleByColor = (colName: string) => {
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

export const getSystemTimeStr = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const getSystemEndTimeStr = (startTimeStr: string) => {
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

const MONTHS_SHORT_RU = [
  'янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.',
  'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'
];

/** Formats YYYY-MM-DD as "8 авг. 2026 г." */
export const formatDatePillRu = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MONTHS_SHORT_RU[m - 1]} ${y} г.`;
};

export const handleImageUpload = (
  e: ChangeEvent<HTMLInputElement>,
  setImage: (dataUrl: string) => void
) => {
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

/** Normalize a user-entered URL; returns empty string if blank. */
export const normalizeExternalUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};
