import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Firestore's addDoc/updateDoc throw ("Unsupported field value: undefined")
// if any field in the payload is `undefined` — which happens constantly
// here because optional form fields are built as `value.trim() || undefined`.
// For a new document, just omitting the key is correct (there's nothing to
// clear yet), so this is what create*() helpers use.
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
