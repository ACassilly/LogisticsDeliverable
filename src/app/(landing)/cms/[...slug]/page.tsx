import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWebsitePages, getOdooPageContent } from '@/lib/odoo-cms';
import { OdooContent } from '@/components/cms';

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60;

/**
 * Generate static paths for Odoo CMS pages
 * This helps with SEO and performance by pre-rendering known pages
 */
export async function generateStaticParams(): Promise<
  { slug: string[] }[]
> {
  try {
    const pages = await getWebsitePages(8);
    
    return pages
      .filter(page => page.url) // Only include pages with URLs
      .map(page => {
        // Convert URL like "/about" to slug ["about"]
        // or "/about/team" to slug ["about", "team"]
        const cleanUrl = page.url.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
        const slug = cleanUrl ? cleanUrl.split('/') : [];
        return { slug };
      });
  } catch (error) {
    console.error('Error generating static params for CMS pages:', error);
    // Return empty array on error - pages will be generated on-demand
    return [];
  }
}

/**
 * Generate metadata for the CMS page
 */
export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  // Reconstruct URL from slug array
  const pageUrl = `/${slug.join('/')}`;

  try {
    const pages = await getWebsitePages(8);
    const page = pages.find(p => p.url === pageUrl);

    if (!page) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for could not be found.',
      };
    }

    return {
      title: page.page_title || page.name || 'Page',
      description: page.description || 'View this page from Portlandia Logistics',
      openGraph: {
        title: page.page_title || page.name,
        description: page.description || undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page',
      description: 'View this page from Portlandia Logistics',
    };
  }
}

interface CmsPageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Dynamic CMS page component
 * Serves Odoo website builder pages at /cms/[page-name]
 */
export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  try {
    // Reconstruct the URL from slug array
    // e.g., ['about'] → '/about'
    // e.g., ['about', 'team'] → '/about/team'
    const pageUrl = `/${slug.join('/')}`;

    // Fetch all pages to find matching URL
    const pages = await getWebsitePages(8);
    const page = pages.find((p) => p.url === pageUrl);

    if (!page) {
      console.warn(`CMS page not found for URL: ${pageUrl}`);
      notFound();
    }

    // Fetch the page HTML content
    const htmlContent = await getOdooPageContent(page.id);

    if (!htmlContent) {
      console.warn(`No HTML content found for page ID: ${page.id}`);
      notFound();
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Page wrapper with site-standard padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Page title (optional - can be hidden with CSS if needed) */}
          {page.name && (
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {page.name}
              </h1>
              {page.description && (
                <p className="mt-2 text-lg text-gray-600">{page.description}</p>
              )}
            </div>
          )}

          {/* Odoo CMS content rendered safely */}
          <div className="prose prose-sm sm:prose max-w-none">
            <OdooContent
              html={htmlContent}
              className="odoo-cms-content"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading CMS page:', error);
    notFound();
  }
}
