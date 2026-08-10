'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSiteIdentity, saveSiteIdentity } from '@/lib/settings';
import type { SiteIdentitySettings } from '@/types';

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900';
const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export default function SiteIdentityAdminPage() {
  const [settings, setSettings] = useState<SiteIdentitySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteIdentity().then(setSettings);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSiteIdentity(settings);
      toast.success('Site identity updated');
    } catch {
      toast.error('Could not save site identity');
    }
    setSaving(false);
  }

  if (!settings) {
    return <div className="h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />;
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        Site Identity
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Controls the logo image and text shown in the site header.
      </p>

      <div className="max-w-lg space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <label className={labelClass}>Logo text</label>
          <input
            value={settings.logoText}
            onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Logo image URL</label>
          <input
            value={settings.logoImageUrl}
            onChange={(e) => setSettings({ ...settings, logoImageUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            Paste a hosted image URL — there&apos;s no direct image upload.
          </p>
        </div>

        {settings.logoImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logoImageUrl} alt="Logo preview" className="h-10 w-10 object-contain" />
        )}

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
