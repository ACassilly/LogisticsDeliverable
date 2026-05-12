# Odoo CMS Dynamic Routing

## Overview

The CMS dynamic route allows Odoo website builder pages to be served directly through your Next.js application at `/cms/*` URLs. This creates a seamless integration where Odoo-managed content appears as native pages on your site.

## How It Works

### Route Structure

```
src/app/(landing)/cms/[...slug]/page.tsx
```

This is a **catch-all dynamic route** that handles:
- `/cms/about` → Serves Odoo page with URL `/about`
- `/cms/services/ftl` → Serves Odoo page with URL `/services/ftl`
- `/cms/blog/how-to-ship` → Serves Odoo page with URL `/blog/how-to-ship`

### URL Mapping

The route converts URL slugs to Odoo page URLs:

```typescript
/cms/about/team
  ↓
slug = ['about', 'team']
  ↓
pageUrl = '/about/team' (reconstructed)
  ↓
Matches Odoo page with URL field = '/about/team'
  ↓
Renders page content
```

## Features

### ✅ Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 60;
```

- Pages are cached for 60 seconds
- After 60 seconds, page is regenerated on next request
- Balances performance (cached pages) with freshness (updates every 60s)

### ✅ Static Path Generation

```typescript
export async function generateStaticParams()
```

- Pre-renders all published Odoo pages at build time
- Improves SEO and initial page load performance
- Falls back to on-demand generation for new pages

### ✅ Dynamic Metadata

```typescript
export async function generateMetadata()
```

- Generates SEO-friendly titles and descriptions
- Uses Odoo page title and description fields
- Supports Open Graph metadata

### ✅ Error Handling

```typescript
if (!page) {
  notFound(); // Returns 404 page
}
```

- Returns proper 404 for missing pages
- Gracefully handles API errors
- Logs warnings for debugging

### ✅ Security

- HTML content sanitized by `OdooContent` component using DOMPurify
- XSS protection built-in
- Safe rendering of untrusted HTML from Odoo

## Data Flow

```
User visits: /cms/about-us
       ↓
Next.js Router matches [..slug]
       ↓
page.tsx receives params: { slug: ['about-us'] }
       ↓
Reconstructs URL: /about-us
       ↓
Fetches from /api/cms/pages to find matching page
       ↓
Fetches page HTML from /api/cms/pages/[id]
       ↓
Renders with OdooContent (sanitized)
       ↓
User sees rendered page
```

## Usage

### Basic Usage

Simply visit any CMS route:
```
https://portlandialogistics.com/cms/about
https://portlandialogistics.com/cms/services/ltl
https://portlandialogistics.com/cms/contact-us
```

### Adding Links to CMS Pages

In your components, link to CMS pages:

```typescript
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/cms/about">About Us</Link>
      <Link href="/cms/services/ftl">FTL Services</Link>
      <Link href="/cms/contact-us">Contact</Link>
    </nav>
  );
}
```

### Programmatic Access

Fetch and display CMS pages in other components:

```typescript
import { getWebsitePages } from '@/lib/odoo-cms';

export async function PageList() {
  const pages = await getWebsitePages();
  
  return (
    <ul>
      {pages.map(page => (
        <li key={page.id}>
          <a href={`/cms${page.url}`}>{page.name}</a>
        </li>
      ))}
    </ul>
  );
}
```

## Creating Pages in Odoo

### Steps to Create a CMS Page

1. **In Odoo Backend:**
   - Go to: Website → Website Pages
   - Click "Create"
   - Fill in:
     - **Name**: "About Us" (internal name)
     - **Page Title**: "About Portlandia Logistics" (for SEO)
     - **Description**: "Learn about our company..." (for meta tags)
     - **URL**: "/about-us" (must start with `/`)
     - **Published**: Check this box
   - Design page content using Odoo builder
   - Save

2. **Access on Website:**
   - Page automatically available at: `https://yoursite.com/cms/about-us`

### Important Fields

| Odoo Field | Used For | Required |
|-----------|----------|----------|
| Name | Page list, display | ✓ |
| Page Title | `<title>` tag, SEO | ✓ |
| Description | Meta description tag | ✓ |
| URL | Route matching | ✓ |
| Published | Page visibility | ✓ |
| arch_db | Page HTML content | ✓ |

## Performance

### Caching Strategy

**Build Time:**
- All published pages pre-rendered
- Static files served instantly
- Zero server processing needed

**After 60 Seconds:**
- Page marked as stale
- Next visitor triggers regeneration
- Updated content fetched from Odoo
- Page cached again for 60 seconds

### Optimization Tips

