import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverbangladesh.vercel.app'),
  title: {
    default: 'DiscoverBangladesh — Find Interesting Places in Bangladesh',
    template: '%s | DiscoverBangladesh',
  },
  description:
    'A modern directory of interesting places across Bangladesh — waterfalls, tea estates, heritage sites, hidden gems and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
