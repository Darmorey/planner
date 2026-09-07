import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

const ROW_H = 40;
const PAD_ROWS = 2;

function parseTime(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(':').map(Number);
  return {
    hours: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 0,
    minutes: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  };
}

function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function TimeColumn({
  label,
  min,
  max,
  value,
  onChange,
  active,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  active: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<number | null>(null);
  const options = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );

  const scrollToValue = (v: number, behavior: ScrollBehavior = 'auto') => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(options.length - 1, v - min));
    el.scrollTo({ top: idx * ROW_H, behavior });
  };

  useLayoutEffect(() => {
    if (!active) return;
    scrollToValue(value);
  }, [active, value, min, options.length]);

  const readValueFromScroll = () => {
    const el = scrollerRef.current;
    if (!el) return value;
    const idx = Math.round(el.scrollTop / ROW_H);
    const clampedIdx = Math.max(0, Math.min(options.length - 1, idx));
    return options[clampedIdx];
  };

  const handleScroll = () => {
    const next = readValueFromScroll();
    if (next !== value) onChange(next);

    if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(() => {
      const snapped = readValueFromScroll();
      scrollToValue(snapped, 'smooth');
      if (snapped !== value) onChange(snapped);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    };
  }, []);

  return (
    <div className="flex-1 min-w-0">
      <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="relative h-[200px] overflow-hidden">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 z-10 h-10 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-100/70" />
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-y-contain"
        >
          <div style={{ height: ROW_H * PAD_ROWS }} aria-hidden />
          {options.map((n) => (
            <div
              key={n}
              className="flex h-10 shrink-0 snap-center snap-always items-center justify-center text-xl font-semibold text-slate-800"
            >
              {String(n).padStart(2, '0')}
            </div>
          ))}
          <div style={{ height: ROW_H * PAD_ROWS }} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function TimePickerModal({
  isOpen,
  value,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  value: string;
  onClose: () => void;
  onConfirm: (v: string) => void;
}) {
  const parsed = parseTime(value);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);

  useEffect(() => {
    if (!isOpen) return;
    const next = parseTime(value);
    setHours(next.hours);
    setMinutes(next.minutes);
  }, [isOpen, value]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-slate-100 bg-white shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-bold text-slate-800">Выбор времени</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 px-4 py-3">
          <TimeColumn
            label="Часы"
            min={0}
            max={23}
            value={hours}
            onChange={setHours}
            active={isOpen}
          />
          <TimeColumn
            label="Минуты"
            min={0}
            max={59}
            value={minutes}
            onChange={setMinutes}
            active={isOpen}
          />
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => onConfirm(formatTime(hours, minutes))}
            className="w-full rounded-xl bg-[#0C3B2E] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0a3227] active:scale-[0.98]"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

export function PillTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-200/80 active:scale-[0.98]"
      >
        {value}
      </button>
      <TimePickerModal
        isOpen={open}
        value={value}
        onClose={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </>
  );
}

export function TimePickerInput({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full rounded border border-slate-200 bg-white px-2 py-1 text-left text-xs text-slate-800 transition-colors hover:border-slate-300 focus:border-blue-900 focus:outline-none ${className}`}
      >
        {value}
      </button>
      <TimePickerModal
        isOpen={open}
        value={value}
        onClose={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </>
  );
}
