import Link from 'next/link';

// lucide-react dropped brand/logo icons (Instagram, Facebook) in the
// installed version, so these are small hand-drawn glyphs instead of
// pulling in a whole extra icon package for two icons.
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M15 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2H15l-.5 3H11.5v6.5h-3V15H6v-3h2.5v-2.3C8.5 7.1 10 5.5 12.7 5.5H15v3Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-sm text-neutral-500 dark:text-neutral-400 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {year} DiscoverBangladesh</p>
        <div className="flex items-center gap-4">
          <span>
            by{' '}
            <Link
              href="https://shakilxvs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:text-river-600 dark:text-neutral-300 dark:hover:text-river-400"
            >
              Shakil
            </Link>
          </span>
          <Link
            href="https://www.instagram.com/shakilxvs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-neutral-400 hover:text-river-600 dark:hover:text-river-400"
          >
            <InstagramIcon className="h-4 w-4" />
          </Link>
          <Link
            href="https://www.facebook.com/shakilxvso"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-neutral-400 hover:text-river-600 dark:hover:text-river-400"
          >
            <FacebookIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
