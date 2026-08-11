import type { Metadata } from 'next';
import { getAboutSettings } from '@/lib/settings';
import { SocialIcon } from '@/components/site/SocialIcon';

// See app/(site)/page.tsx for why this is needed — otherwise this page
// freezes at build time and never reflects admin edits.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About DiscoverBangladesh — a directory of interesting places across Bangladesh, and the team behind it.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const about = await getAboutSettings();

  // Structured, crawlable creator/team info (Person schema) — only for
  // members who actually have a name, and only sameAs links that are
  // there. Nothing invented.
  const teamJsonLd = about.team
    .filter((m) => m.name.trim())
    .map((m) => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: m.name,
      jobTitle: m.title || undefined,
      image: m.avatarUrl || undefined,
      sameAs: m.socialUrls.filter(Boolean),
    }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {teamJsonLd.map((person, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      ))}

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

      {about.team.length > 0 && (
        <section>
          <h2 className="mb-6 font-display text-xl font-semibold text-neutral-900 dark:text-white">
            {about.teamTitle}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {about.team.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-3 flex items-center gap-3">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-river-50 font-display text-lg font-semibold text-river-600 dark:bg-river-950 dark:text-river-400">
                      {member.name.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">
                      {member.name}
                    </p>
                    {member.title && (
                      <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {member.title}
                      </p>
                    )}
                  </div>
                </div>

                {member.bio && (
                  <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {member.bio}
                  </p>
                )}

                {member.socialUrls.filter(Boolean).length > 0 && (
                  <div className="flex items-center gap-2">
                    {member.socialUrls.filter(Boolean).map((url) => (
                      
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on ${url}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-river-600 dark:hover:bg-neutral-800 dark:hover:text-river-400"
                      >
                        <SocialIcon url={url} className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
