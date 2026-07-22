'use client';

import { useState } from 'react';
import { Sprout, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { seedTaxonomyAndDistricts, seedDefaultSpots } from '@/lib/seed-client';
import { cn } from '@/lib/utils';

export function SeedPanel({ onSeeded }: { onSeeded?: () => void }) {
  const [runningTaxonomy, setRunningTaxonomy] = useState(false);
  const [runningSpots, setRunningSpots] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  function pushLog(message: string) {
    setLog((prev) => [...prev.slice(-4), message]);
  }

  async function handleSeedTaxonomy() {
    setRunningTaxonomy(true);
    setSummary(null);
    setLog([]);
    try {
      const result = await seedTaxonomyAndDistricts(pushLog);
      if (result.skipped) {
        setSummary('Categories already existed — nothing changed.');
        toast.info('Taxonomy already seeded');
      } else {
        setSummary(
          `Seeded ${result.categories} categories, ${result.subCategories} sub-categories, and ${result.districts} districts.`
        );
        toast.success('Taxonomy and districts seeded');
      }
      onSeeded?.();
    } catch (err) {
      toast.error('Seeding failed — see console for details');
      console.error(err);
    } finally {
      setRunningTaxonomy(false);
    }
  }

  async function handleSeedSpots() {
    setRunningSpots(true);
    setSummary(null);
    setLog([]);
    try {
      const result = await seedDefaultSpots(pushLog);
      const parts = [`${result.created} spots created`];
      if (result.skipped > 0) parts.push(`${result.skipped} already existed`);
      if (result.errors.length > 0) parts.push(`${result.errors.length} issues`);
      setSummary(parts.join(' · '));
      if (result.errors.length > 0) {
        console.warn('Seed spot issues:', result.errors);
        toast.warning(`Seeded with ${result.errors.length} issue(s) — see console`);
      } else {
        toast.success(`${result.created} spots added`);
      }
      onSeeded?.();
    } catch (err) {
      toast.error('Seeding failed — see console for details');
      console.error(err);
    } finally {
      setRunningSpots(false);
    }
  }

  const running = runningTaxonomy || runningSpots;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center gap-2">
        <Sprout className="h-4 w-4 text-river-600 dark:text-river-400" />
        <h2 className="font-display text-base font-semibold text-neutral-900 dark:text-white">
          Seed default data
        </h2>
      </div>
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        Runs directly from this browser session — no terminal needed. Safe to click more than
        once: anything already in the database is skipped rather than duplicated.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSeedTaxonomy}
          disabled={running}
          className={cn(
            'rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50'
          )}
        >
          {runningTaxonomy ? 'Seeding…' : 'Seed categories, sub-categories & districts'}
        </button>
        <button
          onClick={handleSeedSpots}
          disabled={running}
          className="rounded-full border border-river-600 px-4 py-2 text-sm font-medium text-river-600 hover:bg-river-50 disabled:opacity-50 dark:text-river-400 dark:hover:bg-river-950"
        >
          {runningSpots ? 'Seeding…' : 'Seed default spots'}
        </button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 space-y-1 rounded-xl bg-neutral-50 p-3 font-mono text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {log.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {summary && (
        <div className="mt-3 flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <span>{summary}</span>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-neutral-400">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Default spots seed with no image, no map link, status Open, and Published — add photos
          and map links per spot from the Spots list whenever you&apos;re ready.
        </span>
      </div>
    </div>
  );
}
