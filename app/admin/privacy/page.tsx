'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getPrivacySettings, savePrivacySettings } from '@/lib/settings';
import type { PrivacySettings } from '@/types';

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900';
const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export default function PrivacyAdminPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPrivacySettings().then(setSettings);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await savePrivacySettings(settings);
      toast.success('Privacy Policy updated');
    } catch {
      toast.error('Could not save the Privacy Policy');
    }
    setSaving(false);
  }

  if (!settings) {
    return <div className="h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />;
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Editable content for the public /privacy page.
      </p>

      <div className="max-w-2xl space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <label className={labelClass}>Page title</label>
          <input
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Policy content</label>
          <textarea
            value={settings.content}
            onChange={(e) => setSettings({ ...settings, content: e.target.value })}
            rows={16}
            placeholder="Line breaks are preserved as written here."
            className={inputClass}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
