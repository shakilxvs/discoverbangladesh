import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Spot } from '@/types';

const spotsRef = collection(db, 'spots');

export async function getSpots(): Promise<Spot[]> {
  const snap = await getDocs(query(spotsRef, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Spot);
}

// Public site queries. Kept to a single equality filter (no composite
// index required) — everything else (featured, newest, by category, by
// district, related) is sliced/sorted client-side, consistent with the
// "client-side search is fine up to a few thousand spots" call made
// earlier for this project.
export async function getPublishedSpots(): Promise<Spot[]> {
  const snap = await getDocs(query(spotsRef, where('visibility', '==', 'published')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Spot);
}

export async function getSpotBySlug(slug: string): Promise<Spot | null> {
  const snap = await getDocs(query(spotsRef, where('slug', '==', slug)));
  const d = snap.docs[0];
  return d ? ({ id: d.id, ...d.data() } as Spot) : null;
}

// Scored client-side: shared categories weigh most, then sub-categories,
// then same district, then shared keywords.
export function getRelatedSpots(all: Spot[], spot: Spot, take = 6): Spot[] {
  const scored = all
    .filter((s) => s.id !== spot.id)
    .map((s) => {
      let score = 0;
      score += s.categoryIds.filter((id) => spot.categoryIds.includes(id)).length * 3;
      score += s.subCategoryIds.filter((id) => spot.subCategoryIds.includes(id)).length * 2;
      score += s.district === spot.district ? 2 : 0;
      score += s.keywords.filter((k) => spot.keywords.includes(k)).length;
      return { spot: s, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, take).map((s) => s.spot);
}

export async function getSpot(id: string): Promise<Spot | null> {
  const snap = await getDoc(doc(db, 'spots', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Spot) : null;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const snap = await getDocs(query(spotsRef, where('slug', '==', slug)));
  return snap.docs.some((d) => d.id !== excludeId);
}

export type SpotInput = Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>;

export async function createSpot(input: SpotInput): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(spotsRef, { ...input, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateSpot(id: string, input: SpotInput): Promise<void> {
  await updateDoc(doc(db, 'spots', id), { ...input, updatedAt: Date.now() });
}

export async function deleteSpot(id: string): Promise<void> {
  await deleteDoc(doc(db, 'spots', id));
}

// Used from the Comments admin page for the "Lock comments on a spot"
// action — a targeted single-field update rather than requiring the full
// SpotInput shape just to flip one switch.
export async function setSpotCommentsEnabled(id: string, enabled: boolean): Promise<void> {
  await updateDoc(doc(db, 'spots', id), { commentsEnabled: enabled, updatedAt: Date.now() });
}

// "Duplicate Spot" per spec — copies everything, appends a name/slug
// suffix, and resets to draft so it doesn't accidentally go live twice.
export async function duplicateSpot(id: string): Promise<string> {
  const original = await getSpot(id);
  if (!original) throw new Error('Spot not found');
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = original;

  let newSlug = `${rest.slug}-copy`;
  let n = 2;
  while (await isSlugTaken(newSlug)) {
    newSlug = `${rest.slug}-copy-${n}`;
    n++;
  }

  return createSpot({ ...rest, name: `${rest.name} (Copy)`, slug: newSlug, visibility: 'draft' });
}
