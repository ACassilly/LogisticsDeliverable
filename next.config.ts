import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy Shopify-style blog URLs -> current /blog/:slug route.
      // /blogs/news is the old Shopify blog path; /blogs (no trailing
      // segment) is left alone since it resolves to a real route
      // (src/app/(landing)/blogs/page.tsx).
      {
        source: "/blogs/news",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blogs/news/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.portlandialogistics.com', port: '', pathname: '/**' },
    ],
  },
    typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
