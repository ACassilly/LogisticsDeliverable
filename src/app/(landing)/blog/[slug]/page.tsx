import { notFound } from 'next/navigation';
import { BLOG_API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Blog } from '@/types';

interface BlogParams {
  slug: string;
}

async function fetchBlogBySlug(slug: string): Promise<Blog> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const url = `${baseUrl}${BLOG_API_ENDPOINTS.PUBLIC_BLOG_BY_SLUG(slug)}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Blog fetch failed');
  }

  const result = (await response.json()) as ApiResponse<Blog>;

  if (!result?.success || !result.data) {
    throw new Error('Blog not found');
  }

  return result.data;
}

export default async function BlogPostPage({ params }: { params: BlogParams }) {
  let blog: Blog;

  try {
    blog = await fetchBlogBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <div className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-4 mb-10">
          <p className="text-sm uppercase tracking-[0.24em] text-green-700">Blog</p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">{blog.title}</h1>
          <p className="text-sm text-gray-500">
            {blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Published date unavailable'}
            {' • '}
            {blog.category.toUpperCase()}
          </p>
        </div>

        <article className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt || '' }} />
        </article>
      </div>
    </div>
  );
}
