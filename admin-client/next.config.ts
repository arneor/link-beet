import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
  async redirects() {
    return [
      {
        source: '/admin/business/:id',
        destination: '/business/:id',
        permanent: true,
      },
      {
        source: '/admin/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin/login',
        destination: '/login',
        permanent: true,
      },
      // Catch-all for any other /admin routes to be stripped
      {
        source: '/admin/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
