import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
    ignoreBuildErrors: false,
  },

};

export default nextConfig;