**Reduce Revalidation Time:**
```typescript
// Revalidate every 30 seconds
export const revalidate = 30;
```

**Increase Revalidation Time:**
```typescript
// Revalidate every 5 minutes
export const revalidate = 300;
```

**Disable ISR (Always Serve Latest):**
```typescript
export const revalidate = 0; // Dynamic rendering
```

## Styling

### Inherits Landing Layout

The CMS page inherits styling from `src/app/(landing)/layout.tsx`:
- Header automatically included
- Footer automatically included
- Global styles applied
- Responsive design maintained

### Custom CMS Content Styling

The content is wrapped with prose classes for readability:

```typescript
<div className="prose prose-sm sm:prose max-w-none">
  <OdooContent html={htmlContent} className="odoo-cms-content" />
</div>
```

**To customize CMS content styling**, edit `src/app/(landing)/cms/[...slug]/page.tsx`:

```typescript
// Change container max-width
<div className="max-w-4xl mx-auto px-4 py-12">

// Add custom background
<div className="bg-gray-50 py-12">

// Modify prose styling
<div className="prose prose-lg sm:prose-xl">
```

## Troubleshooting

### Page Not Found (404)

**Problem:** `/cms/about` returns 404

**Solutions:**
1. Verify page exists in Odoo and is published
2. Check the **exact URL** in Odoo matches (case-sensitive)
3. Ensure page URL starts with `/` (e.g., `/about` not `about`)
4. Check `ODOO_API_KEY` is set correctly

### Blank/No Content

**Problem:** Page loads but shows no content

**Solutions:**
1. Verify page HTML content in Odoo (arch_db field)
2. Check browser console for sanitization warnings
3. Review DOMPurify whitelist in `OdooContent` component

### Page Takes Long to Load

**Problem:** First visit very slow, subsequent requests fast

**Reason:** First visit triggers static page generation (ISR)

**Solutions:**
1. Run build to pre-generate all pages: `pnpm build`
2. Increase ISR revalidation time if you don't need fresh content
3. Consider caching in CDN/reverse proxy

### Old Content Still Showing

**Problem:** Changed content in Odoo but site still shows old version

**Solutions:**
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `pnpm build && pnpm start`
3. Wait 60+ seconds for ISR revalidation
4. In development, hard-refresh browser (Ctrl+Shift+R)

## API Endpoints Used

This route depends on:

- `GET /api/cms/pages` - Lists all pages
- `GET /api/cms/pages/[id]` - Gets page HTML content

Both endpoints are automatically called by `getWebsitePages()` and `getOdooPageContent()`.

## Files

```
src/app/(landing)/
├── cms/
│   └── [...slug]/
│       └── page.tsx (NEW - Dynamic CMS page)
└── layout.tsx (Inherited - provides Header/Footer)

src/lib/
├── odoo-cms.ts (Used - CMS functions)
└── odoo-client.ts (Used - API client)

src/components/
├── cms/
│   └── OdooContent.tsx (Used - HTML sanitization)
└── landing/home/
    └── header.tsx (Inherited)
    └── footer.tsx (Inherited)
```

## Environment Variables Required

```env
ODOO_URL=https://id.portlandialogistics.com
ODOO_DB=portlandia_logistics
ODOO_API_KEY=your_api_token_here
```

## Examples

### Example 1: Create "Services" Page

**In Odoo:**
- Name: "Our Services"
- Title: "Freight & Logistics Services"
- URL: `/services`
- Add rich content with images, text, CTAs

**Result:**
- Available at: `https://yoursite.com/cms/services`
- Automatically listed in content indexes

### Example 2: Create "Case Study" Subpage

**In Odoo:**
- Name: "Case Study: First Customer"
- Title: "How We Reduced Costs by 30%"
- URL: `/case-studies/customer-1`
- Add testimonial, metrics, results

**Result:**
- Available at: `https://yoursite.com/cms/case-studies/customer-1`

### Example 3: Link to CMS Page

```typescript
// In your component
<Link href="/cms/services">View Our Services</Link>
```

## Future Enhancements

- [ ] Add breadcrumb navigation (auto-generated from slug)
- [ ] Add "Recently Updated" pages section
- [ ] Add page author/modification date from Odoo
- [ ] Add related pages section
- [ ] Implement sitemap generation for SEO
- [ ] Add page view analytics
- [ ] Add "Edit in Odoo" link for admins

## Support

For issues or questions:
1. Check `/ODOO_CMS_INTEGRATION.md` for general CMS setup
2. Check `/FOOTER_ODOO_INTEGRATION.md` for hook usage
3. Review Odoo CMS API at `/api/cms/pages`
