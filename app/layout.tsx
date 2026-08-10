import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'sonner';
import { getSiteIdentity } from '@/lib/settings';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverbangladesh.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DiscoverBangladesh — Find Interesting Places in Bangladesh',
    template: '%s | DiscoverBangladesh',
  },
  description:
    'A modern directory of interesting places across Bangladesh — waterfalls, tea estates, heritage sites, hidden gems and more.',
  alternates: { canonical: '/' },
  // Only rendered if the env var is set — no fake/placeholder verification
  // value is ever committed. To verify in Google Search Console: Search
  // Console -> Add property -> HTML tag method -> copy the "content"
  // value -> set GOOGLE_SITE_VERIFICATION in your environment.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { logoText, logoImageUrl } = await getSiteIdentity();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: logoText,
    url: SITE_URL,
    logo: logoImageUrl || undefined,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
