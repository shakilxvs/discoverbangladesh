'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function KeywordsInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState('');

  function commit() {
    const clean = draft.trim().toLowerCase();
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
    }
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-2 py-2 focus-within:border-river-500 focus-within:ring-2 focus-within:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:ring-river-900">
      {value.map((kw) => (
        <span
          key={kw}
          className="flex items-center gap-1 rounded-full bg-river-50 px-2.5 py-1 text-xs font-medium text-river-700 dark:bg-river-950 dark:text-river-300"
        >
          {kw}
          <button
            type="button"
            onClick={() => onChange(value.filter((k) => k !== kw))}
            aria-label={`Remove ${kw}`}
            className="text-river-400 hover:text-river-700 dark:hover:text-river-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? 'Type a keyword, press Enter…' : ''}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
      />
    </div>
  );
}
