'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, SubCategory } from '@/types';

interface Props {
  subCategory: SubCategory | null;
  categories: Category[];
  onClose: () => void;
  onSave: (input: { name: string; categoryIds: string[] }) => void;
}

export function SubCategoryModal({ subCategory, categories, onClose, onSave }: Props) {
  const [name, setName] = useState(subCategory?.name ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(subCategory?.categoryIds ?? []);
  const [saving, setSaving] = useState(false);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), categoryIds });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
            {subCategory ? 'Edit sub-category' : 'New sub-category'}
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
              htmlFor="subcat-name"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Name
            </label>
            <input
              id="subcat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hidden Gems"
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Belongs to
            </label>
            <p className="mb-2 text-xs text-neutral-400">
              Pick every category this should appear under — it can be more than one.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border-river-600 bg-river-600 text-white'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-river-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            {categoryIds.length === 0 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Unassigned sub-categories won&apos;t show up when adding a spot until you assign
                at least one category.
              </p>
            )}
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
              {saving ? 'Saving…' : subCategory ? 'Save changes' : 'Create sub-category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
