import { MetadataRoute } from 'next'
import { STATES, CITIES, MODES, CORRIDORS } from '@/data/programmatic-seo-matrix'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://portlandialogistics.com'

  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-10-24'), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/quote`, lastModified: new Date('2026-10-24'), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/locations`, lastModified: new Date('2026-10-24'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/lanes`, lastModified: new Date('2026-10-24'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date('2025-11-10'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/industries`, lastModified: new Date('2025-09-14'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date('2024-06-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/carrier`, lastModified: new Date('2024-08-20'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date('2024-06-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-10-20'), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const stateEntries: MetadataRoute.Sitemap = STATES.map((s) => ({
    url: `${baseUrl}/locations/${s.slug}`,
    lastModified: new Date(s.lastModified),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const cityEntries: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${baseUrl}/locations/${c.stateSlug}/${c.slug}`,
    lastModified: new Date(c.lastModified),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const modeEntries: MetadataRoute.Sitemap = MODES.map((m) => ({
    url: `${baseUrl}/modes/${m.slug}`,
    lastModified: new Date(m.lastModified),
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const corridorEntries: MetadataRoute.Sitemap = CORRIDORS.map((c) => ({
    url: `${baseUrl}/lanes/${c.slug}`,
    lastModified: new Date(c.lastModified),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...corePages, ...stateEntries, ...cityEntries, ...modeEntries, ...corridorEntries]
}
