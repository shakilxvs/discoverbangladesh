import { getPublishedSpots } from '@/lib/spots';
import { getCategories } from '@/lib/categories';
import { getSubCategories } from '@/lib/sub-categories';
import { HomeClient } from '@/components/site/HomeClient';

// Without this, Next.js statically generates this page once at build time
// on Vercel — which happens before any data has been seeded — and then
// keeps serving that frozen snapshot to every visitor forever, regardless
// of what's actually in Firestore. This forces a fresh fetch on every
// request instead.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [spots, categories, subCategories] = await Promise.all([
    getPublishedSpots(),
    getCategories(),
    getSubCategories(),
  ]);

  return <HomeClient spots={spots} categories={categories} subCategories={subCategories} />;
}
