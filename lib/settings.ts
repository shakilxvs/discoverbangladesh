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
  creatorImageUrl: '',
  creatorTitle: 'About the Creator',
  creatorContent: '',
};

const DEFAULT_PRIVACY: PrivacySettings = {
  title: 'Privacy Policy',
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

export async function getAboutSettings(): Promise<AboutSettings> {
  const snap = await getDoc(doc(db, 'settings', 'about'));
  return snap.exists() ? { ...DEFAULT_ABOUT, ...(snap.data() as Partial<AboutSettings>) } : DEFAULT_ABOUT;
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
