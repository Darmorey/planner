import React from 'react';
import { getDotBgClass, getTextThemeClass } from '../utils/themeHelpers';
import { getTaskColorHint } from '../utils/taskColorHints';

interface TaskColorBadgeProps {
  color: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function TaskColorBadge({
  color,
  size = 'sm',
  className = '',
}: TaskColorBadgeProps) {
  const hint = getTaskColorHint(color);
  if (!hint) return null;

  const dim =
    size === 'xs'
      ? 'h-4 w-4 text-[9px]'
      : size === 'sm'
        ? 'h-5 w-5 text-[10px]'
        : 'h-6 w-6 text-xs';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none ${dim} ${getDotBgClass(color)} ${getTextThemeClass(color)} ${className}`}
      title={hint.label}
      aria-label={hint.label}
    >
      {hint.letter}
    </span>
  );
}
