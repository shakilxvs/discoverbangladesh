'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const options = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-[92px] rounded-full bg-neutral-100 dark:bg-neutral-800" />;
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
            theme === value
              ? 'bg-river-600 text-white'
              : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
