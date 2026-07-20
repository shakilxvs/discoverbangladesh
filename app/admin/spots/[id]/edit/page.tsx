'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSpot } from '@/lib/spots';
import { SpotForm } from '@/components/admin/SpotForm';
import type { Spot } from '@/types';

export default function EditSpotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null | undefined>(undefined);

  useEffect(() => {
    getSpot(id).then((s) => {
      if (!s) {
        router.replace('/admin/spots');
        return;
      }
      setSpot(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (spot === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-river-600 border-t-transparent" />
      </div>
    );
  }

  if (!spot) return null;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        Edit spot
      </h1>
      <SpotForm spot={spot} />
    </div>
  );
}
