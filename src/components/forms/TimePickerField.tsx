import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const ROW_H = 44;
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

function TimeWheelColumn({
  min,
  max,
  value,
  onChange,
  active,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  active: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const options = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );

  valueRef.current = value;
  onChangeRef.current = onChange;

  const indexForValue = (v: number) =>
    Math.max(0, Math.min(options.length - 1, v - min));

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = 'auto') => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(options.length - 1, idx));
    el.scrollTo({ top: clamped * ROW_H, behavior });
  };

  const readIndexFromScroll = () => {
    const el = scrollerRef.current;
    if (!el) return indexForValue(valueRef.current);
    const raw = el.scrollTop / ROW_H;
    return Math.max(0, Math.min(options.length - 1, Math.round(raw)));
  };

  const settleScroll = (behavior: ScrollBehavior = 'smooth') => {
    const idx = readIndexFromScroll();
    scrollToIndex(idx, behavior);
    const next = options[idx];
    if (next !== valueRef.current) onChangeRef.current(next);
  };

  useLayoutEffect(() => {
    if (!active || interactingRef.current) return;
    scrollToIndex(indexForValue(value));
  }, [active, value, min, options.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      interactingRef.current = true;
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        interactingRef.current = false;
        settleScroll('smooth');
      }, 120);
    };

    const onScrollEnd = () => {
      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      interactingRef.current = false;
      settleScroll('smooth');
    };

    const onTouchEnd = () => {
      window.setTimeout(onScrollEnd, 80);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', onScrollEnd);
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('mouseup', onScrollEnd);

    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onScrollEnd);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mouseup', onScrollEnd);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    };
  }, [options, min]);

  return (
    <div className="relative h-[220px] flex-1 min-w-0 overflow-hidden">
      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: 'pan-y' }}
      >
        <div style={{ height: ROW_H * PAD_ROWS }} aria-hidden />
        {options.map((n) => (
          <div
            key={n}
            className="flex h-11 shrink-0 items-center justify-center font-medium tabular-nums text-[22px] text-slate-900"
          >
            {String(n).padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: ROW_H * PAD_ROWS }} aria-hidden />
      </div>
    </div>
  );
}

function TimePickerSheet({
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
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Закрыть"
        onClick={onClose}
      />

      <div
        className="relative bg-[#f2f2f7] animate-fade-in"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#c6c6c8]/80 bg-[#f2f2f7]/95 px-4 py-2.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="text-[17px] font-normal text-[#007aff]"
          >
            Отмена
          </button>
          <span className="text-[17px] font-semibold text-slate-900">Время</span>
          <button
            type="button"
            onClick={() => onConfirm(formatTime(hours, minutes))}
            className="text-[17px] font-semibold text-[#007aff]"
          >
            Готово
          </button>
        </div>

        <div className="relative mx-3 my-3 overflow-hidden rounded-xl bg-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[88px] bg-gradient-to-b from-white via-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-11 -translate-y-1/2 rounded-lg bg-[#767680]/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[88px] bg-gradient-to-t from-white via-white/80 to-transparent" />

          <div className="relative flex items-stretch px-2 py-1">
            <TimeWheelColumn
              min={0}
              max={23}
              value={hours}
              onChange={setHours}
              active={isOpen}
            />
            <div className="flex w-6 shrink-0 items-center justify-center pb-0.5 text-[22px] font-medium text-slate-900">
              :
            </div>
            <TimeWheelColumn
              min={0}
              max={59}
              value={minutes}
              onChange={setMinutes}
              active={isOpen}
            />
          </div>
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
      <TimePickerSheet
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
      <TimePickerSheet
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
