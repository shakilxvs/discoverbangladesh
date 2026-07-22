'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import type { Spot } from '@/types';

export function SpotCard({ spot }: { spot: Spot }) {
  const [broken, setBroken] = useState(false);
  const hasImage = Boolean(spot.featuredImage) && !broken;

  return (
    <Link
      href={`/spot/${spot.slug}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.featuredImage}
            alt={spot.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-river-50 to-river-100 text-river-300 dark:from-river-950 dark:to-neutral-900 dark:text-river-800">
            <MapPin className="h-7 w-7" />
          </div>
        )}
        {spot.featured && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-monsoon-400/95 px-2 py-0.5 text-[11px] font-medium text-white shadow">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 font-medium text-neutral-900 dark:text-white">{spot.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
          <MapPin className="h-3 w-3" />
          {spot.district}
        </p>
      </div>
    </Link>
  );
}
