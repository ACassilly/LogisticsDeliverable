import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2026-09-28: 'export' for Cloudflare Pages static deploy (project: portlandialogistics).
  // Azure VM/Docker standalone path is retired (subscription suspended 2026-09-05).
  output: 'export',
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
