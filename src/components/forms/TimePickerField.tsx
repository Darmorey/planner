import React, { useEffect, useRef, useState } from 'react';

export function normalizeTimeValue(raw: string, fallback = '09:00'): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return fallback;

  const hoursRaw = digits.slice(0, 2);
  const minsRaw = digits.slice(2, 4);

  const hours = Math.min(23, Math.max(0, parseInt(hoursRaw, 10) || 0));
  const minutes =
    minsRaw.length === 0
      ? 0
      : Math.min(59, Math.max(0, parseInt(minsRaw.padEnd(2, '0'), 10) || 0));

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatWhileTyping(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function TimeManualInput({
  value,
  onChange,
  className,
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  const commit = (raw: string) => {
    const next = normalizeTimeValue(raw, value);
    setDraft(next);
    onChange(next);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder="00:00"
        value={focused ? draft : value}
        onFocus={(e) => {
          setFocused(true);
          setDraft(value);
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => {
          const next = formatWhileTyping(e.target.value);
          setDraft(next);
        }}
        onBlur={() => {
          setFocused(false);
          commit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
            inputRef.current?.blur();
          }
        }}
        className={inputClassName}
        aria-label="Время"
      />
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
  return (
    <TimeManualInput
      value={value}
      onChange={onChange}
      inputClassName="w-[4.75rem] shrink-0 rounded-full border-0 bg-slate-100 px-3 py-1.5 text-center text-sm font-medium tabular-nums text-slate-800 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-slate-300/40"
    />
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
  return (
    <TimeManualInput
      value={value}
      onChange={onChange}
      className="w-full"
      inputClassName={`w-full rounded border border-slate-200 bg-white px-2 py-1 text-left text-xs tabular-nums text-slate-800 outline-none transition-colors focus:border-blue-900 ${className}`}
    />
  );
}
