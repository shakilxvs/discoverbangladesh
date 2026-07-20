'use client';

import { cn } from '@/lib/utils';

interface PillItem {
  id: string;
  name: string;
}

export function KeywordPills({
  items,
  activeId,
  onSelect,
}: {
  items: PillItem[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(activeId === item.id ? null : item.id)}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            activeId === item.id
              ? 'border-river-600 bg-river-600 text-white'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-river-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
          )}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
