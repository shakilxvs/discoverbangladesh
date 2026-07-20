'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getDistricts } from '@/lib/districts';
import { cn } from '@/lib/utils';
import type { District } from '@/types';

interface Props {
  value: string;
  onChange: (district: District) => void;
}

export function DistrictSelect({ value, onChange }: Props) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDistricts().then(setDistricts);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(
    () => districts.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())),
    [districts, search]
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-sm outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <span className={cn(value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400')}>
          {value || 'Select a district'}
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search districts…"
              className="flex-1 bg-transparent text-sm outline-none dark:text-white"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-neutral-400">No matches</p>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="text-neutral-900 dark:text-white">{d.name}</span>
                  <span className="text-xs text-neutral-400">{d.division}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
