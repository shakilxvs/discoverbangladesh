import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, deleteField } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guard against re-initializing on hot reload / multiple imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Analytics deliberately omitted here: getAnalytics() touches window/IndexedDB
// and breaks if imported anywhere that runs during SSR. Add it behind a
// client-only guard later if you want pageview tracking.

// Optional form fields across the admin (spot address/upazila/videoUrl,
// hero slide subtitle/ctaLabel/ctaUrl, ...) are built as
// `value.trim() || undefined` when left blank. That's fine for creating a
// new document (see stripUndefined in lib/utils.ts — omitting the key is
// enough), but for updateDoc() on an *existing* document, just omitting the
// key means "leave whatever was there before" — so clearing a field that
// previously had a value would silently fail to clear it. This maps each
// `undefined` to Firestore's deleteField() sentinel instead, so updates
// actually remove the field, while addDoc/updateDoc never see a raw
// `undefined` (which they reject outright).
export function toFirestoreUpdate<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[key] = obj[key] === undefined ? deleteField() : obj[key];
  }
  return out;
}
