import { getPublishedSpots } from '@/lib/spots';
import { getCategories } from '@/lib/categories';
import { getSubCategories } from '@/lib/sub-categories';
import { HomeClient } from '@/components/site/HomeClient';

export default async function HomePage() {
  const [spots, categories, subCategories] = await Promise.all([
    getPublishedSpots(),
    getCategories(),
    getSubCategories(),
  ]);

  return <HomeClient spots={spots} categories={categories} subCategories={subCategories} />;
}
