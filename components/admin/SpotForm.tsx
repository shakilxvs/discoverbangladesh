'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CategorySubCategoryPicker } from './CategorySubCategoryPicker';
import { KeywordsInput } from './KeywordsInput';
import { GalleryImagesInput } from './GalleryImagesInput';
import { DistrictSelect } from './DistrictSelect';
import { createSpot, updateSpot, isSlugTaken, type SpotInput } from '@/lib/spots';
import { slugify, cn } from '@/lib/utils';
import type { Spot, SpotStatus, Visibility } from '@/types';

const statusOptions: { value: SpotStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'temporarily_closed', label: 'Temporarily Closed' },
  { value: 'permanently_closed', label: 'Permanently Closed' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'permit_required', label: 'Permit Required' },
  { value: 'restricted_access', label: 'Restricted Access' },
  { value: 'private_property', label: 'Private Property' },
  { value: 'under_renovation', label: 'Under Renovation' },
  { value: 'unknown', label: 'Unknown' },
];

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'hidden', label: 'Hidden' },
];

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-river-500 focus:ring-2 focus:ring-river-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:ring-river-900';

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-river-600' : 'bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
    </label>
  );
}

export function SpotForm({ spot }: { spot?: Spot }) {
  const router = useRouter();
  const isEditing = Boolean(spot);

  const [name, setName] = useState(spot?.name ?? '');
  const [slug, setSlug] = useState(spot?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [division, setDivision] = useState(spot?.division ?? '');
  const [district, setDistrict] = useState(spot?.district ?? '');
  const [upazila, setUpazila] = useState(spot?.upazila ?? '');
  const [address, setAddress] = useState(spot?.address ?? '');
  const [description, setDescription] = useState(spot?.description ?? '');
  const [locationUrl, setLocationUrl] = useState(spot?.locationUrl ?? '');
  const [featuredImage, setFeaturedImage] = useState(spot?.featuredImage ?? '');
  const [galleryImages, setGalleryImages] = useState<string[]>(spot?.galleryImages ?? []);
  const [videoUrl, setVideoUrl] = useState(spot?.videoUrl ?? '');
  const [categoryIds, setCategoryIds] = useState<string[]>(spot?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(spot?.subCategoryIds ?? []);
  const [keywords, setKeywords] = useState<string[]>(spot?.keywords ?? []);
  const [status, setStatus] = useState<SpotStatus>(spot?.status ?? 'open');
  const [visibility, setVisibility] = useState<Visibility>(spot?.visibility ?? 'draft');
  const [featured, setFeatured] = useState(spot?.featured ?? false);
  const [commentsEnabled, setCommentsEnabled] = useState(spot?.commentsEnabled ?? true);
  const [verified, setVerified] = useState(spot?.verified ?? false);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState('');

  // Slug auto-follows the name until the admin edits it directly, per
  // "auto-generated but editable".
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSlugError('');

    if (!name.trim() || !slug.trim() || !district || !featuredImage.trim() || !locationUrl.trim()) {
      toast.error('Name, district, featured image and location URL are required.');
      return;
    }

    setSaving(true);
    try {
      if (await isSlugTaken(slug, spot?.id)) {
        setSlugError('That slug is already used by another spot.');
        setSaving(false);
        return;
      }

      const input: SpotInput = {
        name: name.trim(),
        slug: slug.trim(),
        division,
        district,
        upazila: upazila.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim(),
        locationUrl: locationUrl.trim(),
        featuredImage: featuredImage.trim(),
        galleryImages: galleryImages.map((g) => g.trim()).filter(Boolean),
        videoUrl: videoUrl.trim() || undefined,
        categoryIds,
        subCategoryIds,
        keywords,
        status,
        visibility,
        featured,
        commentsEnabled,
        verified,
      };

      if (isEditing && spot) {
        await updateSpot(spot.id, input);
        toast.success('Spot updated');
      } else {
        await createSpot(input);
        toast.success('Spot created');
      }
      router.push('/admin/spots');
      router.refresh();
    } catch {
      toast.error('Something went wrong saving that spot');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10 pb-16">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Basic info
        </h2>
        <Field label="Name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nafakhum Waterfall"
            className={inputClass}
          />
        </Field>
        <Field label="Slug" required error={slugError} hint="Auto-follows the name until you edit it directly.">
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Location
        </h2>
        <Field label="District" required>
          <DistrictSelect
            value={district}
            onChange={(d) => {
              setDistrict(d.name);
              setDivision(d.division);
            }}
          />
        </Field>
        {division && <p className="-mt-2 text-xs text-neutral-400">Division: {division}</p>}
        <Field label="Upazila">
          <input value={upazila} onChange={(e) => setUpazila(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Address">
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        </Field>
        <Field
          label="Location URL"
          required
          hint="Map link — visitors only ever see a 'Location' button, never the raw URL."
        >
          <input
            value={locationUrl}
            onChange={(e) => setLocationUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Media
        </h2>
        <Field label="Featured Image URL" required>
          <input
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>
        <Field label="Gallery Images">
          <GalleryImagesInput value={galleryImages} onChange={setGalleryImages} />
        </Field>
        <Field label="Video URL" hint="Optional — YouTube, Vimeo, or a direct video file link.">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Categories &amp; keywords
        </h2>
        <CategorySubCategoryPicker
          selectedCategoryIds={categoryIds}
          selectedSubCategoryIds={subCategoryIds}
          onChange={(next) => {
            setCategoryIds(next.categoryIds);
            setSubCategoryIds(next.subCategoryIds);
          }}
        />
        <Field label="Keywords" hint="Used for search and related spots.">
          <KeywordsInput value={keywords} onChange={setKeywords} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-neutral-900 dark:text-white">
          Status &amp; visibility
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SpotStatus)}
              className={inputClass}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visibility">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className={inputClass}
            >
              {visibilityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <Toggle label="Featured" checked={featured} onChange={setFeatured} />
          <Toggle label="Comments Enabled" checked={commentsEnabled} onChange={setCommentsEnabled} />
          <Toggle label="Verified" checked={verified} onChange={setVerified} />
        </div>
      </section>

      {isEditing && spot && (
        <p className="text-xs text-neutral-400">
          Created {new Date(spot.createdAt).toLocaleDateString()} · Updated{' '}
          {new Date(spot.updatedAt).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-2 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => router.push('/admin/spots')}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-river-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-river-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create spot'}
        </button>
      </div>
    </form>
  );
}
