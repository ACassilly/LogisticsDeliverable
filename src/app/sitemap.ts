import type { MetadataRoute } from 'next';
import { SERVICE_SLUGS } from '@/constants/services';

const SITE_URL = 'https://portlandialogistics.com';

/**
 * Static, always-present public routes for portlandialogistics.com.
 * Kept in sync with src/app/(landing) route segments.
 */
function getStaticRoutes(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/industries`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/carrier`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/quote`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Service detail pages (LTL, FTL, intermodal, drayage, expedited, specialized,
  // warehousing, final-mile, agency, reverse)
  for (const slug of SERVICE_SLUGS) {
    staticRoutes.push({
      url: `${SITE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  return staticRoutes;
}

/**
 * Best-effort inclusion of individual blog posts. Blog content lives in
 * MongoDB (see src/server/services/blog.service.ts) and is not statically
 * known at build time, so this fetch is wrapped in a try/catch and the
 * sitemap degrades gracefully to the static routes only (e.g. local/dev
 * builds without a reachable MONGODB_URI).
 */
async function getBlogRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const { getPublishedBlogs } = await import('@/server/services/blog.service');
    const { blogs } = await getPublishedBlogs({ limit: 500 });

    return blogs
      .filter((blog) => Boolean(blog.slug))
      .map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    // No reachable database at build time (e.g. local build) — sitemap
    // still ships with all statically known routes.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticRoutes, blogRoutes] = await Promise.all([
    getStaticRoutes(),
    getBlogRoutes(),
  ]);

  return [...staticRoutes, ...blogRoutes];
}
