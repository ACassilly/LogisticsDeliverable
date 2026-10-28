import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2026-10-28: Canonical Riven Engine standalone container deploy via scm.rivenai.io/portlandia-logistics/storefront.
  output: 'standalone',
  images: {
    unoptimized: true,
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
