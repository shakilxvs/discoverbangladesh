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
import type { Comment } from '@/types';

const commentsRef = collection(db, 'comments');

// Single equality filter — sorting and hidden-filtering happen client-side
// so this never needs a composite index. A spot's comment count is small
// enough in practice that this is simpler than a server-side aggregate.
export async function getCommentsForSpot(spotId: string): Promise<Comment[]> {
  const snap = await getDocs(query(commentsRef, where('spotId', '==', spotId)));
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
  await addDoc(commentsRef, {
    spotId: input.spotId,
    authorName: input.authorName.trim(),
    rating: input.rating,
    text: input.text?.trim() || undefined,
    hidden: false,
    createdAt: Date.now(),
  });
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
