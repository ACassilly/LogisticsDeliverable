# Odoo CMS Integration - Quick Reference

## 🚀 Quick Start

### 1. Set Environment Variables
```bash
# .env.local
ODOO_URL=https://id.portlandialogistics.com
ODOO_DB=portlandia_logistics
ODOO_API_KEY=your_api_key_here
```

### 2. Available Routes

| Route | Purpose | Component | ISR |
|-------|---------|-----------|-----|
| `GET /api/cms/menus` | Website menus | JSON API | - |
| `GET /api/cms/company` | Company branding | JSON API | - |
| `GET /api/cms/pages` | All pages list | JSON API | - |
| `GET /api/cms/pages/[id]` | Page HTML content | JSON API | - |
| `/cms/*` | Dynamic CMS pages | Server | 60s |

### 3. Components

#### OdooContent (Client)
```typescript
import { OdooContent } from '@/components/cms';

<OdooContent html={htmlString} className="custom-class" />
```

#### OdooBranding (Client)
```typescript
import { OdooBranding } from '@/components/cms';

<OdooBranding 
  companyId={3}
  showLogo={true}
  showContact={true}
  showSocial={true}
/>
```

## 🪝 Custom Hooks

### useCompanyContact
```typescript
import { useCompanyContact } from '@/hooks';

const { contact, loading, error } = useCompanyContact(3);

// Returns:
{
  phone: "(502) 385-3399",
  email: "contact@example.com",
  city: "Louisville",
  state: "KY",
  zip: "40203",
  business_hours: "Mon-Fri: 8AM-6PM EST"
}
```

## 📚 Library Functions

### Server-Side (fetch at build time)
```typescript
import { getWebsitePages, getWebsiteMenus, getCompanyInfo, getOdooPageContent } from '@/lib';

// Get all pages for a website
const pages = await getWebsitePages(8);

// Get navigation menus
const menus = await getWebsiteMenus(8);

// Get company information
const company = await getCompanyInfo(3);

// Get specific page HTMLcontent
const html = await getOdooPageContent(pageId);
```

### Low-Level API (Odoo JSON-2)
```typescript
import { odooSearchRead, odooRead, odooCreate, odooWrite } from '@/lib';

// Search and read
const records = await odooSearchRead(
  'website.page',
  [['is_published', '=', true]],
  ['id', 'name', 'url']
);

// Read by IDs
const pages = await odooRead('website.page', [1, 2, 3], ['name', 'url']);

// Create new record
const id = await odooCreate('website.page', { name: 'New Page' });

// Update records
await odooWrite('website.page', [1], { name: 'Updated' });
```

## 🎨 Integration Points

### Footer (Auto-Synced)
```typescript
// Footer automatically fetches company data
<Footer /> // Uses useCompanyContact hook
```

### Dynamic CMS Pages
```typescript
// Automatically available at /cms/*
/cms/about → Odoo page with URL "/about"
/cms/services/ftl → Odoo page with URL "/services/ftl"
```

### Header/Navigation
```typescript
// Fetch menus to display navigation
const menus = await getWebsiteMenus();
```

## 🗂️ Odoo Models

| Model | Endpoint | Fields Used |
|-------|----------|------------|
| `website.menu` | `/json/2/model/website.menu/read_group` | id, name, url, sequence |
| `website.page` | `/json/2/model/website.page/read_group` | id, name, url, page_title, description |
| `res.company` | `/json/2/model/res.company/read` | name, phone, email, address, logo_web, social_* |
| `ir.ui.view` | `/json/2/model/ir.ui.view/read` | arch_db (HTML content) |

## 🔄 Data Flow Examples

### Example 1: Display Company Info in Footer
```
Footer Component
  ↓ (uses hook)
useCompanyContact Hook
  ↓ (fetches)
GET /api/cms/company?companyId=3
  ↓ (which calls)
/json/2/model/res.company/read
  ↓ (fetches from)
Odoo Database
  ↓ (returns)
{ phone, email, address, ... }
  ↓ (renders)
User sees company info
```

### Example 2: Serve Dynamic CMS Page
```
User visits /cms/about
  ↓
Page component receives slug=['about']
  ↓
Calls getWebsitePages(8)
  ↓
Matches page with URL="/about"
  ↓
Calls getOdooPageContent(pageId)
  ↓
Renders with OdooContent (sanitized)
  ↓
Cached for 60 seconds (ISR)
```

