'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAboutSettings, saveAboutSettings } from '@/lib/settings';
import type { AboutSettings } from '@/types';

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900';
const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

export default function AboutAdminPage() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAboutSettings().then(setSettings);
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await saveAboutSettings(settings);
      toast.success('About page updated');
    } catch {
      toast.error('Could not save the About page');
    }
    setSaving(false);
  }

  if (!settings) {
    return <div className="h-40 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />;
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-neutral-900 dark:text-white">
        About Page
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Editable content for the public /about page.
      </p>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-base font-semibold text-neutral-900 dark:text-white">
            About Bangladesh
          </h2>
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              value={settings.bangladeshImageUrl}
              onChange={(e) => setSettings({ ...settings, bangladeshImageUrl: e.target.value })}
              placeholder="https://example.com/bangladesh.jpg"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Heading</label>
            <input
              value={settings.bangladeshTitle}
              onChange={(e) => setSettings({ ...settings, bangladeshTitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Text</label>
            <textarea
              value={settings.bangladeshContent}
              onChange={(e) => setSettings({ ...settings, bangladeshContent: e.target.value })}
              rows={6}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-base font-semibold text-neutral-900 dark:text-white">
            About the Creator
          </h2>
          <div>
            <label className={labelClass}>Image URL</label>
            <input
              value={settings.creatorImageUrl}
              onChange={(e) => setSettings({ ...settings, creatorImageUrl: e.target.value })}
              placeholder="https://example.com/creator.jpg"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Heading / name</label>
            <input
              value={settings.creatorTitle}
              onChange={(e) => setSettings({ ...settings, creatorTitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Text / bio</label>
            <textarea
              value={settings.creatorContent}
              onChange={(e) => setSettings({ ...settings, creatorContent: e.target.value })}
              rows={6}
              className={inputClass}
            />
          </div>
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
