'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPin, MessageSquare, Tags, Layers, MapPinned, Images } from 'lucide-react';

const statDefs = [
  { key: 'spots', label: 'Total Spots', icon: MapPin },
  { key: 'images', label: 'Total Images', icon: Images },
  { key: 'comments', label: 'Total Comments', icon: MessageSquare },
  { key: 'categories', label: 'Total Categories', icon: Tags },
  { key: 'subCategories', label: 'Total Sub-Categories', icon: Layers },
  { key: 'districts', label: 'Total Districts', icon: MapPinned },
] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    async function run() {
      const [spots, comments, categories, subCategories, districts] = await Promise.all([
        getCountFromServer(collection(db, 'spots')).catch(() => null),
        getCountFromServer(collection(db, 'comments')).catch(() => null),
        getCountFromServer(collection(db, 'categories')).catch(() => null),
        getCountFromServer(collection(db, 'subCategories')).catch(() => null),
        getCountFromServer(collection(db, 'districts')).catch(() => null),
      ]);

      // Images aren't a simple count — each spot has a featured image plus
      // a variable-length gallery — so this one reads the actual docs
      // rather than using an aggregation query.
      let images = 0;
      try {
        const spotDocs = await getDocs(collection(db, 'spots'));
        spotDocs.forEach((d) => {
          const data = d.data();
          images += (data.featuredImage ? 1 : 0) + (data.galleryImages?.length ?? 0);
        });
      } catch {
        images = 0;
      }

      setCounts({
        spots: spots?.data().count ?? 0,
        images,
        comments: comments?.data().count ?? 0,
        categories: categories?.data().count ?? 0,
        subCategories: subCategories?.data().count ?? 0,
        districts: districts?.data().count ?? 0,
      });
    }
    run();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statDefs.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon className="mb-3 h-5 w-5 text-river-600 dark:text-river-400" />
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {counts ? counts[key] : '–'}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
