# Odoo Headless CMS Integration

This integration provides a headless Odoo website builder for your Next.js application, leveraging Odoo 19's JSON-2 API for seamless content management.

## Overview

The integration consists of:
- **Odoo Client** - Low-level API client for Odoo 19 JSON-2 endpoint
- **CMS Module** - High-level functions for fetching website content
- **API Routes** - Next.js endpoints for client-side data fetching
- **React Components** - Pre-built components for rendering Odoo content

## Environment Variables

Add these to your `.env.local`:

```env
ODOO_URL=https://id.portlandialogistics.com
ODOO_DB=portlandia_logistics
ODOO_API_KEY=your_api_token_here
```

### Variable Defaults
- `ODOO_URL`: Defaults to `https://id.portlandialogistics.com`
- `ODOO_DB`: Defaults to `portlandia_logistics`
- `ODOO_API_KEY`: Required, no default (must be set)

## Architecture

### 1. Low-Level API Client (`src/lib/odoo-client.ts`)

The Odoo client handles authentication and API communication using Odoo 19's JSON-2 endpoint.

**Key Features:**
- Bearer token authentication via `Authorization: Bearer {ODOO_API_KEY}` header
- X-Odoo-Database header for multi-database support
- Helper functions for CRUD operations

**Exported Functions:**

```typescript
// Search and read records
odooSearchRead(model: string, domain: any[], fields: string[]): Promise<any[]>

// Read specific records by IDs
odooRead(model: string, ids: number[], fields: string[]): Promise<any[]>

// Create a new record
odooCreate(model: string, values: Record<string, any>): Promise<number>

// Update records
odooWrite(model: string, ids: number[], values: Record<string, any>): Promise<boolean>

// Portal group mapping (preserved from original)
PORTAL_GROUP_MAP: Record<string, string>
```

### 2. CMS Module (`src/lib/odoo-cms.ts`)

High-level functions for fetching website content from Odoo models.

**Exported Functions:**

```typescript
// Get website navigation menus
getWebsiteMenus(websiteId?: number): Promise<any[]>
// Default websiteId: 8

// Get published website pages
getWebsitePages(websiteId?: number): Promise<any[]>
// Default websiteId: 8

// Get company branding information
getCompanyInfo(companyId?: number): Promise<any>
// Default companyId: 3
// Returns: name, phone, email, website, address, logo, social media

// Get page content HTML
getOdooPageContent(pageId: number): Promise<string>
// Returns: arch_db field (XML/HTML content)
```

### 3. API Routes

REST endpoints for client-side data fetching:

#### GET `/api/cms/menus`
Returns website navigation menus.

**Query Parameters:**
- `websiteId` (optional): Website ID (default: 8)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Home",
      "url": "/home",
      "sequence": 1,
      "menu_type": "link"
    }
  ]
}
```

#### GET `/api/cms/company`
Returns company branding information.

**Query Parameters:**
- `companyId` (optional): Company ID (default: 3)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Portlandia Logistics",
    "phone": "+1-555-0123",
    "email": "info@portlandia.com",
    "website": "https://portlandialogistics.com",
    "street": "123 Main St",
    "city": "Portland",
    "zip": "97201",
    "logo_web": "base64_encoded_image_or_url",
    "social_facebook": "https://facebook.com/portlandia",
    "social_twitter": "https://twitter.com/portlandia",
    "social_linkedin": "https://linkedin.com/company/portlandia"
  }
}
```

#### GET `/api/cms/pages`
Lists all published website pages.

**Query Parameters:**
- `websiteId` (optional): Website ID (default: 8)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "About Us",
      "url": "/about",
      "page_title": "About Portlandia Logistics",
      "description": "Learn about our company..."
    }
  ]
}
```

#### GET `/api/cms/pages/[id]`
Gets HTML content for a specific page.

**URL Parameters:**
- `id`: Page ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "html": "<div class=\"page-content\">...</div>"
  }
}
```

## React Components

### OdooContent

Safely renders HTML content from Odoo with sanitization via DOMPurify.

**Location:** `src/components/cms/OdooContent.tsx`

