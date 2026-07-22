import { collection, doc, setDoc, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { slugify } from './utils';
import { seedCategories, subCategoryNames, categorySubCategoryMap, seedDistricts } from '@/data/seed-data';
import { seedSpots } from '@/data/seed-spots';

export type SeedProgress = (message: string) => void;

export async function seedTaxonomyAndDistricts(
  onProgress: SeedProgress
): Promise<{ categories: number; subCategories: number; districts: number; skipped: boolean }> {
  const categoriesRef = collection(db, 'categories');
  const existing = await getDocs(query(categoriesRef, limit(1)));
  if (!existing.empty) {
    onProgress('Categories already exist — taxonomy and districts were left as-is.');
    return { categories: 0, subCategories: 0, districts: 0, skipped: true };
  }

  onProgress(`Seeding ${seedCategories.length} categories…`);
  const categoryIdByName: Record<string, string> = {};
  for (let i = 0; i < seedCategories.length; i++) {
    const cat = seedCategories[i];
    const ref = doc(categoriesRef);
    await setDoc(ref, {
      name: cat.name,
      slug: slugify(cat.name),
      icon: cat.icon,
      order: i,
      createdAt: Date.now(),
    });
    categoryIdByName[cat.name] = ref.id;
  }

  onProgress(`Seeding ${subCategoryNames.length} sub-categories…`);
  for (let i = 0; i < subCategoryNames.length; i++) {
    const subName = subCategoryNames[i];
    const parentNames = Object.entries(categorySubCategoryMap)
      .filter(([, subs]) => subs.includes(subName))
      .map(([catName]) => catName);
    const categoryIds = parentNames.map((n) => categoryIdByName[n]).filter(Boolean);
    const ref = doc(collection(db, 'subCategories'));
    await setDoc(ref, {
      name: subName,
      slug: slugify(subName),
      categoryIds,
      order: i,
      createdAt: Date.now(),
    });
  }

  onProgress(`Seeding ${seedDistricts.length} districts…`);
  for (let i = 0; i < seedDistricts.length; i++) {
    const d = seedDistricts[i];
    const ref = doc(collection(db, 'districts'));
    await setDoc(ref, { name: d.name, division: d.division, slug: slugify(d.name), order: i });
  }

  return {
    categories: seedCategories.length,
    subCategories: subCategoryNames.length,
    districts: seedDistricts.length,
    skipped: false,
  };
}

export async function seedDefaultSpots(
  onProgress: SeedProgress
): Promise<{ created: number; skipped: number; errors: string[] }> {
  const [categoriesSnap, subCategoriesSnap, spotsSnap] = await Promise.all([
    getDocs(collection(db, 'categories')),
    getDocs(collection(db, 'subCategories')),
    getDocs(collection(db, 'spots')),
  ]);

  const categoryIdByName = new Map(categoriesSnap.docs.map((d) => [d.data().name as string, d.id]));
  const subCategoryIdByName = new Map(subCategoriesSnap.docs.map((d) => [d.data().name as string, d.id]));
  const existingSlugs = new Set(spotsSnap.docs.map((d) => d.data().slug as string));

  if (categoryIdByName.size === 0) {
    onProgress('No categories found — seed categories, sub-categories & districts first.');
    return { created: 0, skipped: 0, errors: ['Taxonomy not seeded yet'] };
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Sequential rather than parallel: keeps write volume gentle and makes
  // "existingSlugs" reliable if this is ever re-run mid-way through a
  // future larger batch, and lets onProgress show real live status.
  for (const spot of seedSpots) {
    const slug = slugify(spot.name);
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const categoryIds = spot.categories
      .map((n) => categoryIdByName.get(n))
      .filter((v): v is string => Boolean(v));
    const subCategoryIds = spot.subCategories
      .map((n) => subCategoryIdByName.get(n))
      .filter((v): v is string => Boolean(v));

    if (categoryIds.length === 0) {
      errors.push(`${spot.name}: no matching category found (check category names match exactly)`);
      continue;
    }

    onProgress(`Adding ${spot.name}…`);
    const now = Date.now();
    try {
      await addDoc(collection(db, 'spots'), {
        name: spot.name,
        slug,
        division: spot.division,
        district: spot.district,
        description: spot.description,
        locationUrl: '',
        featuredImage: '',
        galleryImages: [],
        categoryIds,
        subCategoryIds,
        keywords: spot.keywords,
        status: 'open',
        visibility: 'published',
        featured: false,
        commentsEnabled: true,
        verified: false,
        createdAt: now,
        updatedAt: now,
      });
      existingSlugs.add(slug);
      created++;
    } catch (err) {
      errors.push(`${spot.name}: ${(err as Error).message}`);
    }
  }

  return { created, skipped, errors };
}
