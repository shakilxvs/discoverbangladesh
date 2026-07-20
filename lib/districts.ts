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
import type { District } from '@/types';

const districtsRef = collection(db, 'districts');

export const BANGLADESH_DIVISIONS = [
  'Barisal',
  'Chittagong',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
] as const;

export async function getDistricts(): Promise<District[]> {
  const snap = await getDocs(query(districtsRef, orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as District);
}

export async function createDistrict(input: { name: string; division: string }): Promise<string> {
  const existing = await getDistricts();
  const ref = await addDoc(districtsRef, {
    name: input.name,
    division: input.division,
    slug: slugify(input.name),
    order: existing.length,
  });
  return ref.id;
}

export async function updateDistrict(
  id: string,
  input: { name: string; division: string }
): Promise<void> {
  await updateDoc(doc(db, 'districts', id), {
    name: input.name,
    division: input.division,
    slug: slugify(input.name),
  });
}

export async function deleteDistrict(id: string): Promise<void> {
  await deleteDoc(doc(db, 'districts', id));
}

export async function reorderDistricts(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'districts', id), { order: index });
  });
  await batch.commit();
}
