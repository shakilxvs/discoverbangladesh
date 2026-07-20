import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  seedCategories,
  subCategoryNames,
  categorySubCategoryMap,
  seedDistricts,
} from '../data/seed-data';
import { slugify } from '../lib/utils';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('NEXT_PUBLIC_ADMIN_EMAIL is missing from .env.local');
    process.exit(1);
  }

  console.log(`This seeds default categories, sub-categories and districts as ${adminEmail}.`);
  console.log('That Firebase Auth user must already exist: Console -> Authentication -> Users -> Add user.');
  console.log('(The password below is only used for this sign-in — it is never written to any file.)\n');

  const rl = readline.createInterface({ input, output });
  const password = await rl.question('Admin password: ');
  rl.close();

  await signInWithEmailAndPassword(auth, adminEmail, password);
  console.log('\nSigned in. Checking for existing data...');

  const existing = await getDocs(query(collection(db, 'categories'), limit(1)));
  if (!existing.empty) {
    console.log(
      'Categories already exist in this project — skipping seed to avoid duplicates.\n' +
        'Delete the categories/subCategories/districts collections first if you want to re-seed from scratch.'
    );
    process.exit(0);
  }

  // Categories
  const categoryIdByName: Record<string, string> = {};
  for (let i = 0; i < seedCategories.length; i++) {
    const cat = seedCategories[i];
    const ref = doc(collection(db, 'categories'));
    await setDoc(ref, {
      name: cat.name,
      slug: slugify(cat.name),
      icon: cat.icon,
      order: i,
      createdAt: Date.now(),
    });
    categoryIdByName[cat.name] = ref.id;
  }
  console.log(`Seeded ${seedCategories.length} categories.`);

  // Sub-categories, each resolving which categories it belongs to from the map
  for (let i = 0; i < subCategoryNames.length; i++) {
    const subName = subCategoryNames[i];
    const parentCategoryNames = Object.entries(categorySubCategoryMap)
      .filter(([, subs]) => subs.includes(subName))
      .map(([catName]) => catName);
    const categoryIds = parentCategoryNames
      .map((n) => categoryIdByName[n])
      .filter((v): v is string => Boolean(v));

    const ref = doc(collection(db, 'subCategories'));
    await setDoc(ref, {
      name: subName,
      slug: slugify(subName),
      categoryIds,
      order: i,
      createdAt: Date.now(),
    });
  }
  console.log(`Seeded ${subCategoryNames.length} sub-categories.`);

  // Districts
  for (let i = 0; i < seedDistricts.length; i++) {
    const d = seedDistricts[i];
    const ref = doc(collection(db, 'districts'));
    await setDoc(ref, {
      name: d.name,
      division: d.division,
      slug: slugify(d.name),
      order: i,
    });
  }
  console.log(`Seeded ${seedDistricts.length} districts.`);

  console.log('\nDone. Visit /admin/categories and /admin/sub-categories to manage them from here on.');
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});
