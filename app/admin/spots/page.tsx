'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { Plus, Search, Pencil, Trash2, Copy, Star, MessageSquareOff, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { getSpots, deleteSpot, duplicateSpot } from '@/lib/spots';
import { cn } from '@/lib/utils';
import type { Spot } from '@/types';

const visibilityStyles: Record<string, string> = {
  published: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  hidden: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

function Thumb({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300 dark:bg-neutral-800">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="h-12 w-12 shrink-0 rounded-lg object-cover"
    />
  );
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Spot | null>(null);

  async function load() {
    setLoading(true);
    setSpots(await getSpots());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const fuse = useMemo(
    () => new Fuse(spots, { keys: ['name', 'district', 'division', 'keywords'], threshold: 0.3 }),
    [spots]
  );

  const filtered = search.trim() ? fuse.search(search).map((r) => r.item) : spots;

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteSpot(confirmDelete.id);
      toast.success(`Deleted "${confirmDelete.name}"`);
      setConfirmDelete(null);
      load();
    } catch {
      toast.error('Could not delete that spot');
    }
  }

  async function handleDuplicate(spot: Spot) {
    try {
      await duplicateSpot(spot.id);
      toast.success(`Duplicated "${spot.name}" as a draft`);
      load();
    } catch {
      toast.error('Could not duplicate that spot');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">
            Spots
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{spots.length} total</p>
        </div>
        <Link
          href="/admin/spots/new"
          className="flex items-center gap-1.5 rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700"
        >
          <Plus className="h-4 w-4" />
          New spot
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, district, keyword…"
          className="flex-1 bg-transparent text-sm outline-none dark:text-white"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
          {spots.length === 0
            ? <>No spots yet — click &ldquo;New spot&rdquo; to add the first one.</>
            : <>No spots match &ldquo;{search}&rdquo;.</>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((spot) => (
            <div
              key={spot.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Thumb src={spot.featuredImage} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-medium text-neutral-900 dark:text-white">{spot.name}</p>
                  {spot.featured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-monsoon-400 text-monsoon-400" />
                  )}
                  {!spot.commentsEnabled && (
                    <MessageSquareOff className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                  )}
                </div>
                <p className="truncate text-xs text-neutral-400">
                  {spot.district}, {spot.division}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  visibilityStyles[spot.visibility]
                )}
              >
                {spot.visibility}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/spots/${spot.id}/edit`}
                  aria-label={`Edit ${spot.name}`}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleDuplicate(spot)}
                  aria-label={`Duplicate ${spot.name}`}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(spot)}
                  aria-label={`Delete ${spot.name}`}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
              Delete &ldquo;{confirmDelete.name}&rdquo;?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
