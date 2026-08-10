'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { MASTER_ADMIN_EMAIL, canAccess, type AdminSection } from '@/lib/roles';
import type { Role } from '@/types';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  // isAdmin === master_admin or admin (i.e. "full normal admin access").
  // Kept alongside `role` so existing call sites (e.g. app/admin/layout.tsx
  // guards) that only cared about "is this an admin at all" keep working.
  isAdmin: boolean;
  isMasterAdmin: boolean;
  loading: boolean;
  can: (section: AdminSection) => boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Master Admin is identified purely by email — never by a Firestore
      // doc — so there's no document that could be edited/deleted to lock
      // the account out or let anyone else claim the role.
      if (u.email === MASTER_ADMIN_EMAIL) {
        setRole('master_admin');
        setLoading(false);
        return;
      }

      // Everyone else's role comes from users/{uid}. This is what makes a
      // user created directly in the Firebase console (Auth + a
      // users/{uid} doc with role: 'admin' | 'moderator') work identically
      // to one created through the admin panel.
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const data = snap.exists() ? (snap.data() as { role?: string; status?: string }) : null;
        if (data?.status === 'active' && (data.role === 'admin' || data.role === 'moderator')) {
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isMasterAdmin = role === 'master_admin';
  const isAdmin = role === 'master_admin' || role === 'admin';

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  function can(section: AdminSection) {
    return canAccess(role, section);
  }

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin, isMasterAdmin, loading, can, signInWithEmail, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
