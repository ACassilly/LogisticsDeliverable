const BLOG_IMAGE_FALLBACKS = [
  '/images/blog/post-1.jpg',
  '/images/blog/post-2.jpg',
  '/images/blog/post-3.jpg',
  '/images/blog/post-4.jpg',
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

  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}
