// Real blog imagery from the original muzzammil zip, shipped under public/images/Blog/.
const BLOG_IMAGE_FALLBACKS = [
  '/images/Blog/blog-frame1.png',
  '/images/Blog/blog-frame2.png',
  '/images/Blog/blog-frame3.png',
  '/images/about/who-we-are.png',
  '/images/about/customer-succes.png',
  '/images/about/hero.png',
];

export function resolveBlogImageSrc(imageUrl?: string, index: number = 0): string {
  const fallback = BLOG_IMAGE_FALLBACKS[index % BLOG_IMAGE_FALLBACKS.length];

  if (!imageUrl || typeof imageUrl !== 'string') {
    return fallback;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // The legacy /images/blog/post-{1..4}.jpg files in the canonical repo are 1x1
  // placeholder pixels (the zip never shipped real post-N.jpg files). Force the
  // real Blog/blog-frameN.png imagery from the zip instead.
  if (/^\/images\/blog\/post-[1-4]\.jpg$/i.test(trimmed)) {
    return fallback;
  }

  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
