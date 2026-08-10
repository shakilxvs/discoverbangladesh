'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Tags,
  Layers,
  MapPinned,
  MessageSquare,
  GalleryHorizontal,
  Info,
  Palette,
  ShieldCheck,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { AdminSection } from '@/lib/roles';

const items: { href: string; label: string; icon: typeof LayoutDashboard; section: AdminSection }[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { href: '/admin/spots', label: 'Spots', icon: MapPin, section: 'spots' },
  { href: '/admin/hero-slides', label: 'Hero Slides', icon: GalleryHorizontal, section: 'heroSlides' },
  { href: '/admin/categories', label: 'Categories', icon: Tags, section: 'categories' },
  { href: '/admin/sub-categories', label: 'Sub-Categories', icon: Layers, section: 'subCategories' },
  { href: '/admin/districts', label: 'Districts', icon: MapPinned, section: 'districts' },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare, section: 'comments' },
  { href: '/admin/about', label: 'About Page', icon: Info, section: 'about' },
  { href: '/admin/site-identity', label: 'Site Identity', icon: Palette, section: 'siteIdentity' },
  { href: '/admin/privacy', label: 'Privacy Policy', icon: ShieldCheck, section: 'privacy' },
  { href: '/admin/users', label: 'Users', icon: Users, section: 'users' },
];

export function AdminNav() {
  const pathname = usePathname();
  const { signOut, can } = useAuth();

  // Only sections the logged-in role is allowed to reach are rendered at
  // all — this is the frontend half of the permission model. The other
  // half (route guarding + Firestore rules) is what actually enforces it
  // if someone types a URL directly; see app/admin/layout.tsx and
  // firestore.rules.
  const visibleItems = items.filter((item) => can(item.section));

  return (
    <nav className="sticky top-20 h-fit w-56 shrink-0">
      <ul className="space-y-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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
