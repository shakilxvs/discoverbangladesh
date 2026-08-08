import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { stripUndefined } from './utils';
import type { Comment } from '@/types';

const commentsRef = collection(db, 'comments');

// Public spot-page lookup. Like getSpotBySlug in lib/spots.ts and
// getActiveHeroSlides in lib/hero-slides.ts, this MUST filter in the query
// itself on every field the security rule checks — firestore.rules only
// grants read on /comments when `resource.data.hidden != true` (or admin).
// Filtering on spotId alone isn't provable safe from the query, so
// Firestore rejected the whole list request with a permission error on
// every public visit — that's what was surfacing as "This page couldn't
// load" on every /spot/[slug] page (the spot page loads comments via
// Promise.all, so this exception took the whole page down with it).
// Matching the query to the rule fixes it; sorting stays client-side so
// this doesn't need a composite (spotId + hidden) index.
export async function getCommentsForSpot(spotId: string): Promise<Comment[]> {
  const snap = await getDocs(
    query(commentsRef, where('spotId', '==', spotId), where('hidden', '==', false))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Comment)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function summarizeRating(comments: Comment[]): { average: number; count: number } {
  const visible = comments.filter((c) => !c.hidden);
  if (visible.length === 0) return { average: 0, count: 0 };
  const sum = visible.reduce((acc, c) => acc + c.rating, 0);
  return { average: sum / visible.length, count: visible.length };
}

export interface NewComment {
  spotId: string;
  authorName: string;
  rating: number;
  text?: string;
}

// Public write — "automatically approved, no moderation queue" per spec.
// hidden is always set explicitly so later hidden-filtering never has to
// treat a missing field as ambiguous.
export async function createComment(input: NewComment): Promise<void> {
  await addDoc(
    commentsRef,
    stripUndefined({
      spotId: input.spotId,
      authorName: input.authorName.trim(),
      rating: input.rating,
      text: input.text?.trim() || undefined,
      hidden: false,
      createdAt: Date.now(),
    })
  );
}

export async function getAllComments(): Promise<Comment[]> {
  const snap = await getDocs(commentsRef);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Comment)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function setCommentHidden(id: string, hidden: boolean): Promise<void> {
  await updateDoc(doc(db, 'comments', id), { hidden });
}

export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'comments', id));
}
