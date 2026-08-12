'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AdminNav } from '@/components/admin/AdminNav';
import { sectionForPath, defaultPathForRole } from '@/lib/roles';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, role, loading, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  // Route protection, not just nav hiding: an Admin who types /admin/users
  // directly, or a Moderator who types /admin/categories directly, gets
  // redirected away here — same as an unauthenticated user does. This is
  // still only a UI-layer convenience, though; firestore.rules is what
  // actually stops the underlying reads/writes from succeeding.
  const section = sectionForPath(pathname);
  const allowed = Boolean(role) && (section ? can(section) : true);

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && (!user || !role)) {
      router.replace('/admin/login');
      return;
    }
    if (!isLoginPage && user && role && !allowed) {
      router.replace(defaultPathForRole(role));
      return;
    }
    if (isLoginPage && user && role) {
      router.replace(defaultPathForRole(role));
    }
  }, [loading, user, role, allowed, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user || !role || !allowed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-river-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  );
}