## 🛡️ Security Features

- ✅ XSS Protection via DOMPurify
- ✅ Bearer token authentication
- ✅ Database header validation
- ✅ HTML content sanitization
- ✅ Safe rendering of untrusted content

## ⚡ Performance

- ✅ ISR (60s revalidation)
- ✅ Static generation at build time
- ✅ No database queries for cached pages
- ✅ Fallback values for API failures
- ✅ Favicon caching

## 📋 Fallback Values

If Odoo API is unavailable, these values are used:

```typescript
{
  phone: '(502) 385-3399',
  email: 'connect@portlandialogistics.com',
  city: 'Louisville',
  state: 'KY',
  zip: '40203',
  business_hours: 'Mon-Fri: 8AM-6PM EST'
}
```

Edit `src/hooks/use-company-contact.ts` to customize.

## 🔍 Debugging

### Enable API Logging
```typescript
// In src/lib/odoo-cms.ts, add logging
console.log('Fetching pages:', domain);
```

### Check Environment Variables
```bash
echo $ODOO_URL
echo $ODOO_DB
echo $ODOO_API_KEY
```

### Test API Endpoint
```bash
curl -H "Authorization: Bearer $ODOO_API_KEY" \
     -H "X-Odoo-Database: $ODOO_DB" \
     https://id.portlandialogistics.com/json/2/model/res.company/read
```

### Monitor Build
```bash
NEXT_DEBUG=1 pnpm build
```

## 📁 File Structure

```
src/
├── lib/
│   ├── odoo-client.ts          # Low-level API client
│   └── odoo-cms.ts            # High-level CMS functions
├── app/
│   ├── (landing)/
│   │   ├── cms/[...slug]/
│   │   │   └── page.tsx        # Dynamic CMS pages
│   │   └── layout.tsx          # Landing wrapper
│   └── api/cms/
│       ├── menus/route.ts
│       ├── company/route.ts
│       ├── pages/route.ts
│       └── pages/[id]/route.ts
├── components/
│   ├── cms/
│   │   ├── OdooContent.tsx     # Renders HTML safely
│   │   ├── OdooBranding.tsx    # Displays company info
│   │   └── index.ts
│   └── landing/home/
│       └── footer.tsx          # Uses useCompanyContact
├── hooks/
│   ├── use-company-contact.ts  # Fetch company data
│   └── index.ts
└── types/
    └── (existing types)

Documentation/
├── ODOO_CMS_INTEGRATION.md     # Complete setup guide
├── FOOTER_ODOO_INTEGRATION.md  # Footer integration
├── CMS_DYNAMIC_ROUTING.md      # Dynamic pages guide
└── CMS_QUICK_REFERENCE.md      # This file
```

## 🚀 Deployment Checklist

- [ ] Set `ODOO_API_KEY` env var in production
- [ ] Verify `ODOO_URL` is accessible from deployment region
- [ ] Test all CMS pages render correctly
- [ ] Check footer displays company data
- [ ] Verify ISR revalidation working (wait 60s, refresh)
- [ ] Monitor API response times
- [ ] Enable CDN caching for static pages
- [ ] Set up error logging/monitoring

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check ODOO_API_KEY |
| 404 Not Found on /cms/* | Verify page exists in Odoo |
| Blank CSS/images | Check DOMPurify whitelist |
| Stale content | Wait 60s, clear .next cache |
| API timeouts | Check Odoo server connection |
| Footer shows fallback | Check ODOO_API_KEY set |

## 📖 Detailed Guides

- See `ODOO_CMS_INTEGRATION.md` for detailed API documentation
- See `FOOTER_ODOO_INTEGRATION.md` for footer customization
- See `CMS_DYNAMIC_ROUTING.md` for routing and caching details

## 🔗 Related Files

- API Client: `src/lib/odoo-client.ts`
- CMS Functions: `src/lib/odoo-cms.ts`
- Components: `src/components/cms/`
- Hooks: `src/hooks/use-company-contact.ts`
- Routes: `src/app/api/cms/` and `src/app/(landing)/cms/`
