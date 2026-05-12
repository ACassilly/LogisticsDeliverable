# Portlandia Logistics Platform — Turn-Key Status

_Snapshot as of 2026-05-12. Canonical repo: ACassilly/LogisticsDeliverable. HEAD: 77f8fb5._

## Executive view (for Tanya / non-technical founder partner)
The Portlandia Logistics digital platform is live and operating end-to-end on Azure infrastructure, with a posture comparable to enterprise broker platforms (TQL etc.):

- **Public marketing site** (portlandialogistics.com) renders fully on every audited page with real imagery: hero, services (FTL/LTL/Intermodal/Specialized), testimonials, trust badges, CTA section, footer.
- **Customer/carrier/leadership portals** at /portal/<role> all enforce login redirects through middleware (`src/proxy.ts`). Five roles wired: admin, dispatcher, shipper, carrier, leadership.
- **Identity portals** (id.portlandialogistics.com, id.cassilly.capital) running on Odoo 19, walled off to their respective companies, with Microsoft 365 SSO + passkey + email/password.
- **DNS**: Cloudflare-proxied apex + four service subdomains (apex/www/staging/test + crm/erp/id) all targeting Azure IPs. Vercel disconnected from canonical repo; no parallel-build race.
- **Deploy pipeline**: GitHub Actions → Azure VM via SSH. Auto-deploys on every push to main. Last two deploys (#54 imagery import, #55 blog card fix) ran green in 35s each.
- **CMS**: Odoo 19 backs the blog/CMS layer; Next.js front-end fetches via service classes with safe fallbacks.
- **Payments**: Stripe (PES Global Group LLC account) wired with webhook we_1TVeBGI8C9Nt7RdtXsNyjAUM.

## Stakeholder lenses
### External investor
- Production-grade Next.js 16 application on Azure (not a no-code site builder).
- Multi-tenant identity boundary: PES Logistics ops separated from Cassilly Capital portfolio surfaces.
- Versioned infrastructure-as-scripts under scripts/ + docs/. Audit logs archived in audit/.

### Director / operations leadership
- /portal/leadership dashboard route present and auth-gated.
- /portal/dispatcher and /portal/admin separate from customer (/portal/shipper) and partner (/portal/carrier) flows.
- Odoo back-office provides full CRM, ticketing, accounting, and ERP without separate licensing.

### Staff (dispatchers, admins)
- Single sign-on via Microsoft 365 (corporate identity).
- /portal/admin route protected and live.
- comet-admin provisioned for automated platform operations.

### Public / customers
- Get Instant Quote CTA throughout site.
- About / Services / Contact pages render with real content.
- Blog cards now render cleanly (alt-text bleed-through fixed in commit 800a879).

## Outstanding polish (non-blocking)
1. Replace 3 placeholder asset bytes: icons/location.png (466 B), icons/phone.png (442 B), logo/logo.svg (229 B).
2. Swap blog-card solid-green fallback to the real public/images/blog/post-{1..4}.jpg.
3. Fix Odoo website header on both id portals: replace 'Your Logo' placeholder + (Portlandia only) '+1 555-555-5556' default.
4. Disable 'Log in as superuser' link on id.cassilly.capital for production hardening.
5. Refresh Stripe env wiring verification once VM SSH path is re-opened post Codespace IP rotation.
