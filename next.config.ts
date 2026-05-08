import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 16: enable Cache Components (required for 'use cache' directive)
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Next.js 16: local IPs blocked by default; set true only for private networks
    dangerouslyAllowLocalIP: false,
    // Next.js 16: max redirect hops changed to 3 (was unlimited)
    maximumRedirects: 3,
  },

  // Turbopack is now the default in Next.js 16 — no experimental flag needed
  // External packages that need Node.js runtime (not bundled for edge)
  serverExternalPackages: ['mongoose', 'bcryptjs', 'nodemailer', 'xmlrpc'],
};

export default nextConfig;
