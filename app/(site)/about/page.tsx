import type { Metadata } from 'next';
import { getAboutSettings } from '@/lib/settings';

// See app/(site)/page.tsx for why this is needed — otherwise this page
// freezes at build time and never reflects admin edits.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About DiscoverBangladesh — a directory of interesting places across Bangladesh, and the person behind it.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const about = await getAboutSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-10 font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
        About
      </h1>

      <section className="mb-14">
        {about.bangladeshImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={about.bangladeshImageUrl}
            alt={about.bangladeshTitle || 'Bangladesh'}
            loading="lazy"
            className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}
        <h2 className="mb-3 font-display text-xl font-semibold text-neutral-900 dark:text-white">
          {about.bangladeshTitle}
        </h2>
        {about.bangladeshContent ? (
          <p className="whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
            {about.bangladeshContent}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">Content coming soon.</p>
        )}
      </section>

      <section>
        {about.creatorImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={about.creatorImageUrl}
            alt={about.creatorTitle || 'Creator'}
            loading="lazy"
            className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover sm:aspect-[3/2] sm:max-w-sm"
          />
        )}
        <h2 className="mb-3 font-display text-xl font-semibold text-neutral-900 dark:text-white">
          {about.creatorTitle}
        </h2>
        {about.creatorContent ? (
          <p className="whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
            {about.creatorContent}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">Content coming soon.</p>
        )}
      </section>
    </div>
  );
}
