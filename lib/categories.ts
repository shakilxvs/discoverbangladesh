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
import type { Category } from '@/types';

const categoriesRef = collection(db, 'categories');

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(categoriesRef, orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function createCategory(input: { name: string; icon: string }): Promise<string> {
  const existing = await getCategories();
  const ref = await addDoc(categoriesRef, {
    name: input.name,
    slug: slugify(input.name),
    icon: input.icon,
    order: existing.length,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateCategory(
  id: string,
  input: { name: string; icon: string }
): Promise<void> {
  await updateDoc(doc(db, 'categories', id), {
    name: input.name,
    slug: slugify(input.name),
    icon: input.icon,
  });
}

// Deleting a category shouldn't leave dangling categoryIds behind on
// sub-categories that referenced it — this detaches those references
// first (the sub-category itself stays, just loses that one relationship),
// then deletes the category.
export async function deleteCategory(id: string): Promise<void> {
  const { getSubCategories, updateSubCategoryCategories } = await import('./sub-categories');
  const subCategories = await getSubCategories();
  const affected = subCategories.filter((sc) => sc.categoryIds.includes(id));
  await Promise.all(
    affected.map((sc) =>
      updateSubCategoryCategories(
        sc.id,
        sc.categoryIds.filter((cId) => cId !== id)
      )
    )
  );
  await deleteDoc(doc(db, 'categories', id));
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'categories', id), { order: index });
  });
  await batch.commit();
}
