'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategories } from '@/lib/categories';
import { getSubCategories, filterSubCategoriesByCategories } from '@/lib/sub-categories';
import type { Category, SubCategory } from '@/types';

interface Props {
  selectedCategoryIds: string[];
  selectedSubCategoryIds: string[];
  onChange: (next: { categoryIds: string[]; subCategoryIds: string[] }) => void;
}

// Spot Assignment logic, as specified: admin picks Categories first, the
// Sub-Category list then shows only sub-categories belonging to ANY of the
// selected categories (a union, not an intersection), and it updates live
// whenever the Category selection changes — including pruning any
// previously-selected sub-category that's no longer valid.
export function CategorySubCategoryPicker({
  selectedCategoryIds,
  selectedSubCategoryIds,
  onChange,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getSubCategories()]).then(([cats, subs]) => {
      setCategories(cats);
      setSubCategories(subs);
      setLoading(false);
    });
  }, []);

  const availableSubCategories = useMemo(
    () => filterSubCategoriesByCategories(subCategories, selectedCategoryIds),
    [subCategories, selectedCategoryIds]
  );

  function toggleCategory(id: string) {
    const nextCategoryIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];

    const stillValidIds = new Set(
      filterSubCategoriesByCategories(subCategories, nextCategoryIds).map((s) => s.id)
    );
    const nextSubCategoryIds = selectedSubCategoryIds.filter((sId) => stillValidIds.has(sId));

    onChange({ categoryIds: nextCategoryIds, subCategoryIds: nextSubCategoryIds });
  }

  function toggleSubCategory(id: string) {
    const next = selectedSubCategoryIds.includes(id)
      ? selectedSubCategoryIds.filter((s) => s !== id)
      : [...selectedSubCategoryIds, id];
    onChange({ categoryIds: selectedCategoryIds, subCategoryIds: next });
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon =
              (Icons[category.icon as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.MapPin;
            const active = selectedCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-river-600 bg-river-600 text-white'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-river-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Sub-Categories
        </label>
        {selectedCategoryIds.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-400 dark:border-neutral-700">
            Select a category above to see its sub-categories.
          </p>
        ) : availableSubCategories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-sm text-neutral-400 dark:border-neutral-700">
            No sub-categories are assigned to the selected categories yet — add some from Admin →
            Sub-Categories.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSubCategories.map((sub) => {
              const active = selectedSubCategoryIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubCategory(sub.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-monsoon-600 bg-monsoon-50 text-monsoon-700 dark:border-monsoon-500 dark:bg-monsoon-950 dark:text-monsoon-300'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-monsoon-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
