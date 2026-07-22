'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/unauthorized-domain':
      return "This domain isn't authorized in Firebase yet — add it under Authentication → Settings → Authorized domains, then try again.";
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect, or that user doesn\'t exist yet in Firebase Authentication → Users.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before finishing — try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup — allow popups for this site and try again.';
    case 'auth/network-request-failed':
      return 'Network error reaching Firebase — check your connection and try again.';
    default:
      return code ? `Sign-in failed (${code}).` : 'Sign-in failed. Please try again.';
  }
}

export default function AdminLoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/admin');
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-2xl font-semibold text-neutral-900 dark:text-white">
          Admin sign in
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          DiscoverBangladesh
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-river-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          or
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
