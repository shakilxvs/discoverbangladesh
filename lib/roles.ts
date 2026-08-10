import type { Role } from '@/types';

// The single source of truth for who the Master Admin is. Kept as one
// exported constant so it's never duplicated/typo'd across the codebase —
// hooks/useAuth.tsx, firestore.rules (mirrored, rules files can't import
// TS), and app/api/admin/users/route.ts all key off this same value.
export const MASTER_ADMIN_EMAIL = 'shakilxvs@gmail.com';

// Every admin-panel section that can be independently gated. Adding a new
// admin feature later means: add its key here, add it to PERMISSIONS for
// the roles that should see it, and add a route->section mapping entry in
// sectionForPath. Nothing else in the app should hardcode a role check.
export const ADMIN_SECTIONS = [
  'dashboard',
  'spots',
  'heroSlides',
  'categories',
  'subCategories',
  'districts',
  'comments',
  'about',
  'siteIdentity',
  'privacy',
  'users',
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const PERMISSIONS: Record<Role, readonly AdminSection[]> = {
  master_admin: ADMIN_SECTIONS,
  admin: ADMIN_SECTIONS.filter((s) => s !== 'users'),
  moderator: ['spots', 'comments'],
};

export function canAccess(role: Role | null, section: AdminSection): boolean {
  if (!role) return false;
  return PERMISSIONS[role].includes(section);
}

// Route guarding: maps an /admin/* pathname to the section it belongs to.
export function sectionForPath(pathname: string): AdminSection | null {
  if (pathname === '/admin') return 'dashboard';
  const map: [string, AdminSection][] = [
    ['/admin/spots', 'spots'],
    ['/admin/hero-slides', 'heroSlides'],
    ['/admin/categories', 'categories'],
    ['/admin/sub-categories', 'subCategories'],
    ['/admin/districts', 'districts'],
    ['/admin/comments', 'comments'],
    ['/admin/about', 'about'],
    ['/admin/site-identity', 'siteIdentity'],
    ['/admin/privacy', 'privacy'],
    ['/admin/users', 'users'],
  ];
  const hit = map.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : null;
}
