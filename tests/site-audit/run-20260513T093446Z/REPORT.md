# Site Audit Report (20260513T093446Z)

## Front-end routes (https://portlandialogistics.com)
- 200 OK: /, /about, /carriers, /blog, /contact, /quote, /services/ftl, /services/ltl, /services/intermodal, /services/drayage, /login, /sitemap.xml, /robots.txt
- 404 MISSING: /services/specialized, /privacy, /terms, /portal

## Back-end Odoo id.portlandialogistics.com
- /web/login 200, /web/database/selector 200, /web/health 200, /odoo 303 (redirect to /odoo/), /web/database/list 415 (POST-only), /website/info 200

## Back-end Odoo id.cassilly.capital
- / 200, /web/login 200, /web/database/selector 200, /web/health 200, /odoo 303, /web/database/list 415, /website/info 200

## Image audit
- Zero same-page duplicate image src on any audited route.
- No broken /images/* references detected.

## API endpoints (POST probes)
- /api/contact 400 (implemented, rejected dummy payload — working)
- /api/health 405 (implemented, GET-only)
- /api/quote 404 (NOT IMPLEMENTED)
- /api/carrier-signup 404 (NOT IMPLEMENTED)
- /api/newsletter 404 (NOT IMPLEMENTED)

## Action items
1. Build /services/specialized page (currently 404)
2. Build /privacy and /terms legal pages (currently 404)
3. Build /portal entry/redirect route (currently 404)
4. Implement /api/quote, /api/carrier-signup, /api/newsletter endpoints
