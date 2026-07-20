'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { IconPicker } from './IconPicker';
import type { Category } from '@/types';

interface Props {
  category: Category | null;
  onClose: () => void;
  onSave: (input: { name: string; icon: string }) => void;
}

export function CategoryModal({ category, onClose, onSave }: Props) {
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'MapPin');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), icon });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
            {category ? 'Edit category' : 'New category'}
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
              htmlFor="category-name"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nature"
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Icon
            </label>
            <IconPicker value={icon} onChange={setIcon} />
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
              {saving ? 'Saving…' : category ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
