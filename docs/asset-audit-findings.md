# Live front-end asset audit (portlandialogistics.com)

_Run: 2026-05-12T14:00 EDT via `scripts/qa/asset-audit.sh` plus visual review._

## Result
- Pages crawled: 6
- Assets checked: 54
- Failures: 36

## Failures by class
1. **Local icon placeholders (172 bytes each)** under `public/images/icons/`:
   - `clock.png`, `email.png`, `location.png`, `phone.png`
   - These render as broken / tiny images on `/`, `/services`, `/services/intermodal`.
2. **Local search icon** `images/icons/search.svg` (242 bytes — minimal SVG, may be intentional).
3. **Local logo SVG** `images/logo/logo.svg` (229 bytes — placeholder).
4. **Blog post tile placeholders** `public/images/blog/post-{1..4}.jpg` (286 bytes each) — not referenced by home page (home uses Unsplash URLs), but referenced elsewhere.
5. **Unsplash optimizer 404** — one Unsplash photo id returns 404 through `_next/image` while sibling ids succeed; appears to be a stale id in a blog data file.
6. **`images/stay-updated.png` / `images/stay-updated-mobile.png`** — 1×1 placeholders, render as flat grey CTA panel at bottom of home.

## Visual regressions verified on live home page
- Hero ✅ (green truck fleet stock photo renders clean)
- Stats + trust icons ✅
- Services tabs (FTL) ✅
- Testimonials ✅
- **Blog cards ❌** — alt-text bleed-through; no image renders. Likely the stale Unsplash id returning 404.
- FAQ ✅
- **Stay Updated CTA ❌** — flat dark-grey panel (placeholder).
- Footer ✅ (real phone, email, address, operating notice)

## Reference-repo comparison status
- The previously cited reference repo `mk-muzzammil/LogisticsDeliverable` is **not accessible** from the active Codespace identity:
  - GitHub returns 404 for both `mk-muzzammil/LogisticsDeliverable` and `MK-Muzzammil/LogisticsDeliverable`.
  - `gh repo list mk-muzzammil --limit 200` shows no logistics-related repository (only Whatsapp-Clone, Personal-Portfolio, E-commerce-Auction, AI-Powered-SAAS-Platform-NextJS, etc.).
  - The canonical repo `ACassilly/LogisticsDeliverable` is not a fork and has no GitHub-visible parent or public forks.
- Asset reconciliation will therefore proceed from authoritative free stock (Unsplash) and in-repo assets, not from a reference repo.

## Odoo portal rebrand status (id.portlandialogistics.com)
- Top nav pruned to {Home, Contact us} (Shop/Events/Forum/Blog/Courses/Appointment/Jobs unlinked).
- Per-website overrides created scoped to `website_id=8`:
  - `website.footer_custom` → view 6993 (About copy, contact email/phone).
  - `website.header_text_element` → view 6994 (header phone).
  - `website.contactus` → view 6995 (page email/phone).
- Company record (id 3) and partner updated to real Portlandia Logistics phone/email/website.
- **Outstanding on Odoo:** header still renders the "Your Logo" placeholder PNG and a top-bar `+1 555-555-5556` from a different snippet than view 1603. Need to (a) re-attempt `website.logo` write via `ir.attachment`/`image_1920` so the bytes actually replace the served SVG, and (b) locate the qweb fragment rendering the visible header phone (likely a `s_text_block` saved on a website-scoped page rather than view 1603).

## Update (post user note: "muzzammil was copied in as a zip")
- Filesystem-wide search of the current Codespace for `*muzz*`, `*muzammil*`, `*.zip`, `*.tar*`, `*.tgz` outside Go stdlib testdata: **no muzzammil zip is present on this Codespace.** It was almost certainly on the previous (stopped) Codespace.
- However, the prior muzzammil sync **was committed** to the canonical repo: commit **`8da36e2 feat(assets): sync missing public/ assets from muzzammil source`**. Git history confirms the absorbed file set under `public/images/{icons,logo,quote,services}/...` and `public/site.webmanifest`.
- Therefore the muzzammil-shipped files we observe today (`icons/{clock,email,phone,location}.png` at 172 B, `blog/post-{1..4}.jpg` at 286 B, `stay-updated.png` 1×1, `logo/logo.svg` 229 B) **are the muzzammil-original stubs**, not regressions on our side. They were placeholders in the muzzammil source.
- Action: source real raster images for these slots (icons via lucide/heroicons set, blog tiles via Unsplash or in-house photography, stay-updated CTA via Unsplash). No reference repo to copy from exists.
