import type { Metadata } from 'next';
import { getPrivacySettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const privacy = await getPrivacySettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
        {privacy.title}
      </h1>
      {privacy.content ? (
        <p className="whitespace-pre-line leading-relaxed text-neutral-600 dark:text-neutral-300">
          {privacy.content}
        </p>
      ) : (
        <p className="text-sm text-neutral-400">Content coming soon.</p>
      )}
    </div>
  );
}
