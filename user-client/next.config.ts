import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack configuration
  turbopack: {
    root: process.cwd(),
  },

  // Performance: Enable gzip/brotli compression
  compress: true,

  // Performance: React strict mode for dev, no perf overhead in prod
  reactStrictMode: true,

  // Performance: Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,

  // Image optimization with modern formats
  images: {
    // Prefer AVIF (40% smaller than WebP), fallback to WebP
    formats: ['image/avif', 'image/webp'],
    // Optimized device sizes for mobile-first
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (immutable assets)
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Performance: Aggressive caching headers for static assets
  async headers() {
    return [
      {
        // Cache all static image assets for 1 year (immutable)
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js static chunks (JS/CSS) for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts for 1 year
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
