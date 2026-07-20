'use client';

import { useState } from 'react';
import { Plus, Trash2, ImageOff } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300 dark:bg-neutral-800">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }
  return (
    // Arbitrary external URLs typed live as the admin fills the form —
    // next/image needs known-good remote sources at optimize time, so a
    // plain <img> with onError handling is the more robust fit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="h-12 w-12 shrink-0 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
    />
  );
}

export function GalleryImagesInput({ value, onChange }: Props) {
  function updateAt(i: number, url: string) {
    const next = [...value];
    next[i] = url;
    onChange(next);
  }
  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {value.map((url, i) => (
        <div key={i} className="flex items-center gap-2">
          <Thumb src={url} />
          <input
            value={url}
            onChange={(e) => updateAt(i, e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label="Remove image"
            className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-river-400 hover:text-river-600 dark:border-neutral-700 dark:text-neutral-400"
      >
        <Plus className="h-3.5 w-3.5" />
        Add image URL
      </button>
    </div>
  );
}
