'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { BANGLADESH_DIVISIONS } from '@/lib/districts';
import type { District } from '@/types';

interface Props {
  district: District | null;
  onClose: () => void;
  onSave: (input: { name: string; division: string }) => void;
}

export function DistrictModal({ district, onClose, onSave }: Props) {
  const [name, setName] = useState(district?.name ?? '');
  const [division, setDivision] = useState(district?.division ?? BANGLADESH_DIVISIONS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), division });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
            {district ? 'Edit district' : 'New district'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="district-name"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="district-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sylhet"
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900"
            />
          </div>

          <div>
            <label
              htmlFor="district-division"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Division
            </label>
            <select
              id="district-division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              {BANGLADESH_DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : district ? 'Save changes' : 'Create district'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
