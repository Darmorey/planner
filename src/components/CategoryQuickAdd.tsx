import React, { useEffect, useRef, useState } from 'react';

interface CategoryQuickAddProps {
  placeholder?: string;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export default function CategoryQuickAdd({
  placeholder = 'Название…',
  onSubmit,
  onCancel,
}: CategoryQuickAddProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finish = (mode: 'submit' | 'cancel') => {
    if (doneRef.current) return;
    doneRef.current = true;
    const trimmed = value.trim();
    if (mode === 'submit' && trimmed) {
      onSubmit(trimmed);
    } else {
      onCancel();
    }
  };

  return (
    <div className="animate-fade-in rounded-2xl border border-dashed border-slate-200 bg-white px-3.5 py-2 shadow-sm">
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            finish('submit');
          } else if (e.key === 'Escape') {
            e.preventDefault();
            finish('cancel');
          }
        }}
        onBlur={() => finish('submit')}
        className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none"
      />
    </div>
  );
}
