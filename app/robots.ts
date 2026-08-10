import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://discoverbangladesh.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin/* (dashboard, login, user management, all settings
        // screens) and /api/* (the user-management endpoint) are the only
        // non-public routes in this app — nothing else needs blocking, and
        // in particular no CSS/JS/image paths are disallowed here since
        // that would break rendering for crawlers.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
