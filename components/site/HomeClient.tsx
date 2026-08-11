'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import * as Icons from 'lucide-react';
import { MapPin, LandPlot } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { KeywordPills } from './KeywordPills';
import { SpotCard } from './SpotCard';
import { HeroSlider } from './HeroSlider';
import { BANGLADESH_DIVISIONS } from '@/lib/districts';
import { cn } from '@/lib/utils';
import type { Category, SubCategory, Spot, HeroSlide, District } from '@/types';

type BrowseMode = 'category' | 'division' | 'district';

const browseModes: { id: BrowseMode; label: string }[] = [
  { id: 'division', label: 'Division' },
  { id: 'district', label: 'District' },
  { id: 'category', label: 'Category' },
];

export function HomeClient({
  spots,
  categories,
  subCategories,
  districts,
  heroSlides,
}: {
  spots: Spot[];
  categories: Category[];
  subCategories: SubCategory[];
  districts: District[];
  heroSlides: HeroSlide[];
}) {
  const [search, setSearch] = useState('');
  const [activePill, setActivePill] = useState<string | null>(null);
  // Category stays the default browse mode — the initial homepage state
  // behaves exactly as before. Division/District are additive.
  const [browseMode, setBrowseMode] = useState<BrowseMode>('category');
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

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

  const divisionSpots = useMemo(
    () => (selectedDivision ? spots.filter((s) => s.division === selectedDivision) : []),
    [spots, selectedDivision]
  );
  const districtSpots = useMemo(
    () => (selectedDistrict ? spots.filter((s) => s.district === selectedDistrict) : []),
    [spots, selectedDistrict]
  );

  function handleBrowseModeChange(mode: BrowseMode) {
    setBrowseMode(mode);
    setSelectedDivision(null);
    setSelectedDistrict(null);
  }

  const browseSectionTitle =
    browseMode === 'division' ? 'Divisions' : browseMode === 'district' ? 'Districts' : 'Categories';

  // Once a specific Division or District is drilled into, that spot grid
  // IS the page's focus — showing the unrelated global Featured/Newest
  // sections underneath it is what was distracting visitors. Category
  // browsing doesn't have this problem because picking a category
  // navigates to its own /category/[slug] page entirely, which never
  // renders these sections either.
  const showGlobalSections = !selectedDivision && !selectedDistrict;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      {heroSlides.length > 0 ? (
        <HeroSlider slides={heroSlides} />
      ) : (
        <div className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Discover interesting places across Bangladesh
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Waterfalls, tea estates, heritage sites, hidden gems and more.
          </p>
        </div>
      )}

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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-12">
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-white">
                {browseSectionTitle}
              </h2>
              {/* Division / District / Category — Category is active by
                  default so the page's initial state is unchanged. */}
              <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
                {browseModes.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleBrowseModeChange(id)}
                    aria-pressed={browseMode === id}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                      browseMode === id
                        ? 'bg-river-600 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {browseMode === 'category' &&
              (categories.length === 0 ? (
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
                        className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        {category.imageUrl && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={category.imageUrl}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-55 dark:opacity-45 dark:group-hover:opacity-60"
                            />
                            {/* Scrim so the icon/label stay readable regardless
                                of how bright the underlying photo is — needed
                                now that the image itself is visible enough to
                                actually read as a background, not just a hint. */}
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-white/10 dark:from-neutral-900 dark:via-neutral-900/70 dark:to-neutral-900/20"
                            />
                          </>
                        )}
                        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-river-50 text-river-600 dark:bg-river-950 dark:text-river-400">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="relative font-medium text-neutral-900 dark:text-white">
                          {category.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}

            {browseMode === 'division' &&
              (!selectedDivision ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {BANGLADESH_DIVISIONS.map((division) => (
                    <button
                      key={division}
                      type="button"
                      onClick={() => setSelectedDivision(division)}
                      className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-river-50 text-river-600 dark:bg-river-950 dark:text-river-400">
                        <LandPlot className="h-5 w-5" />
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">{division}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedDivision(null)}
                    className="mb-4 text-sm font-medium text-river-600 hover:underline dark:text-river-400"
                  >
                    ← All divisions
                  </button>
                  {divisionSpots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
                      No published spots in {selectedDivision} yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {divisionSpots.map((spot) => (
                        <SpotCard key={spot.id} spot={spot} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {browseMode === 'district' &&
              (!selectedDistrict ? (
                districts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
                    No districts yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {districts.map((district) => (
                      <button
                        key={district.id}
                        type="button"
                        onClick={() => setSelectedDistrict(district.name)}
                        className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-river-50 text-river-600 dark:bg-river-950 dark:text-river-400">
                          <MapPin className="h-5 w-5" />
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {district.name}
                        </span>
                        <span className="text-xs text-neutral-400">{district.division}</span>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedDistrict(null)}
                    className="mb-4 text-sm font-medium text-river-600 hover:underline dark:text-river-400"
                  >
                    ← All districts
                  </button>
                  {districtSpots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
                      No published spots in {selectedDistrict} yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {districtSpots.map((spot) => (
                        <SpotCard key={spot.id} spot={spot} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </section>

          {showGlobalSections && featured.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 dark:text-white">
                Featured Places
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featured.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </section>
          )}

          {showGlobalSections && newest.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold text-neutral-900 dark:text-white">
                Newest Places
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {newest.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </section>
          )}

          {showGlobalSections && spots.length === 0 && categories.length > 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
              No published spots yet — add and publish some from the admin panel.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
