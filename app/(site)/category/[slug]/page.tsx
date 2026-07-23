import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategories } from '@/lib/categories';
import { getSubCategories, filterSubCategoriesByCategories } from '@/lib/sub-categories';
import { getPublishedSpots } from '@/lib/spots';
import { SpotCard } from '@/components/site/SpotCard';

// See app/(site)/page.tsx for why this is needed — without it this page
// is frozen at build time and never reflects data added afterward.
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  return category ? { title: category.name } : {};
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [categories, subCategories, spots] = await Promise.all([
    getCategories(),
    getSubCategories(),
    getPublishedSpots(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const relevantSubCategories = filterSubCategoriesByCategories(subCategories, [category.id]);
  const categorySpots = spots.filter((s) => s.categoryIds.includes(category.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-3xl font-semibold text-neutral-900 dark:text-white">
        {category.name}
      </h1>
      <p className="mb-6 text-neutral-500 dark:text-neutral-400">{categorySpots.length} spots</p>

      {relevantSubCategories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {relevantSubCategories.map((sc) => (
            <Link
              key={sc.id}
              href={`/category/${category.slug}/${sc.slug}`}
              className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-600 hover:border-river-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {sc.name}
            </Link>
          ))}
        </div>
      )}

      {categorySpots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500 dark:border-neutral-700">
          No published spots in this category yet.
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {categorySpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