**Usage:**
```typescript
import { OdooContent } from '@/components/cms';

export function MyPage() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/api/cms/pages/42')
      .then(r => r.json())
      .then(data => setHtml(data.data.html));
  }, []);

  return <OdooContent html={html} className="prose max-w-none" />;
}
```

**Props:**
```typescript
interface OdooContentProps {
  html?: string;           // HTML content to render
  className?: string;      // CSS classes for the container
}
```

**Security Features:**
- DOMPurify sanitization prevents XSS attacks
- Configurable whitelist of allowed HTML tags
- Allowed attributes: href, src, alt, title, class, id, style, etc.

### OdooBranding

Fetches and displays company branding information (logo, contact, social links).

**Location:** `src/components/cms/OdooBranding.tsx`

**Usage (Header Example):**
```typescript
import { OdooBranding } from '@/components/cms';

export function Header() {
  return (
    <header className="bg-white p-4">
      <OdooBranding 
        companyId={3}
        showLogo={true}
        showContact={false}
        showSocial={true}
        className="flex items-center gap-4"
      />
    </header>
  );
}
```

**Usage (Footer Example):**
```typescript
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-8">
      <OdooBranding 
        companyId={3}
        className="mb-8"
      />
    </footer>
  );
}
```

**Props:**
```typescript
interface OdooBrandingProps {
  companyId?: number;      // Company ID (default: 3)
  className?: string;      // CSS classes for container
  showLogo?: boolean;      // Display company logo (default: true)
  showContact?: boolean;   // Display contact info (default: true)
  showSocial?: boolean;    // Display social links (default: true)
}
```

**Displays:**
- Company logo
- Company name
- Contact information (address, phone, email)
- Social media links (Facebook, Twitter, LinkedIn)

## Usage Examples

### Fetching Menus Client-Side

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getWebsiteMenus } from '@/lib';

export function Navigation() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    getWebsiteMenus(8).then(setMenus);
  }, []);

  return (
    <nav>
      {menus.map(menu => (
        <a key={menu.id} href={menu.url}>{menu.name}</a>
      ))}
    </nav>
  );
}
```

### Fetching Content Server-Side

```typescript
import { getWebsitePages, getOdooPageContent } from '@/lib';

export async function generateStaticParams() {
  const pages = await getWebsitePages(8);
  return pages.map(page => ({ slug: page.url }));
}

export async function Page({ params }: { params: { slug: string } }) {
  const pages = await getWebsitePages(8);
  const page = pages.find(p => p.url === `/${params.slug}`);
  
  if (!page) return <div>Page not found</div>;
  
  const html = await getOdooPageContent(page.id);
  
  return <OdooContent html={html} />;
}
```

## Odoo Models Used

- `website.menu` - Navigation menus
- `website.page` - CMS pages
- `res.company` - Company information
- `ir.ui.view` - Page content/views

## Error Handling

All functions include try-catch blocks and return sensible defaults:

```typescript
// Returns empty array on error
getWebsiteMenus(8).catch(() => [])

// Returns null on error
getCompanyInfo(3).catch(() => null)

// Returns empty string on error
getOdooPageContent(42).catch(() => '')
```

API routes return structured error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Installation Notes

- **DOMPurify**: Automatically installed via `pnpm add dompurify`
- **TypeScript Types**: `@types/dompurify` installed as dev dependency

## Security Considerations

1. **HTML Sanitization**: All user-generated HTML is sanitized with DOMPurify
2. **API Authentication**: Bearer token in X-Odoo-Database headers
3. **CORS**: Configure as needed for your Odoo instance
4. **Rate Limiting**: Consider implementing for production use

## Troubleshooting

**401 Unauthorized**
- Verify `ODOO_API_KEY` is correct
- Check `ODOO_URL` is accessible

**404 Not Found**
- Verify website/page/company IDs exist in Odoo
- Check `ODOO_DB` name is correct

**Empty Content**
- Verify records are published in Odoo
- Check field names match Odoo model schema

## Next Steps

1. Set environment variables in `.env.local`
2. Test API endpoints: `curl http://localhost:3000/api/cms/company`
3. Integrate components into your pages
4. Configure DOMPurify whitelist as needed for your content
