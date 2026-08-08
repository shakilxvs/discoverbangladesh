import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { HeroSlide } from '@/types';

const heroSlidesRef = collection(db, 'heroSlides');

// Admin: every slide (active or not), in display order. Relies on
// isAdmin() in firestore.rules, same pattern as getSpots() in lib/spots.ts.
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const snap = await getDocs(query(heroSlidesRef, orderBy('order')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HeroSlide);
}

// Public: only active slides. Filtered in the query itself (not sorted
// client-side out of a wider fetch) so it matches the firestore.rules
// condition on this collection — see the comment there and on
// getSpotBySlug in lib/spots.ts for why that distinction matters. Sorted
// client-side to avoid needing a composite (active + order) index.
export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  const snap = await getDocs(query(heroSlidesRef, where('active', '==', true)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as HeroSlide)
    .sort((a, b) => a.order - b.order);
}

export type HeroSlideInput = Omit<HeroSlide, 'id' | 'order' | 'createdAt'>;

export async function createHeroSlide(input: HeroSlideInput): Promise<string> {
  const existing = await getHeroSlides();
  const ref = await addDoc(heroSlidesRef, {
    ...input,
    order: existing.length,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateHeroSlide(id: string, input: HeroSlideInput): Promise<void> {
  await updateDoc(doc(db, 'heroSlides', id), { ...input });
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await deleteDoc(doc(db, 'heroSlides', id));
}

export async function reorderHeroSlides(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'heroSlides', id), { order: index });
  });
  await batch.commit();
}
