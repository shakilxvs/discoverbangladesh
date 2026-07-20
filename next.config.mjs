/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Spot images and the logo can come from any external host per spec
    // ("Admin pastes one or multiple image URLs... any provider"), so we
    // allow all HTTPS hosts here rather than allow-listing specific CDNs.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Explicit @/* alias for Turbopack (the default bundler as of Next 16).
  // tsconfig.json's "paths" declares this too, which Next reads natively,
  // but it's spelled out here as well rather than relying on just one path.
  turbopack: {
    resolveAlias: {
      '@/*': './*',
    },
  },
};

export default nextConfig;
