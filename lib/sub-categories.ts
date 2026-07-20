import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { slugify } from './utils';
import type { SubCategory } from '@/types';

const subCategoriesRef = collection(db, 'subCategories');

export async function getSubCategories(): Promise<SubCategory[]> {
  const snap = await getDocs(query(subCategoriesRef, orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubCategory);
}

export async function createSubCategory(input: {
  name: string;
  categoryIds: string[];
}): Promise<string> {
  const existing = await getSubCategories();
  const ref = await addDoc(subCategoriesRef, {
    name: input.name,
    slug: slugify(input.name),
    categoryIds: input.categoryIds,
    order: existing.length,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateSubCategory(
  id: string,
  input: { name: string; categoryIds: string[] }
): Promise<void> {
  await updateDoc(doc(db, 'subCategories', id), {
    name: input.name,
    slug: slugify(input.name),
    categoryIds: input.categoryIds,
  });
}

// Used internally by categories.ts when a category is deleted, to detach
// just the categoryIds reference without touching name/order.
export async function updateSubCategoryCategories(
  id: string,
  categoryIds: string[]
): Promise<void> {
  await updateDoc(doc(db, 'subCategories', id), { categoryIds });
}

export async function deleteSubCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'subCategories', id));
}

export async function reorderSubCategories(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'subCategories', id), { order: index });
  });
  await batch.commit();
}

// Core of the Spot form's cascading logic: given the categories currently
// selected on a spot, return the union of sub-categories that belong to
// ANY of them. Selecting no categories yields no sub-categories; selecting
// multiple categories combines their sub-category lists rather than
// intersecting them, per spec.
export function filterSubCategoriesByCategories(
  subCategories: SubCategory[],
  selectedCategoryIds: string[]
): SubCategory[] {
  if (selectedCategoryIds.length === 0) return [];
  return subCategories.filter((sc) =>
    sc.categoryIds.some((cId) => selectedCategoryIds.includes(cId))
  );
}
