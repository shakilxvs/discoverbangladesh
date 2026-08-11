import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SiteIdentitySettings, AboutSettings, PrivacySettings } from '@/types';

// Defaults deliberately match what was previously hardcoded in
// components/layout/Header.tsx, so the site looks exactly the same the
// moment this ships — before any admin has touched Site Identity, the
// settings/site document simply doesn't exist yet and these are used.
const DEFAULT_SITE_IDENTITY: SiteIdentitySettings = {
  logoText: 'DiscoverBangladesh',
  logoImageUrl: 'https://cdn.shopify.com/s/files/1/0685/4859/1755/files/discoverbd.png?v=1784404303',
};

const DEFAULT_ABOUT: AboutSettings = {
  bangladeshImageUrl: '',
  bangladeshTitle: 'About Bangladesh',
  bangladeshContent: '',
  teamTitle: 'Meet the Team',
  team: [],
};

const DEFAULT_PRIVACY: PrivacySettings = {
  title: 'Privacy & Safety',
  content: '',
};

export async function getSiteIdentity(): Promise<SiteIdentitySettings> {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists()
    ? { ...DEFAULT_SITE_IDENTITY, ...(snap.data() as Partial<SiteIdentitySettings>) }
    : DEFAULT_SITE_IDENTITY;
}

export async function saveSiteIdentity(input: SiteIdentitySettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'site'), input, { merge: true });
}

// Old shape, from before the Team section existed — kept only so
// getAboutSettings can migrate it below without losing anything an admin
// already typed in.
interface LegacyAboutFields {
  creatorImageUrl?: string;
  creatorTitle?: string;
  creatorContent?: string;
}

export async function getAboutSettings(): Promise<AboutSettings> {
  const snap = await getDoc(doc(db, 'settings', 'about'));
  if (!snap.exists()) return DEFAULT_ABOUT;

  const data = snap.data() as Partial<AboutSettings> & LegacyAboutFields;
  const merged: AboutSettings = { ...DEFAULT_ABOUT, ...data, team: data.team ?? [] };

  // Migrate the old single "About the Creator" fields into one team
  // member so nothing already saved is silently lost. This only happens
  // in memory here — it's written back to Firestore under the new shape
  // the next time an admin opens and saves the About page.
  if (merged.team.length === 0 && (data.creatorTitle || data.creatorContent || data.creatorImageUrl)) {
    merged.team = [
      {
        id: 'legacy-creator',
        avatarUrl: data.creatorImageUrl ?? '',
        name: data.creatorTitle ?? '',
        title: '',
        bio: data.creatorContent ?? '',
        socialUrls: [],
      },
    ];
  }

  return merged;
}

export async function saveAboutSettings(input: AboutSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'about'), input, { merge: true });
}

export async function getPrivacySettings(): Promise<PrivacySettings> {
  const snap = await getDoc(doc(db, 'settings', 'privacy'));
  return snap.exists() ? { ...DEFAULT_PRIVACY, ...(snap.data() as Partial<PrivacySettings>) } : DEFAULT_PRIVACY;
}

export async function savePrivacySettings(input: PrivacySettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'privacy'), input, { merge: true });
}
