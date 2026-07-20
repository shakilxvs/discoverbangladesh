'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, Tags, Layers, MapPinned, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, soon: false },
  { href: '/admin/spots', label: 'Spots', icon: MapPin, soon: false },
  { href: '/admin/categories', label: 'Categories', icon: Tags, soon: false },
  { href: '/admin/sub-categories', label: 'Sub-Categories', icon: Layers, soon: false },
  { href: '/admin/districts', label: 'Districts', icon: MapPinned, soon: false },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare, soon: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <nav className="sticky top-20 h-fit w-56 shrink-0">
      <ul className="space-y-1">
        {items.map(({ href, label, icon: Icon, soon }) => {
          const active = pathname === href;
          if (soon) {
            return (
              <li key={href}>
                <span className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm text-neutral-300 dark:text-neutral-600">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:bg-neutral-800">
                    Soon
                  </span>
                </span>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-river-50 text-river-700 dark:bg-river-950 dark:text-river-300'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => signOut()}
        className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  );
}
