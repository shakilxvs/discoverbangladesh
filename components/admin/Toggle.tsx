'use client';

import { cn } from '@/lib/utils';

// Shared switch used across the admin (Spot form, Hero Slide modal, ...).
// Pulled out of SpotForm.tsx / HeroSlideModal.tsx, which each had their own
// copy — kept in sync by hand, easy to drift.
//
// The thumb is a normal in-flow flex child (not position:absolute). That
// matters: an absolutely-positioned thumb with no explicit top/left has to
// fall back to the CSS "static position" algorithm, which is exactly the
// kind of implementation-defined behavior that can put the dot on the
// wrong side or let it drift past the track edge depending on the
// engine/parent layout — which is what was happening here. Keeping the
// thumb in normal flow means it starts at a known position (flex-start,
// vertically centered by the track's own padding) and `translate-x-*` only
// ever moves it visually, off the underlying layout — it can't overflow
// because the padding on the track already reserves exactly the travel
// distance the thumb needs (p-0.5 on both sides, w-9 track, w-4 thumb →
// 16px of room to travel, exactly translate-x-4).
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
          checked ? 'bg-river-600' : 'bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
    </label>
  );
}
