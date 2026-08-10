'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getManagedUsers, updateUserRole, setUserStatus } from '@/lib/users';
import { MASTER_ADMIN_EMAIL } from '@/lib/roles';
import { UserModal } from '@/components/admin/UserModal';
import { Toggle } from '@/components/admin/Toggle';
import type { UserProfile } from '@/types';

export default function UsersAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);

  async function load() {
    setLoading(true);
    try {
      setUsers(await getManagedUsers());
    } catch {
      toast.error('Could not load users');
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(input: { name: string; email: string; password: string; role: 'admin' | 'moderator' }) {
    if (!user) return;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Could not create the user.');
    toast.success(`Created "${input.name}"`);
    setModalOpen(false);
    load();
  }

  async function handleRoleChange(u: UserProfile, role: 'admin' | 'moderator') {
    try {
      await updateUserRole(u.uid, role);
      setUsers((prev) => prev.map((x) => (x.uid === u.uid ? { ...x, role } : x)));
      toast.success(`${u.name} is now ${role}`);
    } catch {
      toast.error('Could not change that role');
    }
  }

  async function handleStatusToggle(u: UserProfile) {
    const status = u.status === 'active' ? 'disabled' : 'active';
    try {
      await setUserStatus(u.uid, status);
      setUsers((prev) => prev.map((x) => (x.uid === u.uid ? { ...x, status } : x)));
      toast.success(status === 'active' ? `${u.name} reactivated` : `${u.name} deactivated`);
    } catch {
      toast.error('Could not update that account');
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ uid: confirmDelete.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not delete that user.');
      toast.success(`Removed "${confirmDelete.name}"`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete that user.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 dark:text-white">Users</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage Admin and Moderator accounts. Only the Master Admin can access this page.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700"
        >
          <Plus className="h-4 w-4" />
          Add user
        </button>
      </div>

      <div className="space-y-2">
        {/* Master Admin is a pinned, non-editable row — never a document in
            the users collection, so there's nothing here to demote or
            delete by mistake. */}
        <div className="flex items-center gap-3 rounded-xl border border-river-200 bg-river-50 px-4 py-3 dark:border-river-900 dark:bg-river-950">
          <ShieldCheck className="h-4 w-4 shrink-0 text-river-600 dark:text-river-400" />
          <span className="flex-1 truncate font-medium text-neutral-900 dark:text-white">
            {MASTER_ADMIN_EMAIL}
          </span>
          <span className="rounded-full bg-river-600 px-2.5 py-1 text-xs font-medium text-white">
            Master Admin
          </span>
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-700">
            No Admin or Moderator accounts yet.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.uid}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900 dark:text-white">{u.name}</p>
                <p className="truncate text-xs text-neutral-400">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'moderator')}
                className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
              <Toggle
                label={u.status === 'active' ? 'Active' : 'Disabled'}
                checked={u.status === 'active'}
                onChange={() => handleStatusToggle(u)}
              />
              <button
                onClick={() => setConfirmDelete(u)}
                aria-label={`Remove ${u.name}`}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && <UserModal onClose={() => setModalOpen(false)} onSave={handleCreate} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900">
            <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
              Remove &ldquo;{confirmDelete.name}&rdquo;?
            </h2>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              This deletes their sign-in account and revokes access immediately. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
