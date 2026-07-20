'use client';

import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { curatedIconNames } from '@/lib/icons';

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 rounded-xl border border-neutral-200 p-2 dark:border-neutral-700">
      {curatedIconNames.map((name) => {
        const Icon = Icons[name as keyof typeof Icons] as Icons.LucideIcon;
        const active = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={name}
            aria-pressed={active}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              active
                ? 'bg-river-600 text-white'
                : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
