import Image from 'next/image';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { getSiteIdentity } from '@/lib/settings';

// Async server component: logo image/text now come from Firestore
// (settings/site) instead of being hardcoded, so they're editable from
// the admin panel's Site Identity page. getSiteIdentity() falls back to
// the exact previous hardcoded values if that doc doesn't exist yet, so
// the header looks identical immediately after this ships.
export async function Header() {
  const { logoText, logoImageUrl } = await getSiteIdentity();

  // The original design split "Discover" (neutral) and "Bangladesh" (river
  // color). That two-tone treatment only makes sense for that exact
  // string, so it's preserved for the default text and falls back to a
  // single-color rendering for any custom text an admin sets.
  const isDefaultText = logoText === 'DiscoverBangladesh';

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2">
            {logoImageUrl && (
              <Image
                src={logoImageUrl}
                alt={logoText}
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
                unoptimized
              />
            )}
            <span className="font-display text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
              {isDefaultText ? (
                <>
                  Discover<span className="text-river-600 dark:text-river-400">Bangladesh</span>
                </>
              ) : (
                logoText
              )}
            </span>
          </Link>
          <Link
            href="/about"
            aria-label="About DiscoverBangladesh"
            title="About"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-river-600 dark:hover:bg-neutral-800 dark:hover:text-river-400"
          >
            <Info className="h-4 w-4" />
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
