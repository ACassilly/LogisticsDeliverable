import type { MetadataRoute } from 'next';
import { SERVICE_SLUGS } from '@/constants/services';

// Generates https://portlandialogistics.com/sitemap.xml
// Static routes + service detail pages (SERVICE_SLUGS).
// Blog posts (/blog/[slug]) are API-driven (NEXT_PUBLIC_API_BASE_URL) and
// are intentionally omitted from this static sitemap; add them when the
// blog API can be enumerated at build time.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://portlandialogistics.com';
  const now = new Date();

  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/blogs',
    '/carrier',
    '/contact',
    '/industries',
    '/quote',
    '/services',
    '/terms',
    '/privacy',
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority:
      route === ''
        ? 1
        : route === '/quote' || route === '/contact'
          ? 0.9
          : 0.7,
  }));

  for (const slug of SERVICE_SLUGS) {
    entries.push({
      url: `${base}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return entries;
}
