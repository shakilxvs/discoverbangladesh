import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MapPin, Image as ImageIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getSpotBySlug, getPublishedSpots, getRelatedSpots } from '@/lib/spots';
import { getCategories } from '@/lib/categories';
import { getSubCategories } from '@/lib/sub-categories';
import { getCommentsForSpot, summarizeRating } from '@/lib/comments';

// See app/(site)/page.tsx for why this is needed.
export const dynamic = 'force-dynamic';
import { Gallery } from '@/components/site/Gallery';
import { VideoEmbed } from '@/components/site/VideoEmbed';
import { LocationButton } from '@/components/site/LocationButton';
import { ShareButton } from '@/components/site/ShareButton';
import { CommentsSection } from '@/components/site/CommentsSection';
import { RelatedSpots } from '@/components/site/RelatedSpots';
import { StarRatingDisplay } from '@/components/site/StarRating';

const statusLabels: Record<string, string> = {
  open: 'Open',
  temporarily_closed: 'Temporarily Closed',
  permanently_closed: 'Permanently Closed',
  seasonal: 'Seasonal',
  permit_required: 'Permit Required',
  restricted_access: 'Restricted Access',
  private_property: 'Private Property',
  under_renovation: 'Under Renovation',
  unknown: 'Status Unknown',
};

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) return {};
  return {
    title: spot.name,
    description: spot.description.slice(0, 160),
    openGraph: {
      title: spot.name,
      description: spot.description.slice(0, 160),
      images: spot.featuredImage ? [spot.featuredImage] : undefined,
    },
  };
}

export default async function SpotDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot || spot.visibility !== 'published') notFound();

  const [allSpots, categories, subCategories, comments] = await Promise.all([
    getPublishedSpots(),
    getCategories(),
    getSubCategories(),
    getCommentsForSpot(spot.id),
  ]);

  const related = getRelatedSpots(allSpots, spot);
  const spotCategories = categories.filter((c) => spot.categoryIds.includes(c.id));
  const spotSubCategories = subCategories.filter((s) => spot.subCategoryIds.includes(s.id));
  const rating = summarizeRating(comments);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/spot/${spot.slug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-neutral-400">
          <MapPin className="h-4 w-4" />
          <span>
            {spot.district}, {spot.division}
            {spot.upazila ? ` · ${spot.upazila}` : ''}
          </span>
        </div>
        {spot.address && (
          <p className="mb-3 text-sm text-neutral-400">{spot.address}</p>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {spot.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StarRatingDisplay value={rating.average} count={rating.count} />
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {statusLabels[spot.status] ?? spot.status}
          </span>
          {spot.verified && (
            <span className="rounded-full bg-river-50 px-2.5 py-1 text-xs font-medium text-river-700 dark:bg-river-950 dark:text-river-300">
              Verified
            </span>
          )}
        </div>
      </div>

      {spot.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={spot.featuredImage}
          alt={spot.name}
          className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="mb-6 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-river-50 to-river-100 text-river-300 dark:from-river-950 dark:to-neutral-900 dark:text-river-800">
          <ImageIcon className="h-10 w-10" />
          <span className="text-sm">No photo yet</span>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        <LocationButton url={spot.locationUrl} />
        <ShareButton title={spot.name} url={canonicalUrl} />
      </div>

      {spot.description && (
        <p className="mb-8 whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
          {spot.description}
        </p>
      )}

      {spot.galleryImages.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900 dark:text-white">
            Gallery
          </h2>
          <Gallery images={spot.galleryImages} alt={spot.name} />
        </div>
      )}

      {spot.videoUrl && (
        <div className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-neutral-900 dark:text-white">
            Video
          </h2>
          <VideoEmbed url={spot.videoUrl} />
        </div>
      )}

      {(spotCategories.length > 0 || spotSubCategories.length > 0 || spot.keywords.length > 0) && (
        <div className="mb-8 space-y-3">
          {spotCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {spotCategories.map((c) => {
                const Icon = (Icons[c.icon as keyof typeof Icons] as Icons.LucideIcon) ?? Icons.MapPin;
                return (
                  <span
                    key={c.id}
                    className="flex items-center gap-1 rounded-full bg-river-50 px-3 py-1 text-xs font-medium text-river-700 dark:bg-river-950 dark:text-river-300"
                  >
                    <Icon className="h-3 w-3" />
                    {c.name}
                  </span>
                );
              })}
            </div>
          )}
          {spotSubCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {spotSubCategories.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {s.name}
                </span>
              ))}
            </div>
          )}
          {spot.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {spot.keywords.map((k) => (
                <span key={k} className="text-xs text-neutral-400">
                  #{k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <CommentsSection spotId={spot.id} initialComments={comments} commentsEnabled={spot.commentsEnabled} />
      </div>

      <RelatedSpots spots={related} />
    </div>
  );
}
