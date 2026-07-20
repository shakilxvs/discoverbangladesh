'use client';

import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search places, districts, categories…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <Search className="h-4 w-4 shrink-0 text-neutral-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-white"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="shrink-0 text-neutral-300 hover:text-neutral-500"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
