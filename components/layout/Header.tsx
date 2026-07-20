import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://cdn.shopify.com/s/files/1/0685/4859/1755/files/discoverbd.png?v=1784404303"
            alt="DiscoverBangladesh"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            Discover<span className="text-river-600 dark:text-river-400">Bangladesh</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
