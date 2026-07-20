'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import * as Icons from 'lucide-react';
import { SearchBar } from './SearchBar';
import { KeywordPills } from './KeywordPills';
import { SpotCard } from './SpotCard';
import type { Category, SubCategory, Spot } from '@/types';

export function HomeClient({
  spots,
  categories,
  subCategories,
}: {
  spots: Spot[];
  categories: Category[];
  subCategories: SubCategory[];
}) {
  const [search, setSearch] = useState('');
  const [activePill, setActivePill] = useState<string | null>(null);

  const fuse = useMemo(
    () => new Fuse(spots, { keys: ['name', 'district', 'division', 'keywords'], threshold: 0.3 }),
    [spots]
  );

  const isFiltering = search.trim() !== '' || activePill !== null;

  const results = useMemo(() => {
    let r = search.trim() ? fuse.search(search).map((res) => res.item) : spots;
    if (activePill) r = r.filter((s) => s.subCategoryIds.includes(activePill));
    return r;
  }, [search, activePill, spots, fuse]);

  const featured = useMemo(() => spots.filter((s) => s.featured).slice(0, 8), [spots]);
  const newest = useMemo(
    () => [...spots].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8),
    [spots]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Discover interesting places across Bangladesh
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Waterfalls, tea estates, heritage sites, hidden gems and more.
        </p>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      <div className="mb-10">
        <KeywordPills items={subCategories} activeId={activePill} onSelect={setActivePill} />
      </div>

      {isFiltering ? (
        results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
            Nothing matches yet — try a different search or filter.
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {results.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 dark:text-white">
              Categories
            </h2>
            {categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
                No categories yet — run{' '}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm dark:bg-neutral-800">
                  npm run seed
                </code>
                .
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => {
                  const Icon =
                    (Icons[category.icon as keyof typeof Icons] as Icons.LucideIcon) ??
                    Icons.MapPin;
                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="group flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-river-50 text-river-600 dark:bg-river-950 dark:text-river-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {category.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {featured.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 dark:text-white">
                Featured Places
              </h2>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {featured.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </section>
          )}

          {newest.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 dark:text-white">
                Newest Places
              </h2>
              <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                {newest.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </section>
          )}

          {spots.length === 0 && categories.length > 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
              No published spots yet — add and publish some from the admin panel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
