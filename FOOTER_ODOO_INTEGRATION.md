# Footer Odoo CMS Integration

## Overview

The footer component has been updated to dynamically fetch company contact information from the Odoo CMS API instead of using hardcoded values. This ensures that changes made in Odoo are automatically reflected across the website.

## How It Works

### 1. Custom Hook: `useCompanyContact`

**Location:** `src/hooks/use-company-contact.ts`

A React hook that handles fetching company contact data from the `/api/cms/company` endpoint with automatic fallback to hardcoded defaults.

```typescript
const { contact, loading, error } = useCompanyContact(companyId);
```

**Features:**
- ✅ Automatic API fallback when Odoo is unavailable
- ✅ Graceful error handling with console warnings
- ✅ Loading state indicator
- ✅ Caches request with `cache: 'no-store'` for fresh data

**Return Object:**
```typescript
{
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    logo_web?: string;
    social_facebook?: string;
    social_twitter?: string;
    social_linkedin?: string;
    business_hours?: string;
  };
  loading: boolean;
  error: string | null;
}
```

### 2. Fallback Values

If the Odoo API is unavailable, the hook automatically falls back to these values:

```typescript
{
  phone: '(502) 385-3399',
  email: 'connect@portlandialogistics.com',
  address: 'Louisville',
  city: 'Louisville',
  state: 'KY',
  zip: '40203',
  business_hours: 'Mon-Fri: 8AM-6PM EST'
}
```

**Update Fallback Values:**
Edit `src/hooks/use-company-contact.ts` and update the `FALLBACK_COMPANY_CONTACT` constant.

### 3. Updated Footer Component

**Location:** `src/components/landing/home/footer.tsx`

The footer now uses the `useCompanyContact` hook to fetch company data:

```typescript
'use client';

export function Footer() {
  const { contact, loading } = useCompanyContact(3);
  
  return (
    // Desktop layout with contact data
    <li className="flex items-start gap-3">
      <Image src="/images/icons/phone.png" alt="Phone" width={16} height={16} />
      <p className="text-sm text-[var(--text-footer)]">{contact.phone}</p>
    </li>
    
    // Mobile accordion with contact data
    <p className="text-sm text-[var(--text-footer)]">{contact.phone}</p>
  );
}
```

**What Changed:**
- ✅ Replaced hardcoded phone: `(502) 385-3399` → `{contact.phone}`
- ✅ Replaced hardcoded email: `connect@portlandialogistics.com` → `{contact.email}`
- ✅ Replaced hardcoded address: `Louisville, KY 40203` → `{contact.city}, {contact.state} {contact.zip}`
- ✅ Updated both desktop (grid) and mobile (accordion) layouts

## Data Flow

```
Odoo CMS Database (res.company model)
         ↓
/api/cms/company endpoint (fetches from Odoo)
         ↓
useCompanyContact hook (with fallback)
         ↓
Footer Component (renders contact info)
         ↓
User sees company info on website
```

## Usage in Other Components

You can use the same `useCompanyContact` hook in other components:

```typescript
import { useCompanyContact } from '@/hooks';

export function Header() {
  const { contact, loading, error } = useCompanyContact(3);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <header>
      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
    </header>
  );
}
```

Or use the high-level `OdooBranding` component:

```typescript
import { OdooBranding } from '@/components/cms';

export function Header() {
  return (
    <header>
      <OdooBranding companyId={3} showLogo={true} showContact={true} />
    </header>
  );
}
```

## Updating Company Information in Odoo

### Steps:
1. Go to Odoo backend → Settings → Companies
2. Select your company (ID: 3 for Portlandia Logistics)
3. Update any of these fields:
   - **Phone** - Will appear in footer
   - **Email** - Will appear in footer
   - **Street** - Part of address in footer
   - **City** - Part of address in footer
   - **State** - Part of address in footer
   - **ZIP** - Part of address in footer
   - **Logo** - Can be used in `OdooBranding` component
   - **Social Media Links** - Can be used in `OdooBranding` component

4. Save changes
5. The footer will automatically reflect these changes on your next page load

## Error Handling

The integration handles errors gracefully:

```typescript
try {
  // Fetch from API
} catch (err) {
  console.warn('Error fetching company contact info, using fallback:', err);
  setContact(FALLBACK_COMPANY_CONTACT);
}
```

**Common Issues:**
- ❌ API returns 500 → Uses fallback values ✓
- ❌ Network timeout → Uses fallback values ✓
- ❌ Invalid JSON → Uses fallback values ✓
- ❌ Missing ODOO_API_KEY → Uses fallback values ✓

## Performance Considerations

- ✅ Hook does NOT cache between page loads (fresh data always)
- ✅ Only 1 API call per page visit (not per render)
- ⚠️ Consider caching strategies for high-traffic sites

**Optional: Add Caching**

Update the hook to cache for 5 minutes:

```typescript
const response = await fetch(`/api/cms/company?companyId=${companyId}`, {
  next: { revalidate: 300 } // Cache for 5 minutes
});
```

## Testing the Integration

### Test Default Fallback:
1. Ensure `ODOO_API_KEY` is NOT set in `.env.local`
2. Load the footer
3. Should display fallback values

### Test Live Odoo Data:
1. Set valid `ODOO_API_KEY` in `.env.local`
2. Change phone number in Odoo
3. Reload footer
4. New number should display

### Test Error Handling:
1. Set invalid `ODOO_API_KEY`
2. Load footer
3. Should display fallback with console warning

## Components Affected

- ✅ Footer: Desktop & Mobile layouts updated
- ✅ Landing layout: Uses updated footer automatically
- ⚠️ Other layouts: Update if they use custom footers

## Files Modified

```
src/
├── components/
│   └── landing/home/
│       └── footer.tsx (Updated to use useCompanyContact hook)
├── hooks/
│   ├── use-company-contact.ts (NEW - Custom hook)
│   └── index.ts (Added export)
└── api/cms/
    └── company/
        └── route.ts (Existing - no changes needed)
```

## Future Enhancements

- [ ] Add business hours config to Odoo company model
- [ ] Support multiple companies (header uses company A, footer uses company B)
- [ ] Cache company data in Redis/CDN
- [ ] Add Odoo company logo to header automatically
- [ ] Fetch all contact info from single component

## Troubleshooting

**Q: Footer still shows old phone number?**
A: Hard refresh browser (Ctrl+Shift+R). Check that ODOO_API_KEY is set.

**Q: Console shows API errors?**
A: Check ODOO_URL, ODOO_DB, and ODOO_API_KEY in `.env.local`

**Q: Changes in Odoo don't appear?**
A: Footer fetches fresh data on each page load. Clear browser cache if needed.

**Q: Want to customize fallback values?**
A: Edit `FALLBACK_COMPANY_CONTACT` in `src/hooks/use-company-contact.ts`
