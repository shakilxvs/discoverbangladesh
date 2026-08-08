'use client';

import { useState, type FormEvent } from 'react';
import { X, ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types';
import type { HeroSlideInput } from '@/lib/hero-slides';

interface Props {
  slide: HeroSlide | null;
  onClose: () => void;
  onSave: (input: HeroSlideInput) => void;
}

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white';

export function HeroSlideModal({ slide, onClose, onSave }: Props) {
  const [type, setType] = useState<'image' | 'video'>(slide?.type ?? 'image');
  const [mediaUrl, setMediaUrl] = useState(slide?.mediaUrl ?? '');
  const [title, setTitle] = useState(slide?.title ?? '');
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? '');
  const [ctaLabel, setCtaLabel] = useState(slide?.ctaLabel ?? '');
  const [ctaUrl, setCtaUrl] = useState(slide?.ctaUrl ?? '');
  const [active, setActive] = useState(slide?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mediaUrl.trim() || !title.trim()) return;
    setSaving(true);
    await onSave({
      type,
      mediaUrl: mediaUrl.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      active,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
            {slide ? 'Edit slide' : 'New slide'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Slide type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('image')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium',
                  type === 'image'
                    ? 'border-river-600 bg-river-50 text-river-700 dark:bg-river-950 dark:text-river-300'
                    : 'border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
                )}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium',
                  type === 'video'
                    ? 'border-river-600 bg-river-50 text-river-700 dark:bg-river-950 dark:text-river-300'
                    : 'border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
                )}
              >
                <Video className="h-4 w-4" />
                Video
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="slide-media"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {type === 'image' ? 'Image URL' : 'Video URL'}
            </label>
            <input
              id="slide-media"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={type === 'image' ? 'https://…' : 'YouTube, Vimeo, or a direct .mp4 link'}
              autoFocus
              className={inputClass}
            />
            <p className="mt-1 text-xs text-neutral-400">
              Shown at a 16:9 ratio, so a wide landscape source looks best.
            </p>
          </div>

          <div>
            <label
              htmlFor="slide-title"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Title
            </label>
            <input
              id="slide-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Discover interesting places across Bangladesh"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="slide-subtitle"
              className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Subtitle <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="slide-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Waterfalls, tea estates, heritage sites, hidden gems and more."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="slide-cta-label"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Button text <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                id="slide-cta-label"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Explore"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="slide-cta-url"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Button link
              </label>
              <input
                id="slide-cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/category/nature"
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => setActive(!active)}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                active ? 'bg-river-600' : 'bg-neutral-200 dark:bg-neutral-700'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                  active ? 'translate-x-4' : 'translate-x-0.5'
                )}
              />
            </button>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Active (visible on the homepage)
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !mediaUrl.trim() || !title.trim()}
              className="rounded-full bg-river-600 px-4 py-2 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : slide ? 'Save changes' : 'Create slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
