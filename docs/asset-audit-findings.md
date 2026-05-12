# Asset Audit Findings

_Last updated: 2026-05-12. Source: scripts/qa/asset-audit.sh against https://portlandialogistics.com on commit 800a879+._

## Summary
- pages=6 (/, /about, /services, /services/intermodal, /contact, /login), assets=55, raw fails=33
- After ground-truth disk inspection, **real** broken/placeholder assets = 3 files.

## Real placeholders to replace
| File | Bytes | Issue |
|---|---|---|
| public/images/icons/location.png | 466 | Likely 1×1 placeholder |
| public/images/icons/phone.png | 442 | Likely 1×1 placeholder |
| public/images/logo/logo.svg | 229 | Placeholder SVG; canonical logo is logo.png (91 KB) |

## False positives (Next.js optimizer compressed variants)
The audit harness measures bytes returned by /_next/image, which serves AVIF/WebP variants. Files with real source bytes >10 KB but optimizer responses <500 B include:
- public/images/services/ltl.jpg (1.8 MB on disk)
- public/images/services/what-is-ltl.png (433 KB)
- public/images/services/ltl-hero.png (present)
- public/images/stay-updated.png (633 KB)
- public/images/stay-updated-mobile.png (347 KB)
- public/images/quote/trucks.png (present)
- public/images/icons/search.svg (267 B but valid small SVG icon)

## Stale external Unsplash URLs
Multiple homepage / blog Unsplash photo IDs (images.unsplash.com/photo-XXXXXX) return small/forbidden responses through the Next.js optimizer. The blog cards have been patched (commit 800a879) with a safe fallback resolver and now render clean placeholder cards instead of broken images / alt-text bleed-through.

## /portal role surfaces
All five auth-gated portals correctly redirect anonymous traffic with HTTP 307 to /login?redirect=%2Fportal%2F<role>:
- ADMIN, DISPATCHER, SHIPPER, CARRIER, LEADERSHIP
Probe log archived at audit/probe-roles-20260512-1925.log.

## Odoo portal branding residuals
- id.portlandialogistics.com header still shows 'Your Logo' placeholder + '+1 555-555-5556' default phone (footer/title/contact are correctly Portlandia-branded).
- id.cassilly.capital header still shows 'Your Logo' placeholder (phone, footer, title correctly Cassilly Capital-branded). 'Log in as superuser' link visible — should be disabled in production.
