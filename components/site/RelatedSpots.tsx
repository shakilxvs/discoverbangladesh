import { SpotCard } from './SpotCard';
import type { Spot } from '@/types';

export function RelatedSpots({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold text-neutral-900 dark:text-white">
        Related spots
      </h2>
      <div className="columns-2 gap-4 sm:columns-3">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
}
