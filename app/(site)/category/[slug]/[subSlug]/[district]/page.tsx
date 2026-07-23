import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/categories';
import { getSubCategories } from '@/lib/sub-categories';
import { getPublishedSpots } from '@/lib/spots';
import { SpotCard } from '@/components/site/SpotCard';
import { slugify } from '@/lib/utils';

// See app/(site)/page.tsx for why this is needed.
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string; subSlug: string; district: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { district } = await params;
  return { title: district.replace(/-/g, ' ') };
}

export default async function DistrictPage({ params }: { params: Params }) {
  const { slug, subSlug, district } = await params;
  const [categories, subCategories, spots] = await Promise.all([
    getCategories(),
    getSubCategories(),
    getPublishedSpots(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  const subCategory = subCategories.find((s) => s.slug === subSlug);
  if (!category || !subCategory) notFound();

  const filteredSpots = spots.filter(
    (s) =>
      s.categoryIds.includes(category.id) &&
      s.subCategoryIds.includes(subCategory.id) &&
      slugify(s.district) === district
  );

  const districtName = filteredSpots[0]?.district ?? district.replace(/-/g, ' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="mb-1 text-sm text-neutral-400">
        <Link href={`/category/${category.slug}`} className="hover:text-river-600">
          {category.name}
        </Link>{' '}
        /{' '}
        <Link href={`/category/${category.slug}/${subCategory.slug}`} className="hover:text-river-600">
          {subCategory.name}
        </Link>
      </p>
      <h1 className="mb-2 font-display text-3xl font-semibold capitalize text-neutral-900 dark:text-white">
        {districtName}
      </h1>
      <p className="mb-6 text-neutral-500 dark:text-neutral-400">{filteredSpots.length} spots</p>

      {filteredSpots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
          No published spots here yet.
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
