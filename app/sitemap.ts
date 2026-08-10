import type { MetadataRoute } from 'next';
import { getPublishedSpots } from '@/lib/spots';
import { getCategories } from '@/lib/categories';

// Generated per-request (this route isn't statically cached at build time
// any more than the pages it mirrors are — see the `dynamic =
// 'force-dynamic'` comment in app/(site)/page.tsx). A newly published spot
// or a newly created category shows up here automatically; a spot that's
// unpublished or deleted drops out automatically too. No manual editing,
// no stale static sitemap.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverbangladesh.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spots, categories] = await Promise.all([getPublishedSpots(), getCategories()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Only published spots reach getPublishedSpots() — drafts/hidden spots
  // (and /admin/* entirely) are never eligible to appear here.
  const spotEntries: MetadataRoute.Sitemap = spots.map((s) => ({
    url: `${SITE_URL}/spot/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...spotEntries];
}
