'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRatingDisplay({
  value,
  count,
  size = 'md',
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
}) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              starSize,
              n <= Math.round(value)
                ? 'fill-monsoon-400 text-monsoon-400'
                : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
            )}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-neutral-400">
          {count > 0 ? `${value.toFixed(1)} (${count})` : 'No ratings yet'}
        </span>
      )}
    </div>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              n <= (hover || value)
                ? 'fill-monsoon-400 text-monsoon-400'
                : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
            )}
          />
        </button>
      ))}
    </div>
  );
}
