'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, X } from 'lucide-react';
import { getAboutSettings, saveAboutSettings } from '@/lib/settings';
import { SocialIcon } from '@/components/site/SocialIcon';
import type { AboutSettings, TeamMember } from '@/types';

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900';
const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

function newMember(): TeamMember {
  return {
    id: crypto.randomUUID(),
    avatarUrl: '',
    name: '',
    title: '',
    bio: '',
    socialUrls: [],
  };
}

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

  function updateMember(id: string, patch: Partial<TeamMember>) {
    if (!settings) return;
    setSettings({
      ...settings,
      team: settings.team.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  }

  function addMember() {
    if (!settings) return;
    setSettings({ ...settings, team: [...settings.team, newMember()] });
  }

  function removeMember(id: string) {
    if (!settings) return;
    setSettings({ ...settings, team: settings.team.filter((m) => m.id !== id) });
  }

  function addSocialUrl(member: TeamMember) {
    updateMember(member.id, { socialUrls: [...member.socialUrls, ''] });
  }

  function updateSocialUrl(member: TeamMember, index: number, value: string) {
    const urls = [...member.socialUrls];
    urls[index] = value;
    updateMember(member.id, { socialUrls: urls });
  }

  function removeSocialUrl(member: TeamMember, index: number) {
    updateMember(member.id, { socialUrls: member.socialUrls.filter((_, i) => i !== index) });
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

        <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-neutral-900 dark:text-white">
              Team
            </h2>
            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-1.5 rounded-full bg-river-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-river-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add member
            </button>
          </div>

          <div>
            <label className={labelClass}>Section heading</label>
            <input
              value={settings.teamTitle}
              onChange={(e) => setSettings({ ...settings, teamTitle: e.target.value })}
              className={inputClass}
            />
          </div>

          {settings.team.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-700">
              No team members yet — add one above.
            </p>
          ) : (
            <div className="space-y-4">
              {settings.team.map((member, i) => (
                <div
                  key={member.id}
                  className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">Member {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      aria-label="Remove member"
                      className="rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Avatar URL</label>
                      <input
                        value={member.avatarUrl}
                        onChange={(e) => updateMember(member.id, { avatarUrl: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        value={member.name}
                        onChange={(e) => updateMember(member.id, { name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      value={member.title}
                      onChange={(e) => updateMember(member.id, { title: e.target.value })}
                      placeholder="e.g. Founder & Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Bio</label>
                    <textarea
                      value={member.bio}
                      onChange={(e) => updateMember(member.id, { bio: e.target.value })}
                      rows={3}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Social links</label>
                    <div className="space-y-2">
                      {member.socialUrls.map((url, urlIndex) => (
                        <div key={urlIndex} className="flex items-center gap-2">
                          <SocialIcon
                            url={url}
                            className="h-4 w-4 shrink-0 text-neutral-400"
                          />
                          <input
                            value={url}
                            onChange={(e) => updateSocialUrl(member, urlIndex, e.target.value)}
                            placeholder="https://instagram.com/..."
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialUrl(member, urlIndex)}
                            aria-label="Remove link"
                            className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addSocialUrl(member)}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-river-600 hover:underline dark:text-river-400"
                    >
                      <Plus className="h-3 w-3" />
                      Add link
                    </button>
                    <p className="mt-1.5 text-xs text-neutral-400">
                      The icon is detected automatically from the URL (Instagram, Facebook, X,
                      LinkedIn, GitHub, YouTube — anything else shows a generic link icon).
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
