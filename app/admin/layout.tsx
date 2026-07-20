'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AdminNav } from '@/components/admin/AdminNav';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (loading) return;
    if (!isLoginPage && (!user || !isAdmin)) {
      router.replace('/admin/login');
    }
    if (isLoginPage && user && isAdmin) {
      router.replace('/admin');
    }
  }, [loading, user, isAdmin, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user || !isAdmin) {
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
