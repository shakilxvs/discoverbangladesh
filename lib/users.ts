import { collection, doc, getDoc, getDocs, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '@/types';

const usersRef = collection(db, 'users');

// Master Admin is intentionally never a document in this collection (see
// lib/roles.ts / firestore.rules) — this list is Admin + Moderator
// accounts only. The Users page renders the Master Admin as a separate,
// pinned, non-editable row alongside these.
export async function getManagedUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(usersRef, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as UserProfile) : null;
}

// Role/status changes are simple field updates allowed directly by
// firestore.rules for the Master Admin — no server round-trip needed.
// Creating and deleting Auth accounts, on the other hand, requires the
// Firebase Admin SDK (see app/api/admin/users/route.ts) because the
// client SDK can't do either without side effects (creating signs in as
// the new user; there's no client API to delete another user's account).
export async function updateUserRole(uid: string, role: 'admin' | 'moderator'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function setUserStatus(uid: string, status: 'active' | 'disabled'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status });
}
